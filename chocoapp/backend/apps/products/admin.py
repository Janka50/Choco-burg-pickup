from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock_quantity', 'is_available', 'in_stock')
    list_filter = ('is_available',)
    search_fields = ('name',)
    list_editable = ('stock_quantity', 'is_available')
