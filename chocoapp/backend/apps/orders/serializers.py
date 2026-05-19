from django.db import transaction
from rest_framework import serializers

from apps.products.models import Product
from .models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price_snapshot', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'user_email', 'status', 'total_price',
            'notes', 'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'status', 'total_price', 'created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must have at least one item.")
        return items

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data['items']
        notes = validated_data.get('notes', '')

        total = 0
        order_items = []

        for item_data in items_data:
            try:
                product = Product.objects.select_for_update().get(
                    id=item_data['product_id'],
                    is_available=True,
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product ID {item_data['product_id']} not found or unavailable."
                )

            # Validate stock exists (not deducted yet — happens on approval)
            if product.stock_quantity < item_data['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, Requested: {item_data['quantity']}"
                )

            subtotal = product.price * item_data['quantity']
            total += subtotal
            order_items.append({
                'product': product,
                'product_name': product.name,
                'quantity': item_data['quantity'],
                'price_snapshot': product.price,
            })

        order = Order.objects.create(
            user=user,
            total_price=total,
            notes=notes,
        )

        for item in order_items:
            OrderItem.objects.create(order=order, **item)

        return order


class ApproveRejectSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
