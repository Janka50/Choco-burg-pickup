from django.urls import path
from .views import (
    CustomerOrderListCreateView,
    CustomerOrderDetailView,
    CustomerCancelOrderView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminApproveRejectOrderView,
    AdminCompleteOrderView,
)

urlpatterns = [
    # Customer
    path('', CustomerOrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', CustomerOrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CustomerCancelOrderView.as_view(), name='order-cancel'),
    # Admin
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/<int:pk>/review/', AdminApproveRejectOrderView.as_view(), name='admin-order-review'),
    path('admin/<int:pk>/complete/', AdminCompleteOrderView.as_view(), name='admin-order-complete'),
]
