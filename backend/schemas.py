from extensions import ma
from marshmallow import fields
from models.user import User, AuditLog
from models.library import Publisher, Author, Category, Book, Member, Transaction, PurchaseOrder

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ('password_hash',)

class AuditLogSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = AuditLog
        include_fk = True

class PublisherSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Publisher

class AuthorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Author

class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category

class BookSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Book
        include_fk = True
    
    # Nested fields matching DRF depth
    publisher = fields.Nested(PublisherSchema, attribute='publisher_ref', dump_only=True)
    category = fields.Nested(CategorySchema, attribute='category_ref', dump_only=True)
    authors_details = fields.Nested(AuthorSchema, attribute='authors', many=True, dump_only=True)

class MemberSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Member
        include_fk = True
    
    email = fields.String(attribute='user_profile.email', dump_only=True)

class TransactionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Transaction
        include_fk = True
    
    book_title = fields.String(attribute='book_ref.title', dump_only=True)
    member_email = fields.String(attribute='member_ref.user_profile.email', dump_only=True)

class PurchaseOrderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PurchaseOrder
        include_fk = True

    publisher_name = fields.String(attribute='publisher_ref.name', dump_only=True)

# Initialize schema instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)

publisher_schema = PublisherSchema()
publishers_schema = PublisherSchema(many=True)

author_schema = AuthorSchema()
authors_schema = AuthorSchema(many=True)

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

book_schema = BookSchema()
books_schema = BookSchema(many=True)

member_schema = MemberSchema()
members_schema = MemberSchema(many=True)

transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)

order_schema = PurchaseOrderSchema()
orders_schema = PurchaseOrderSchema(many=True)
