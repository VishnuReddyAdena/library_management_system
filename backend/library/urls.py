from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublisherViewSet, AuthorViewSet, CategoryViewSet,
    BookViewSet, MemberViewSet, TransactionViewSet, PurchaseOrderViewSet
)

router = DefaultRouter()
router.register(r'publishers', PublisherViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'books', BookViewSet)
router.register(r'members', MemberViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'orders', PurchaseOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
