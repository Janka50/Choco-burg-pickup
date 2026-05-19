from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.users.permissions import IsAdminUser
from .models import POSSession, POSSale, POSSaleItem
from .serializers import (
    POSSessionSerializer, POSSaleSerializer, CreatePOSSaleSerializer
)


# ── Sessions ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAdminUser])
def open_session(request):
    active = POSSession.objects.filter(
        cashier=request.user, is_active=True
    ).first()
    if active:
        return Response(POSSessionSerializer(active).data)
    session = POSSession.objects.create(
        cashier=request.user,
        opening_float=request.data.get('opening_float', 0)
    )
    return Response(POSSessionSerializer(session).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def close_session(request, pk):
    try:
        session = POSSession.objects.get(pk=pk, cashier=request.user, is_active=True)
    except POSSession.DoesNotExist:
        return Response({'error': 'Active session not found.'}, status=404)
    session.closed_at = timezone.now()
    session.is_active = False
    session.closing_float = request.data.get('closing_float', 0)
    session.save()
    return Response(POSSessionSerializer(session).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def current_session(request):
    session = POSSession.objects.filter(
        cashier=request.user, is_active=True
    ).first()
    if not session:
        return Response({'session': None})
    return Response(POSSessionSerializer(session).data)


# ── Sales ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_sale(request):
    session = POSSession.objects.filter(
        cashier=request.user, is_active=True
    ).first()
    if not session:
        return Response(
            {'error': 'No active POS session. Please open a session first.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = CreatePOSSaleSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    with transaction.atomic():
        sale = POSSale.objects.create(
            session=session,
            cashier=request.user,
            payment_method=data['payment_method'],
            total_amount=data['total_amount'],
            amount_paid=data['amount_paid'],
            change_given=data['amount_paid'] - data['total_amount'],
            customer_name=data.get('customer_name', ''),
        )
        for item_data in data['validated_items']:
            product = item_data['product']
            POSSaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=item_data['quantity'],
            )
            # Deduct stock atomically
            product.__class__.objects.filter(pk=product.pk).update(
                stock_quantity=product.stock_quantity - item_data['quantity']
            )

    return Response(POSSaleSerializer(sale).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_sales(request):
    session_id = request.query_params.get('session')
    sales = POSSale.objects.select_related('cashier', 'session').prefetch_related('items')
    if session_id:
        sales = sales.filter(session_id=session_id)
    return Response(POSSaleSerializer(sales, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def sale_detail(request, pk):
    try:
        sale = POSSale.objects.prefetch_related('items').get(pk=pk)
    except POSSale.DoesNotExist:
        return Response({'error': 'Sale not found.'}, status=404)
    return Response(POSSaleSerializer(sale).data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def void_sale(request, pk):
    try:
        sale = POSSale.objects.get(pk=pk, is_voided=False)
    except POSSale.DoesNotExist:
        return Response({'error': 'Sale not found or already voided.'}, status=404)

    with transaction.atomic():
        # Restore stock
        for item in sale.items.select_related('product'):
            item.product.__class__.objects.filter(pk=item.product.pk).update(
                stock_quantity=item.product.stock_quantity + item.quantity
            )
        sale.is_voided = True
        sale.void_reason = request.data.get('reason', '')
        sale.save()

    return Response(POSSaleSerializer(sale).data)


# ── Analytics ─────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminUser])
def analytics(request):
    from django.db.models import Sum, Count
    from datetime import date, timedelta

    today = date.today()
    week_ago = today - timedelta(days=7)

    sales_qs = POSSale.objects.filter(is_voided=False)

    today_stats = sales_qs.filter(
        created_at__date=today
    ).aggregate(
        revenue=Sum('total_amount'),
        count=Count('id')
    )

    week_stats = sales_qs.filter(
        created_at__date__gte=week_ago
    ).aggregate(
        revenue=Sum('total_amount'),
        count=Count('id')
    )

    top_products = POSSaleItem.objects.filter(
        sale__is_voided=False,
        sale__created_at__date__gte=week_ago
    ).values('product_name').annotate(
        total_qty=Sum('quantity'),
        total_revenue=Sum('subtotal')
    ).order_by('-total_qty')[:5]

    return Response({
        'today': {
            'revenue': today_stats['revenue'] or 0,
            'sales_count': today_stats['count'] or 0,
        },
        'this_week': {
            'revenue': week_stats['revenue'] or 0,
            'sales_count': week_stats['count'] or 0,
        },
        'top_products': list(top_products),
    })
