from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from datetime import datetime, timedelta
import decimal

from models.library import Publisher, Author, Category, Book, Member, Transaction, PurchaseOrder
from schemas import (
    publisher_schema, publishers_schema,
    author_schema, authors_schema,
    category_schema, categories_schema,
    book_schema, books_schema,
    member_schema, members_schema,
    transaction_schema, transactions_schema,
    order_schema, orders_schema
)

lib_bp = Blueprint('library', __name__)

def register_crud_routes(bp, model, schema, schema_many, route_name):
    """Helper to generate DRF-like CRUD endpoints for a given model"""
    
    @bp.route(f'/{route_name}/', methods=['GET'], endpoint=f'{route_name}_list')
    @jwt_required()
    def list_items():
        items = model.query.all()
        return jsonify(schema_many.dump(items)), 200

    @bp.route(f'/{route_name}/', methods=['POST'], endpoint=f'{route_name}_create')
    @jwt_required()
    def create_item():
        try:
            item = schema.load(request.json, session=db.session)
            db.session.add(item)
            db.session.commit()
            return jsonify(schema.dump(item)), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @bp.route(f'/{route_name}/<id>/', methods=['GET'], endpoint=f'{route_name}_retrieve')
    @jwt_required()
    def retrieve_item(id):
        item = model.query.get_or_404(id)
        return jsonify(schema.dump(item)), 200

    @bp.route(f'/{route_name}/<id>/', methods=['PUT', 'PATCH'], endpoint=f'{route_name}_update')
    @jwt_required()
    def update_item(id):
        item = model.query.get_or_404(id)
        try:
            schema.load(request.json, instance=item, partial=True, session=db.session)
            db.session.commit()
            return jsonify(schema.dump(item)), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @bp.route(f'/{route_name}/<id>/', methods=['DELETE'], endpoint=f'{route_name}_delete')
    @jwt_required()
    def delete_item(id):
        item = model.query.get_or_404(id)
        db.session.delete(item)
        db.session.commit()
        return '', 204

# Register standard CRUD routes
register_crud_routes(lib_bp, Publisher, publisher_schema, publishers_schema, 'publishers')
register_crud_routes(lib_bp, Author, author_schema, authors_schema, 'authors')
register_crud_routes(lib_bp, Category, category_schema, categories_schema, 'categories')
register_crud_routes(lib_bp, Book, book_schema, books_schema, 'books')
register_crud_routes(lib_bp, Member, member_schema, members_schema, 'members')
register_crud_routes(lib_bp, PurchaseOrder, order_schema, orders_schema, 'orders')

# Transactions CRUD
register_crud_routes(lib_bp, Transaction, transaction_schema, transactions_schema, 'transactions')

# Custom Transaction Endpoints matching Django DRF @action
@lib_bp.route('/transactions/issue_book/', methods=['POST'])
@jwt_required()
def issue_book():
    data = request.json
    book_id = data.get('book_id')
    member_id = data.get('member_id')

    # Pessimistic locking: with_for_update() equivalent to select_for_update()
    book = Book.query.with_for_update().filter_by(isbn=book_id).first()
    if not book:
        return jsonify({'error': 'Book not found'}), 404
        
    member = Member.query.get(member_id)
    if not member:
        db.session.rollback()
        return jsonify({'error': 'Member not found'}), 404

    if book.status != 'Available':
        db.session.rollback()
        return jsonify({'error': 'Book is not available'}), 400

    try:
        book.status = 'Issued'
        due_date = datetime.utcnow().date() + timedelta(days=14)
        
        txn = Transaction(
            book_id=book.isbn,
            member_id=member.id,
            due_date=due_date
        )
        
        db.session.add(txn)
        db.session.commit()
        return jsonify(transaction_schema.dump(txn)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@lib_bp.route('/transactions/<id>/return_book/', methods=['POST'])
@jwt_required()
def return_book(id):
    txn = Transaction.query.with_for_update().get(id)
    if not txn:
        return jsonify({'error': 'Transaction not found'}), 404
        
    if txn.return_date:
        db.session.rollback()
        return jsonify({'error': 'Book already returned'}), 400

    try:
        return_date = datetime.utcnow().date()
        txn.return_date = return_date
        
        # Fine Calculation
        overdue_days = (return_date - txn.due_date).days
        if overdue_days > 0:
            fine_rate = decimal.Decimal('1.50')
            txn.fine = fine_rate * overdue_days
            
        book = Book.query.get(txn.book_id)
        if book:
            book.status = 'Available'
            
        db.session.commit()
        return jsonify(transaction_schema.dump(txn)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
