from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Publisher, Author, Category, Book, Member, Transaction, PurchaseOrder
from .serializers import (
    PublisherSerializer, AuthorSerializer, CategorySerializer, 
    BookSerializer, MemberSerializer, TransactionSerializer, PurchaseOrderSerializer
)

class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    @action(detail=False, methods=['post'])
    def issue_book(self, request):
        book_id = request.data.get('book_id')
        member_id = request.data.get('member_id')

        try:
            with transaction.atomic():
                # Pessimistic locking to prevent race conditions during checkout
                book = Book.objects.select_for_update().get(isbn=book_id)
                member = Member.objects.get(id=member_id)

                if book.status != 'Available':
                    return Response({'error': 'Book is not available'}, status=status.HTTP_400_BAD_REQUEST)

                # Issue the book
                book.status = 'Issued'
                book.save()

                due_date = timezone.now().date() + timedelta(days=14)
                txn = Transaction.objects.create(
                    book=book,
                    member=member,
                    due_date=due_date
                )
                serializer = self.get_serializer(txn)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
        except Member.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def return_book(self, request, pk=None):
        try:
            with transaction.atomic():
                txn = Transaction.objects.select_for_update().get(id=pk)
                
                if txn.return_date:
                    return Response({'error': 'Book already returned'}, status=status.HTTP_400_BAD_REQUEST)

                return_date = timezone.now().date()
                txn.return_date = return_date
                
                # Fine Engine Calculation: Total = Days * Rate
                overdue_days = (return_date - txn.due_date).days
                if overdue_days > 0:
                    fine_rate = Decimal('1.50') # Example rate
                    txn.fine = fine_rate * overdue_days
                
                book = txn.book
                book.status = 'Available'
                
                book.save()
                txn.save()
                
                serializer = self.get_serializer(txn)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
