from rest_framework import serializers
from django.db import transaction
from .models import POSSession, POSSale, POSSaleItem
from apps.products.models import Product


class POSSaleItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class POSSaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSSaleItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal')


class POSSaleSerializer(serializers.ModelSerializer):
    items = POSSaleItemSerializer(many=True, read_only=True)
    cashier_email = serializers.CharField(source='cashier.email', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True
    )

    class Meta:
        model = POSSale
        fields = (
            'id', 'receipt_number', 'cashier_email', 'session',
            'payment_method', 'payment_method_display',
            'total_amount', 'amount_paid', 'change_given',
            'customer_name', 'items', 'created_at', 'is_voided'
        )


class CreatePOSSaleSerializer(serializers.Serializer):
    items = POSSaleItemInputSerializer(many=True, min_length=1)
    payment_method = serializers.ChoiceField(choices=['CASH', 'CARD', 'TRANSFER'])
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    customer_name = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, data):
        validated_items = []
        total = 0
        for item in data['items']:
            try:
                product = Product.objects.get(pk=item['product_id'], is_available=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    f"Product {item['product_id']} not found or unavailable."
                )
            if product.stock_quantity < item['quantity']:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. "
                    f"Available: {product.stock_quantity}"
                )
            subtotal = product.price * item['quantity']
            total += subtotal
            validated_items.append({
                'product': product,
                'quantity': item['quantity'],
                'subtotal': subtotal,
            })
        data['validated_items'] = validated_items
        data['total_amount'] = total
        if data['amount_paid'] < total:
            raise serializers.ValidationError(
                f"Amount paid (₦{data['amount_paid']}) is less than total (₦{total})."
            )
        return data


class POSSessionSerializer(serializers.ModelSerializer):
    cashier_email = serializers.CharField(source='cashier.email', read_only=True)
    total_sales = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = POSSession
        fields = (
            'id', 'cashier_email', 'opened_at', 'closed_at',
            'opening_float', 'closing_float', 'is_active',
            'total_sales', 'total_revenue'
        )

    def get_total_sales(self, obj):
        return obj.sales.filter(is_voided=False).count()

    def get_total_revenue(self, obj):
        from django.db.models import Sum
        result = obj.sales.filter(is_voided=False).aggregate(Sum('total_amount'))
        return result['total_amount__sum'] or 0
