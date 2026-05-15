from datetime import datetime
from extensions import db

# Association table for Many-to-Many relationship between Books and Authors
book_authors = db.Table('book_authors',
    db.Column('book_isbn', db.String(13), db.ForeignKey('books.isbn', ondelete='CASCADE'), primary_key=True),
    db.Column('author_id', db.Integer, db.ForeignKey('authors.id', ondelete='CASCADE'), primary_key=True)
)

class Publisher(db.Model):
    __tablename__ = 'publishers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact_email = db.Column(db.String(255), nullable=False)

    books = db.relationship('Book', backref='publisher_ref', cascade='all, delete-orphan')
    orders = db.relationship('PurchaseOrder', backref='publisher_ref', cascade='all, delete-orphan')

class Author(db.Model):
    __tablename__ = 'authors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    biography = db.Column(db.Text, nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    books = db.relationship('Book', backref='category_ref')

class Book(db.Model):
    __tablename__ = 'books'
    isbn = db.Column(db.String(13), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    edition = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='Available')
    language = db.Column(db.String(50), nullable=False)
    
    publisher_id = db.Column(db.Integer, db.ForeignKey('publishers.id', ondelete='CASCADE'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    
    authors = db.relationship('Author', secondary=book_authors, backref=db.backref('books', lazy='dynamic'))

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    membership_type = db.Column(db.String(50), nullable=False)
    reg_date = db.Column(db.Date, default=datetime.utcnow)
    expiry_date = db.Column(db.Date, nullable=False)
    
    transactions = db.relationship('Transaction', backref='member_ref', cascade='all, delete-orphan')

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(13), db.ForeignKey('books.isbn', ondelete='CASCADE'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id', ondelete='CASCADE'), nullable=False)
    issue_date = db.Column(db.Date, default=datetime.utcnow)
    due_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    fine = db.Column(db.Numeric(10, 2), default=0.0)
    
    book_ref = db.relationship('Book', backref='transactions')

class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'
    id = db.Column(db.Integer, primary_key=True)
    publisher_id = db.Column(db.Integer, db.ForeignKey('publishers.id', ondelete='CASCADE'), nullable=False)
    order_date = db.Column(db.Date, default=datetime.utcnow)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(50), default='Pending')
