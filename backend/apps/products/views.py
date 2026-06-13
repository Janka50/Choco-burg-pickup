from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer, ProductAdminSerializer
from apps.users.permissions import IsAdminUser


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["price", "created_at", "name"]

    def get_queryset(self):
        return Product.objects.filter(is_available=True, stock_quantity__gt=0)

    def get_serializer_context(self):
        return {"request": self.request}


@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_product_list_create(request):
    if request.method == "GET":
        products = Product.objects.all().order_by("-created_at")
        serializer = ProductAdminSerializer(
            products, many=True, context={"request": request}
        )
        return Response(serializer.data)

    serializer = ProductAdminSerializer(
        data=request.data, context={"request": request}
    )
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def admin_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({"error": "Product not found."}, status=404)

    if request.method == "GET":
        return Response(
            ProductAdminSerializer(product, context={"request": request}).data
        )

    if request.method in ["PATCH", "PUT"]:
        partial = request.method == "PATCH"
        serializer = ProductAdminSerializer(
            product, data=request.data, partial=partial,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def inventory_summary(request):
    products = Product.objects.all().order_by("stock_quantity")
    data = ProductAdminSerializer(
        products, many=True, context={"request": request}
    ).data
    return Response({
        "products": data,
        "total_products": products.count(),
        "low_stock": products.filter(
            stock_quantity__lte=5, stock_quantity__gt=0
        ).count(),
        "out_of_stock": products.filter(stock_quantity=0).count(),
        "available": products.filter(is_available=True).count(),
    })
