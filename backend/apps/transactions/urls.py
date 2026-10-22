from django.urls import path
from .views import (
    MyTransactionListView,
    AdminTransactionListView,
    AdminTransactionExportView,
)

urlpatterns = [
    path('', MyTransactionListView.as_view(), name='my-transactions'),
    path('admin/', AdminTransactionListView.as_view(), name='admin-transactions'),
    path('admin/export/', AdminTransactionExportView.as_view(), name='admin-transactions-export'),
]
