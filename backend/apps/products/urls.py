from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product-list'),
    path('admin/', views.admin_product_list_create, name='admin-product-list-create'),
    path('admin/inventory/', views.inventory_summary, name='inventory-summary'),
    path('admin/<int:pk>/', views.admin_product_detail, name='admin-product-detail'),
]
