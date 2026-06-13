from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    in_stock = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "description", "price", "image", "image_url",
            "stock_quantity", "is_available", "in_stock", "created_at",
        )
        read_only_fields = ("id", "created_at", "in_stock")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductAdminSerializer(serializers.ModelSerializer):
    in_stock = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "description", "price", "image", "image_url",
            "stock_quantity", "is_available", "in_stock",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "in_stock")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate_price(self, value):
        if float(value) <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
