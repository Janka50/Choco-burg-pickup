from django.urls import path
from . import views

urlpatterns = [
    # Sessions
    path('session/open/', views.open_session, name='pos-open-session'),
    path('session/current/', views.current_session, name='pos-current-session'),
    path('session/<int:pk>/close/', views.close_session, name='pos-close-session'),
    # Sales
    path('sales/', views.list_sales, name='pos-sales'),
    path('sales/create/', views.create_sale, name='pos-create-sale'),
    path('sales/<int:pk>/', views.sale_detail, name='pos-sale-detail'),
    path('sales/<int:pk>/void/', views.void_sale, name='pos-void-sale'),
    # Analytics
    path('analytics/', views.analytics, name='pos-analytics'),
]
