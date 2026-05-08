from django.contrib import admin
from .models import (
    Publisher,
    Author,
    Category,
    Book,
    Member,
    Transaction,
    PurchaseOrder
)

admin.site.register(Publisher)
admin.site.register(Author)
admin.site.register(Category)
admin.site.register(Book)
admin.site.register(Member)
admin.site.register(Transaction)
admin.site.register(PurchaseOrder)