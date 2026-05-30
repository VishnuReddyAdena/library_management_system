const mongoose = require('mongoose');

// Publisher Schema
const PublisherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact_email: { type: String, required: true },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Author Schema
const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  biography: { type: String, default: '' },
  date_of_birth: { type: Date, default: null },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Book Schema
const BookSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // We use isbn as _id
  title: { type: String, required: true },
  edition: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Available' },
  language: { type: String, required: true },
  publisher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for ISBN to align with original database schemas
BookSchema.virtual('isbn').get(function() {
  return this._id;
});

// Member Schema
const MemberSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  membership_type: { type: String, required: true },
  reg_date: { type: Date, default: Date.now },
  expiry_date: { type: Date, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  book_id: { type: String, ref: 'Book', required: true }, // refers to book _id (isbn)
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  issue_date: { type: Date, default: Date.now },
  due_date: { type: Date, required: true },
  return_date: { type: Date, default: null },
  fine: { type: Number, default: 0.0 }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// PurchaseOrder Schema
const PurchaseOrderSchema = new mongoose.Schema({
  publisher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true },
  order_date: { type: Date, default: Date.now },
  total_amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Publisher = mongoose.model('Publisher', PublisherSchema);
const Author = mongoose.model('Author', AuthorSchema);
const Category = mongoose.model('Category', CategorySchema);
const Book = mongoose.model('Book', BookSchema);
const Member = mongoose.model('Member', MemberSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);

module.exports = {
  Publisher,
  Author,
  Category,
  Book,
  Member,
  Transaction,
  PurchaseOrder
};
