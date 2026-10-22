import csv

from django.http import HttpResponse
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminUser
from . import services

EXPORT_LIMIT = 5000


def _filters_or_400(request):
    try:
        return services.parse_filters(request.query_params), None
    except ValueError as exc:
        return None, Response({'detail': str(exc)}, status=400)


class MyTransactionListView(APIView):
    """Customer: own online orders, newest first."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        filters, error = _filters_or_400(request)
        if error:
            return error
        orders, sales = services.build_querysets(filters, only_user=request.user)
        limit, offset = services.parse_paging(request.query_params)
        total, records = services.get_page(orders, sales, limit, offset)
        return Response({'count': total, 'limit': limit, 'offset': offset, 'results': records})


class AdminTransactionListView(APIView):
    """Admin: online orders + POS sales together, with filters and totals."""
    permission_classes = (IsAdminUser,)

    def get(self, request):
        filters, error = _filters_or_400(request)
        if error:
            return error
        orders, sales = services.build_querysets(filters)
        limit, offset = services.parse_paging(request.query_params)
        total, records = services.get_page(orders, sales, limit, offset)
        return Response({
            'count': total, 'limit': limit, 'offset': offset,
            'summary': services.summary(orders, sales),
            'results': records,
        })


def _csv_safe(value):
    text = '' if value is None else str(value)
    # stop spreadsheet apps treating user-entered text as a formula
    return "'" + text if text[:1] in ('=', '+', '-', '@') else text


class AdminTransactionExportView(APIView):
    """Admin: same filters as the list, returned as a CSV file."""
    permission_classes = (IsAdminUser,)

    def get(self, request):
        filters, error = _filters_or_400(request)
        if error:
            return error
        orders, sales = services.build_querysets(filters)
        _, records = services.get_page(orders, sales, EXPORT_LIMIT, 0)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Date (UTC)', 'Reference', 'Type', 'Status', 'Payment method',
            'Payment status', 'Customer', 'Handled by', 'Items', 'Total',
        ])
        for r in records:
            items = '; '.join(f"{i['quantity']} x {i['name']}" for i in r['items'])
            writer.writerow([
                _csv_safe(r['created_at'].strftime('%Y-%m-%d %H:%M')),
                _csv_safe(r['reference']), r['type'], r['status'],
                r['payment_method'], r['payment_status'],
                _csv_safe(r['customer']), _csv_safe(r['handled_by']),
                _csv_safe(items), r['total'],
            ])
        return response
