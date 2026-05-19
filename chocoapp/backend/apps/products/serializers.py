from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    in_stock = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'price', 'image', 'image_url',
            'stock_quantity', 'is_available', 'in_stock', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductAdminSerializer(ProductSerializer):
    """Full serializer for admin (includes stock management)."""
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ('updated_at',)
