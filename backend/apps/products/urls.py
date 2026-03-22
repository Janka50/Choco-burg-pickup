from django.urls import path
from .views import (
    ProductListView, ProductDetailView,
    AdminProductListCreateView, AdminProductDetailView,
    InventorySummaryView,
)

urlpatterns = [
    # Customer
    path('', ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    # Admin
    path('admin/', AdminProductListCreateView.as_view(), name='admin-product-list'),
    path('admin/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path('admin/inventory/', InventorySummaryView.as_view(), name='inventory-summary'),
]
