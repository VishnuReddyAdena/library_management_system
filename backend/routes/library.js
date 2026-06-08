const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  Publisher,
  Author,
  Category,
  Book,
  Member,
  Transaction,
  PurchaseOrder
} = require('../models/Library');
const { User } = require('../models/User');

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

const formatPublisher = (pub) => ({
  id: pub._id.toString(),
  name: pub.name,
  address: pub.address,
  contact_email: pub.contact_email
});

const formatAuthor = (auth) => ({
  id: auth._id.toString(),
  name: auth.name,
  biography: auth.biography,
  date_of_birth: formatDate(auth.date_of_birth)
});

const formatCategory = (cat) => ({
  id: cat._id.toString(),
  name: cat.name
});

const formatBook = (book) => ({
  isbn: book._id,
  title: book.title,
  edition: book.edition,
  price: Number(book.price),
  status: book.status,
  language: book.language,
  publisher_id: book.publisher_id ? (book.publisher_id._id || book.publisher_id).toString() : null,
  category_id: book.category_id ? (book.category_id._id || book.category_id).toString() : null,
  publisher: book.publisher_id && book.publisher_id.name ? formatPublisher(book.publisher_id) : null,
  category: book.category_id && book.category_id.name ? formatCategory(book.category_id) : null,
  authors_details: Array.isArray(book.authors) ? book.authors.map(a => a.name ? formatAuthor(a) : a.toString()) : []
});

const formatMember = (m) => ({
  id: m._id.toString(),
  user_id: m.user_id ? (m.user_id._id || m.user_id).toString() : null,
  membership_type: m.membership_type,
  reg_date: formatDate(m.reg_date),
  expiry_date: formatDate(m.expiry_date),
  email: m.user_id && m.user_id.email ? m.user_id.email : null
});

const formatTransaction = (t) => ({
  id: t._id.toString(),
  book_id: t.book_id ? (t.book_id._id || t.book_id).toString() : null,
  member_id: t.member_id ? (t.member_id._id || t.member_id).toString() : null,
  issue_date: formatDate(t.issue_date),
  due_date: formatDate(t.due_date),
  return_date: formatDate(t.return_date),
  fine: Number(t.fine || 0),
  book_title: t.book_id && t.book_id.title ? t.book_id.title : null,
  member_email: t.member_id && t.member_id.user_id && t.member_id.user_id.email ? t.member_id.user_id.email : null
});

const formatOrder = (o) => ({
  id: o._id.toString(),
  publisher_id: o.publisher_id ? (o.publisher_id._id || o.publisher_id).toString() : null,
  order_date: formatDate(o.order_date),
  total_amount: Number(o.total_amount),
  status: o.status,
  publisher_name: o.publisher_id && o.publisher_id.name ? o.publisher_id.name : null
});

// Reusable Helper to register CRUD routes
const registerCrudRoutes = (Model, formatFn, routeName, populateFields = []) => {
  // List
  router.get(`/${routeName}/`, authMiddleware, async (req, res) => {
    try {
      let query = Model.find();
      populateFields.forEach(field => {
        query = query.populate(field);
      });
      const items = await query.exec();
      return res.status(200).json(items.map(formatFn));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post(`/${routeName}/`, authMiddleware, async (req, res) => {
    try {
      const data = req.body;
      // Handle _id alias for Book
      if (routeName === 'books' && data.isbn) {
        data._id = data.isbn;
      }
      
      const item = new Model(data);
      await item.save();

      let saved = item;
      if (populateFields.length > 0) {
        let popQuery = Model.findById(item._id);
        populateFields.forEach(field => {
          popQuery = popQuery.populate(field);
        });
        saved = await popQuery.exec();
      }

      return res.status(201).json(formatFn(saved));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Retrieve
  router.get(`/${routeName}/:id/`, authMiddleware, async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      populateFields.forEach(field => {
        query = query.populate(field);
      });
      const item = await query.exec();
      if (!item) return res.status(404).json({ error: 'Item not found' });
      return res.status(200).json(formatFn(item));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Update
  const updateHandler = async (req, res) => {
    try {
      let item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });

      Object.assign(item, req.body);
      await item.save();

      let updated = item;
      if (populateFields.length > 0) {
        let popQuery = Model.findById(item._id);
        populateFields.forEach(field => {
          popQuery = popQuery.populate(field);
        });
        updated = await popQuery.exec();
      }

      return res.status(200).json(formatFn(updated));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  };

  router.put(`/${routeName}/:id/`, authMiddleware, updateHandler);
  router.patch(`/${routeName}/:id/`, authMiddleware, updateHandler);

  // Delete
  router.delete(`/${routeName}/:id/`, authMiddleware, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
};

// Register CRUD routes
registerCrudRoutes(Publisher, formatPublisher, 'publishers');
registerCrudRoutes(Author, formatAuthor, 'authors');
registerCrudRoutes(Category, formatCategory, 'categories');
registerCrudRoutes(Book, formatBook, 'books', ['publisher_id', 'category_id', 'authors']);
registerCrudRoutes(Member, formatMember, 'members', ['user_id']);
registerCrudRoutes(PurchaseOrder, formatOrder, 'orders', ['publisher_id']);
registerCrudRoutes(Transaction, formatTransaction, 'transactions', ['book_id', { path: 'member_id', populate: { path: 'user_id' } }]);

// Custom actions for transactions
router.post('/transactions/issue_book/', authMiddleware, async (req, res) => {
  const { book_id, member_id } = req.body;
  if (!book_id || !member_id) {
    return res.status(400).json({ error: 'book_id and member_id are required' });
  }

  try {
    const book = await Book.findById(book_id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const member = await Member.findById(member_id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    if (book.status !== 'Available') {
      return res.status(400).json({ error: 'Book is not available' });
    }

    book.status = 'Issued';
    await book.save();

    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14);

    const txn = new Transaction({
      book_id: book._id,
      member_id: member._id,
      due_date
    });
    await txn.save();

    const populatedTxn = await Transaction.findById(txn._id)
      .populate('book_id')
      .populate({ path: 'member_id', populate: { path: 'user_id' } });

    return res.status(201).json(formatTransaction(populatedTxn));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/transactions/:id/return_book/', authMiddleware, async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    if (txn.return_date) {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const return_date = new Date();
    txn.return_date = return_date;

    // Overdue calculations
    const overdue_days = Math.floor((return_date.getTime() - txn.due_date.getTime()) / (1000 * 60 * 60 * 24));
    if (overdue_days > 0) {
      txn.fine = overdue_days * 1.50;
    }

    const book = await Book.findById(txn.book_id);
    if (book) {
      book.status = 'Available';
      await book.save();
    }

    await txn.save();

    const populatedTxn = await Transaction.findById(txn._id)
      .populate('book_id')
      .populate({ path: 'member_id', populate: { path: 'user_id' } });

    return res.status(200).json(formatTransaction(populatedTxn));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/send-otp/', authMiddleware, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'email and otp are required' });
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('SMTP credentials not configured. OTP email simulated. Code:', otp);
    return res.status(200).json({
      success: true,
      message: 'OTP generated and simulated (SMTP not configured)',
      simulated: true,
      otp
    });
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });

    const mailOptions = {
      from: `"LibraryOS System" <${user}>`,
      to: email,
      subject: 'LibraryOS Verification Code',
      text: `Your book return verification code is ${otp}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #f8fafc;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">LibraryOS Return Verification</h2>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">You requested a verification code to return your library book. Please use the following 6-digit code to complete the process:</p>
          <div style="display: block; width: fit-content; margin: 24px 0; padding: 12px 24px; background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 6px; font-size: 24px; font-weight: bold; color: #3730a3; letter-spacing: 2px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">If you did not request this code, please ignore this email or contact your librarian.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code ${otp} sent to ${email}`);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending email via nodemailer:', err);
    return res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

module.exports = router;

