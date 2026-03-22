from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with sample products and admin user'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        admin, created = User.objects.get_or_create(
            email='admin@chocoshop.com',
            defaults={
                'first_name': 'Shop',
                'last_name': 'Admin',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('Admin@1234')
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Admin: admin@chocoshop.com / Admin@1234'))

        choco_cat, _ = Category.objects.get_or_create(name='Chocolate', defaults={'slug': 'chocolate'})
        ice_cat, _ = Category.objects.get_or_create(name='Ice Cream', defaults={'slug': 'ice-cream'})
        drink_cat, _ = Category.objects.get_or_create(name='Drinks', defaults={'slug': 'drinks'})

        products = [
            {'name': 'Dark Chocolate Bar', 'category': choco_cat, 'price': '4.50', 'stock_quantity': 50, 'description': 'Rich 70% cacao dark chocolate'},
            {'name': 'Milk Chocolate Truffles', 'category': choco_cat, 'price': '8.99', 'stock_quantity': 30, 'description': '6 handcrafted milk chocolate truffles'},
            {'name': 'White Chocolate Bark', 'category': choco_cat, 'price': '6.00', 'stock_quantity': 25, 'description': 'White chocolate with almonds and cranberries'},
            {'name': 'Caramel Chocolate Box', 'category': choco_cat, 'price': '12.99', 'stock_quantity': 20, 'description': 'Assorted caramel-filled chocolates'},
            {'name': 'Vanilla Bean Ice Cream', 'category': ice_cat, 'price': '5.50', 'stock_quantity': 40, 'description': 'Classic vanilla bean, single scoop'},
            {'name': 'Double Chocolate Scoop', 'category': ice_cat, 'price': '5.50', 'stock_quantity': 40, 'description': 'Intense chocolate ice cream scoop'},
            {'name': 'Strawberry Sorbet', 'category': ice_cat, 'price': '4.99', 'stock_quantity': 35, 'description': 'Fresh strawberry sorbet, dairy-free'},
            {'name': 'Choco Banana Split', 'category': ice_cat, 'price': '9.99', 'stock_quantity': 15, 'description': 'Banana split with hot fudge'},
            {'name': 'Hot Chocolate', 'category': drink_cat, 'price': '3.99', 'stock_quantity': 100, 'description': 'Creamy hot chocolate'},
            {'name': 'Chocolate Milkshake', 'category': drink_cat, 'price': '5.99', 'stock_quantity': 60, 'description': 'Thick chocolate milkshake'},
        ]

        for p in products:
            _, created = Product.objects.get_or_create(name=p['name'], defaults=p)
            if created:
                self.stdout.write(f'  ✓ {p["name"]}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
