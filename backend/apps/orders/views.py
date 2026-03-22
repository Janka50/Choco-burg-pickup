from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.permissions import IsAdminUser
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer, ApproveRejectSerializer


class CustomerOrderListCreateView(generics.ListCreateAPIView):
    """Customer: list own orders and create new order."""
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CustomerOrderDetailView(generics.RetrieveAPIView):
    """Customer: view own order details."""
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class CustomerCancelOrderView(APIView):
    """Customer: cancel a PENDING order."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response(
                {'detail': 'Only pending orders can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = Order.Status.CANCELLED
        order.save()
        return Response(OrderSerializer(order).data)


# Admin Views

class AdminOrderListView(generics.ListAPIView):
    """Admin: list all orders, filterable by status."""
    serializer_class = OrderSerializer
    permission_classes = (IsAdminUser,)

    def get_queryset(self):
        qs = Order.objects.all().select_related('user').prefetch_related('items')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        return qs


class AdminOrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all().select_related('user').prefetch_related('items')
    serializer_class = OrderSerializer
    permission_classes = (IsAdminUser,)


class AdminApproveRejectOrderView(APIView):
    """Admin: approve or reject a pending order."""
    permission_classes = (IsAdminUser,)

    @transaction.atomic
    def patch(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response(
                {'detail': f'Order is already {order.status}. Only PENDING orders can be reviewed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ApproveRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data['action']

        if action == 'approve':
            # Deduct stock atomically
            for item in order.items.select_related('product'):
                if item.product is None:
                    order.status = Order.Status.REJECTED
                    order.save()
                    return Response(
                        {'detail': f'Product for item "{item.product_name}" no longer exists. Order rejected.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                from apps.products.models import Product
                product = Product.objects.select_for_update().get(pk=item.product.pk)

                if product.stock_quantity < item.quantity:
                    order.status = Order.Status.REJECTED
                    order.save()
                    return Response(
                        {
                            'detail': f'Insufficient stock for "{product.name}". '
                                      f'Available: {product.stock_quantity}, Required: {item.quantity}. '
                                      f'Order auto-rejected.'
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                product.stock_quantity -= item.quantity
                product.save()

            order.status = Order.Status.APPROVED
        else:
            order.status = Order.Status.REJECTED

        order.save()
        return Response(OrderSerializer(order).data)


class AdminCompleteOrderView(APIView):
    """Admin: mark an approved order as completed (picked up)."""
    permission_classes = (IsAdminUser,)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.APPROVED:
            return Response(
                {'detail': 'Only APPROVED orders can be marked as completed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = Order.Status.COMPLETED
        order.save()
        return Response(OrderSerializer(order).data)
