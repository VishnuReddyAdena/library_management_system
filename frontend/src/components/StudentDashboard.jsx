import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, AlertCircle, Clock, CheckCircle, CreditCard, Search, 
  LayoutDashboard, Bookmark, History, RotateCcw, XCircle, ChevronRight, 
  User, Star, Calendar, ShieldCheck, Download, Printer, ShieldAlert,
  ArrowRight, Info, BookOpenCheck, DollarSign, Wallet, RefreshCw, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addAuditLog } from '../utils/auditLogger';

// ─── Custom Hooks ───────────────────────────────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage', error);
    }
  }, [key, value]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (err) {
          console.error('Error syncing localStorage on event', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [value, setValue];
}

// ─── Rule Engine Policies ────────────────────────────────────────────────────────
const POLICIES = {
  faculty: {
    label: 'Faculty Member',
    maxBooks: 5,
    dueDays: 30,
    dailyFine: 5,
  },
  student: {
    label: 'Student Member',
    maxBooks: 3,
    dueDays: 14,
    dailyFine: 10,
  }
};

// ─── Mock Data & Book Meta ───────────────────────────────────────────────────────
const MOCK_LOANS = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0135957059', issuedOn: '2025-03-25', dueDate: '2025-04-10', status: 'Active', fine: 0 },
  { id: 2, title: 'Designing Data-Intensive Apps', author: 'Martin Kleppmann', isbn: '978-1449373320', issuedOn: '2025-03-01', dueDate: '2025-03-15', status: 'Overdue', fine: 280 },
];

const MOCK_RESERVATIONS = [
  { id: 'RES001', memberId: 'M003', member: 'Rahul Singh', bookId: 'B002', title: 'System Design Interview', date: '2025-04-10', requestedOn: '2025-04-10', status: 'Pending', availableDate: 'Unknown' },
  { id: 'RES002', memberId: 'M001', member: 'John Doe', bookId: 'B004', title: 'Deep Learning', date: '2025-04-12', requestedOn: '2025-04-12', status: 'Approved', availableDate: '2025-04-15' },
  { id: 'RES003', memberId: 'M004', member: 'Alice Johnson', bookId: 'B002', title: 'System Design Interview', date: '2025-04-13', requestedOn: '2025-04-13', status: 'Pending', availableDate: 'Unknown' },
  { id: 'RES101', memberId: 'M001', member: 'John Doe', bookId: 'B001', title: 'Clean Architecture', date: '2025-04-01', requestedOn: '2025-04-01', status: 'Pending', availableDate: '2025-04-18' }
];

const MOCK_HISTORY = [
  { id: 3, title: 'Clean Code', issuedOn: '2025-01-10', returnedOn: '2025-01-20', status: 'Returned' },
  { id: 4, title: 'Introduction to Algorithms', issuedOn: '2024-11-05', returnedOn: '2024-12-01', status: 'Returned' },
];

const MEMBERS = [
  { id: 'M001', name: 'John Doe', email: 'john.doe@gmail.com', type: 'Student', expiry: '2026-01-01', status: 'Active' },
  { id: 'M002', name: 'Priya Nair', email: 'priya.nair@gmail.com', type: 'Faculty', expiry: '2025-06-30', status: 'Active' },
  { id: 'M003', name: 'Rahul Singh', email: 'rahul.singh@gmail.com', type: 'Student', expiry: '2025-04-10', status: 'Expiring' },
  { id: 'M004', name: 'Alice Johnson', email: 'alice.johnson@gmail.com', type: 'Student', expiry: '2024-12-31', status: 'Expired' },
];

const ISSUED_BOOKS = [
  { id: 1, member: 'John Doe', memberId: 'M001', book: 'Clean Code', isbn: '9780132350884', issuedOn: '2025-03-22', dueDate: '2025-04-05', fine: 0, status: 'issued' },
  { id: 2, member: 'Priya Nair', memberId: 'M002', book: 'System Design Interview', isbn: '9798664653403', issuedOn: '2025-03-10', dueDate: '2025-03-24', fine: 27.00, status: 'issued' },
  { id: 3, member: 'Rahul Singh', memberId: 'M003', book: 'Deep Learning', isbn: '9780262035613', issuedOn: '2025-03-25', dueDate: '2025-04-08', fine: 0, status: 'issued' },
];

const MOCK_PAYMENTS = [
  { id: 'PAY-1101', member: 'Priya Nair', memberId: 'M002', amount: 27.00, type: 'Late Fine', status: 'Verified', date: '2025-04-11', paymentMethod: 'UPI' },
  { id: 'PAY-1102', member: 'Rahul Singh', memberId: 'M003', amount: 15.00, type: 'Lost Book', status: 'Pending', date: '2025-04-12', paymentMethod: 'UPI' },
  { id: 'PAY-1103', member: 'Alice Johnson', memberId: 'M004', amount: 5.00, type: 'Late Fine', status: 'Pending', date: '2025-04-13', paymentMethod: 'UPI' },
  { id: 'PAY-1104', member: 'John Doe', memberId: 'M001', amount: 20.00, type: 'Late Fine', status: 'Verified', date: '2025-04-14', bookTitle: 'Clean Code', paymentMethod: 'Card' },
  { id: 'PAY-1105', member: 'John Doe', memberId: 'M001', amount: 50.00, type: 'Late Fine', status: 'Verified', date: '2025-04-15', bookTitle: 'The Pragmatic Programmer', paymentMethod: 'UPI' },
];


const MOCK_CATALOG = [
  { id: 201, title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', status: 'Available', category: 'Software' },
  { id: 202, title: 'System Design Interview', author: 'Alex Xu', isbn: '979-8664653403', status: 'Unavailable', category: 'Engineering' },
  { id: 203, title: 'Refactoring', author: 'Martin Fowler', isbn: '978-0201485677', status: 'Available', category: 'Software' },
  { id: 204, title: 'Design Patterns', author: 'Erich Gamma', isbn: '978-0201633610', status: 'Available', category: 'Software' }
];

const BOOK_DESCRIPTIONS = {
  'Clean Code': 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn\'t have to be that way. Robert C. Martin presents a revolutionary paradigm with Clean Code.',
  'System Design Interview': 'System Design Interview - An Insider\'s Guide is a must-read for anyone who wants to learn how to design large-scale systems. It is also excellent preparation for system design interviews. It contains clear explanations, diagrams, and concrete interview questions.',
  'The Pragmatic Programmer': 'The Pragmatic Programmer is one of the most significant books in software development. It cuts through the increasing specialization and technicalities of modern software development to examine the core process—taking a requirement and producing working, maintainable code.',
  'Deep Learning': 'Deep Learning is a comprehensive textbook on Artificial Intelligence, written by Ian Goodfellow, Yoshua Bengio, and Aaron Courville. It offers mathematical and conceptual backgrounds, covering linear algebra, probability theory, numerical computation, and deep machine learning techniques.',
  'Refactoring': 'Martin Fowler\'s guide to refactoring is a classic that describes the theory and practice of refactoring software code. It details the process of rewriting code to make it more elegant, readable, and maintainable without altering its behavior.',
  'Design Patterns': 'Design Patterns: Elements of Reusable Object-Oriented Software is a software engineering book describing software design patterns. Written by Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides, it is a seminal work in the field.',
  'pyython': 'A complete guide to learning Python programming from scratch. Covers variables, data structures, OOP, file handling, and basic libraries with interactive code examples.',
  'Clean Architecturee': 'Building on the success of his landmark books Clean Code and The Clean Coder, legendary software craftsman Robert C. Martin (“Uncle Bob”) reveals the rules of software architecture and helps you apply them.',
  'Building Microservices': 'Distributed systems have become more fine-grained in the past 10 years, shifting from large monolithic applications to smaller, self-contained microservices. Sam Newman provides a firm foundation in microservices design.',
  'Head First Design Patterns': 'At any given moment, someone is struggling with the same software design problems you have. And, chances are, someone else has already solved them. Head First Design Patterns shows you the tried-and-true, road-tested patterns used by developers.'
};

const BOOK_REVIEWS = [
  { user: 'Dr. Priya Nair (Faculty)', rating: 5, comment: 'An absolute masterpiece. Should be mandatory reading for all CS students.' },
  { user: 'Rahul Singh (Student)', rating: 4, comment: 'Extremely helpful for interviews. The diagrams are crystal clear.' },
  { user: 'Dr. Amit Sen (Faculty)', rating: 5, comment: 'Superb explanation of foundational principles. Well-structured and readable.' },
  { user: 'John Doe (Student)', rating: 4, comment: 'Excellent book, very practical examples. A reference I keep on my desk.' },
  { user: 'Alice Johnson (Student)', rating: 5, comment: 'Helped me pass my exams and land my internship. Must-read!' }
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Search Books', icon: Search },
  { id: 'my-books', label: 'My Books', icon: BookOpen },
  { id: 'reservations', label: 'Reservations', icon: Bookmark },
  { id: 'fines', label: 'Fines & Payments', icon: CreditCard },
  { id: 'history', label: 'History', icon: History },
];

export default function StudentDashboard({ user, onNotify }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  
  // Synchronized storage state
  const [allIssuedBooks, setAllIssuedBooks] = useLocalStorage('library_issuedBooks', ISSUED_BOOKS);
  const [allPayments, setAllPayments] = useLocalStorage('library_payments', MOCK_PAYMENTS);
  const [members, setMembers] = useLocalStorage('library_members', MEMBERS);
  const [catalog, setCatalog] = useLocalStorage('library_books_catalog', MOCK_CATALOG);
  const [reservations, setReservations] = useLocalStorage('library_reservations', MOCK_RESERVATIONS);

  // Dynamic seeding for newly logged-in student/faculty users
  useEffect(() => {
    const emailLower = user?.email?.toLowerCase();
    if (!emailLower) return;

    let existingMember = members.find(m => m.email?.toLowerCase() === emailLower);
    let currentMemberId = existingMember?.id;
    let currentMemberName = existingMember?.name || user?.name || user?.email?.split('@')[0] || 'Member';

    if (!existingMember) {
      currentMemberId = `M${String(members.length + 1).padStart(3, '0')}`;
      const newMemberObj = {
        id: currentMemberId,
        name: currentMemberName,
        email: user?.email,
        type: user?.role === 'faculty' ? 'Faculty' : 'Student',
        expiry: '2027-12-31',
        status: 'Active'
      };
      setMembers([...members, newMemberObj]);
      return;
    }

    const hasIssued = allIssuedBooks.some(b => b.memberId === currentMemberId);
    if (!hasIssued) {
      const seedBooks = [
        { 
          id: Date.now() + 10, 
          member: currentMemberName, 
          memberId: currentMemberId, 
          book: 'Designing Data-Intensive Apps', 
          author: 'Martin Kleppmann',
          isbn: '978-1449373320', 
          issuedOn: '2026-05-15', 
          dueDate: '2026-06-01', 
          fine: 150, 
          status: 'issued' 
        },
        { 
          id: Date.now() + 11, 
          member: currentMemberName, 
          memberId: currentMemberId, 
          book: 'The Pragmatic Programmer', 
          author: 'Andrew Hunt',
          isbn: '978-0135957059', 
          issuedOn: '2026-06-01', 
          dueDate: '2026-06-15', 
          fine: 0, 
          status: 'issued' 
        }
      ];
      setAllIssuedBooks([...seedBooks, ...allIssuedBooks]);
    }

    const hasPayments = allPayments.some(p => p.memberId === currentMemberId);
    if (!hasPayments) {
      const seedPayments = [
        {
          id: `PAY-${Date.now() + 20}`,
          member: currentMemberName,
          memberId: currentMemberId,
          amount: 25.00,
          type: 'Late Fine',
          status: 'Verified',
          date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
          bookTitle: 'Clean Code',
          paymentMethod: 'UPI'
        }
      ];
      setAllPayments([...seedPayments, ...allPayments]);
    }
  }, [user, members, allIssuedBooks, allPayments, setMembers, setAllIssuedBooks, setAllPayments]);

  // Resolve student/faculty details from library_members
  const studentMember = members.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase()) || {
    id: 'M001',
    name: user?.name || user?.email?.split('@')[0] || 'John Doe',
    email: user?.email || 'john.doe@gmail.com',
    type: user?.role === 'faculty' ? 'Faculty' : 'Student',
    expiry: '2027-12-31',
    status: 'Active'
  };

  const memberId = studentMember.id;
  const memberName = studentMember.name;
  const memberType = studentMember.type || (user?.role === 'faculty' ? 'Faculty' : 'Student');
  const isFaculty = memberType.toLowerCase() === 'faculty';
  const policy = isFaculty ? POLICIES.faculty : POLICIES.student;

  // Derive active loans (where status !== 'returned')
  const loans = allIssuedBooks.filter(b => b.memberId === memberId && b.status !== 'returned').map(b => ({
    id: b.id,
    title: b.book,
    author: b.author || 'Unknown',
    isbn: b.isbn,
    issuedOn: b.issuedOn,
    dueDate: b.dueDate,
    status: b.status === 'issued' ? (new Date(b.dueDate) < new Date() ? 'Overdue' : 'Active') : b.status,
    fine: (() => {
      if (b.status === 'returned' || b.status === 'Pending Approval') return 0;
      let f = b.fine || 0;
      const due = new Date(b.dueDate);
      const now = new Date();
      if (due < now) {
        f += Math.floor(Math.max((now - due) / 86400000, 1)) * policy.dailyFine;
      }
      return f;
    })()
  }));

  // Derive returned history (where status === 'returned')
  const history = allIssuedBooks.filter(b => b.memberId === memberId && b.status === 'returned').map(b => ({
    id: b.id,
    title: b.book,
    issuedOn: b.issuedOn,
    returnedOn: b.returnedOn?.split('T')[0] || new Date().toISOString().split('T')[0],
    status: 'Returned'
  }));

  // Derive payments
  const payments = allPayments.filter(p => p.memberId === memberId).map(p => ({
    txId: p.id || p.txId,
    amount: p.amount,
    date: p.date,
    status: p.status,
    bookTitle: p.bookTitle,
    type: p.type || 'Late Fine',
    paymentMethod: p.paymentMethod || 'UPI'
  }));

  // Derive reservations scoped to student (ignoring Cancelled status)
  const studentReservations = reservations.filter(r => (r.memberId === memberId || (!r.memberId && memberId === 'M001')) && r.status !== 'Cancelled');

  const overdueMembersList = allIssuedBooks
    .filter(b => b.status === 'issued' && new Date(b.dueDate) < new Date())
    .map(b => {
      const memb = members.find(m => m.id === b.memberId) || { type: 'Student' };
      const isMembFaculty = memb.type?.toLowerCase() === 'faculty';
      const membPolicy = isMembFaculty ? POLICIES.faculty : POLICIES.student;
      
      const due = new Date(b.dueDate);
      const now = new Date();
      const diffTime = Math.max(now - due, 0);
      const diffDays = Math.floor(diffTime / 86400000);
      const calcFine = (b.fine || 0) + (diffDays * membPolicy.dailyFine);

      return {
        id: b.id,
        member: b.member,
        memberId: b.memberId,
        memberType: memb.type || 'Student',
        book: b.book,
        isbn: b.isbn,
        dueDate: b.dueDate,
        daysOverdue: diffDays,
        fine: calcFine
      };
    });

  const studentApprovedCount = studentReservations.filter(r => r.status === 'Approved').length;
  const studentOverdueCount = loans.filter(l => l.status === 'Overdue').length;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Return Modal States
  const [returnModalLoan, setReturnModalLoan] = useState(null);
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [utrError, setUtrError] = useState('');

  // Fines Logic
  const pendingFines = loans.filter(l => l.status === 'Overdue');
  const totalFineAmount = pendingFines.reduce((sum, l) => sum + l.fine, 0);

  // New Interactive Payment States
  const [checkoutLoan, setCheckoutLoan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'card'
  const [qrTimer, setQrTimer] = useState(300); // 5 mins in seconds
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [showSuccessReceipt, setShowSuccessReceipt] = useState(null); // stores invoice details
  const [selectedReceipt, setSelectedReceipt] = useState(null); // invoice for viewing history receipts

  // Card Form State
  const [cardNo, setCardNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // Book Details Modal
  const [detailBook, setDetailBook] = useState(null);

  // QR Timer Countdown effect
  useEffect(() => {
    let interval;
    if (checkoutLoan && paymentMethod === 'upi' && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutLoan, paymentMethod, qrTimer]);

  // Actions
  const handleOpenReturnModal = (loan) => {
    setReturnModalLoan(loan);
    setUtr('');
    setScreenshot(null);
    setScreenshotName('');
    setUtrError('');
  };

  const submitReturnRequest = (e) => {
    e.preventDefault();
    if (returnModalLoan.fine > 0) {
      if (!utr || utr.trim().length !== 12 || !/^\d+$/.test(utr)) {
        setUtrError('Please enter a valid 12-digit UPI UTR number.');
        return;
      }
      if (!screenshot) {
        setUtrError('Please upload your payment screenshot.');
        return;
      }
    }

    const hasFine = returnModalLoan.fine > 0;
    if (hasFine) {
      // Set book status to 'Pending Approval' in raw localStorage
      setAllIssuedBooks(allIssuedBooks.map(b => b.id === returnModalLoan.id ? { ...b, status: 'Pending Approval', fine: returnModalLoan.fine } : b));
      
      // Add payment entry to localStorage with UTR & Screenshot
      const newPayment = { 
        id: `TXN-${utr}`, 
        member: memberName,
        memberId: memberId,
        amount: returnModalLoan.fine, 
        type: 'Late Fine',
        status: 'Pending Verification',
        date: new Date().toISOString().split('T')[0], 
        bookId: returnModalLoan.id,
        bookTitle: returnModalLoan.title,
        screenshot: screenshot, // base64 URL
        paymentMethod: 'UPI'
      };
      setAllPayments([newPayment, ...allPayments]);
      
      if (onNotify) onNotify(`Return request submitted. Payment verification pending.`, 'info');
      addAuditLog(`Student submitted return request for "${returnModalLoan.title}" with UTR ${utr}`, 'info', user?.name || user?.email || 'Student');
    } else {
      // Return immediately if fine is 0
      setAllIssuedBooks(allIssuedBooks.map(b => b.id === returnModalLoan.id ? { ...b, status: 'returned', fine: 0, returnedOn: new Date().toISOString() } : b));
      
      setCatalog(prev => prev.map(b => b.title === returnModalLoan.title ? { ...b, status: 'Available', available: (b.available !== undefined ? b.available + 1 : undefined) } : b));
      if (onNotify) onNotify(`Successfully returned ${returnModalLoan.title}.`, 'success');
      addAuditLog(`Student returned book "${returnModalLoan.title}" (ISBN: ${returnModalLoan.isbn})`, 'success', user?.name || user?.email || 'Student');
    }

    setReturnModalLoan(null);
  };

  const handleCancelReservation = (id) => {
    const res = reservations.find(r => r.id === id);
    setReservations(reservations.filter(r => r.id !== id));
    if (onNotify) onNotify('Reservation cancelled successfully.', 'success');
    addAuditLog(`Student cancelled reservation for "${res?.title || 'book'}"`, 'warning', user?.name || user?.email || 'Student');
  };

  // Launching interactive checkout modal
  const startCheckout = (loan) => {
    setCheckoutLoan(loan);
    setPaymentMethod('upi');
    setQrTimer(300);
    setUtr('');
    setScreenshot(null);
    setScreenshotName('');
    setUtrError('');
    setCardNo('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setCardError('');
    setIsVerifyingPayment(false);
    setVerificationStep(0);
  };

  // Simulated Verification Runner
  const runPaymentVerification = (paymentObj, loanId, bookTitle) => {
    setIsVerifyingPayment(true);
    setVerificationStep(1); // Connecting

    setTimeout(() => {
      setVerificationStep(2); // Verifying ID
      
      setTimeout(() => {
        setVerificationStep(3); // Receipt Generation
        
        setTimeout(() => {
          // Commit to Local Storage
          // Mark book returned instantly
          setAllIssuedBooks(allIssuedBooks.map(b => b.id === loanId ? { ...b, fine: 0, status: 'returned', returnedOn: new Date().toISOString() } : b));
          setCatalog(prev => prev.map(b => b.title === bookTitle ? { ...b, status: 'Available', available: (b.available !== undefined ? b.available + 1 : undefined) } : b));
          
          const finalizedPay = { ...paymentObj, status: 'Verified' };
          setAllPayments([finalizedPay, ...allPayments]);

          setIsVerifyingPayment(false);
          setCheckoutLoan(null);
          setShowSuccessReceipt(finalizedPay);

          if (onNotify) onNotify(`Payment of ₹${paymentObj.amount} processed successfully!`, 'success');
          addAuditLog(`Student completed interactive payment of ₹${paymentObj.amount} for "${bookTitle}"`, 'success', user?.name || user?.email || 'Student');
        }, 800);
      }, 900);
    }, 800);
  };

  const handleCardPaySubmit = (e) => {
    e.preventDefault();
    setCardError('');

    const cardDigits = cardNo.replace(/\s+/g, '');
    if (cardDigits.length !== 16 || !/^\d+$/.test(cardDigits)) {
      setCardError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError('Please enter a valid expiry in MM/YY format.');
      return;
    }
    if (cardCvv.length !== 3 || !/^\d+$/.test(cardCvv)) {
      setCardError('Please enter a valid 3-digit CVV.');
      return;
    }
    if (cardName.trim().length < 3) {
      setCardError('Please enter the cardholder name.');
      return;
    }

    const txId = `TXN-CARD-${Math.floor(100000000000 + Math.random()*900000000000)}`;
    const newPay = { 
      id: txId, 
      member: memberName,
      memberId: memberId,
      amount: checkoutLoan.fine, 
      type: 'Late Fine',
      status: 'Pending Verification',
      date: new Date().toISOString().split('T')[0],
      bookId: checkoutLoan.id,
      bookTitle: checkoutLoan.title,
      paymentMethod: `Card (Ending *${cardDigits.slice(-4)})`
    };

    runPaymentVerification(newPay, checkoutLoan.id, checkoutLoan.title);
  };

  const handleUpiPaySubmit = (e) => {
    e.preventDefault();
    setUtrError('');
    if (!utr || utr.trim().length !== 12 || !/^\d+$/.test(utr)) {
      setUtrError('Please enter a valid 12-digit UPI UTR number.');
      return;
    }
    if (!screenshot) {
      setUtrError('Please upload your payment screenshot.');
      return;
    }

    const txId = `TXN-UPI-${utr}`;
    const newPay = { 
      id: txId, 
      member: memberName,
      memberId: memberId,
      amount: checkoutLoan.fine, 
      type: 'Late Fine',
      status: 'Pending Verification',
      date: new Date().toISOString().split('T')[0],
      bookId: checkoutLoan.id,
      bookTitle: checkoutLoan.title,
      screenshot: screenshot,
      paymentMethod: 'UPI'
    };

    runPaymentVerification(newPay, checkoutLoan.id, checkoutLoan.title);
  };

  const handleBorrow = (book) => {
    if (loans.some(l => l.title === book.title)) {
       if (onNotify) onNotify('You already have this book borrowed.', 'error');
       return;
    }

    // Check limit
    if (loans.length >= policy.maxBooks) {
      if (onNotify) onNotify(`Borrow limit exceeded! As a ${policy.label}, you can borrow up to ${policy.maxBooks} books at a time.`, 'error');
      return;
    }

    const newLoan = {
      id: Date.now(),
      member: memberName,
      memberId: memberId,
      book: book.title,
      author: book.author,
      isbn: book.isbn,
      issuedOn: new Date().toISOString().split('T')[0], 
      dueDate: new Date(Date.now() + policy.dueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'issued',
      fine: 0
    };
    setAllIssuedBooks([newLoan, ...allIssuedBooks]);
    
    // Mark book as Unavailable in catalog (or reduce available count)
    setCatalog(prev => prev.map(b => b.id === book.id ? { ...b, status: 'Unavailable', available: (b.available !== undefined ? Math.max(b.available - 1, 0) : 0) } : b));
    if (onNotify) onNotify(`Successfully borrowed ${book.title}.`, 'success');
    addAuditLog(`Student borrowed book "${book.title}" (ISBN: ${book.isbn})`, 'success', user?.name || user?.email || 'Student');
    
    setDetailBook(null);
    setActiveTab('my-books');
  };

  const handleReserve = (book) => {
    if (reservations.some(r => r.title === book.title && r.status !== 'Cancelled')) {
       if (onNotify) onNotify('You are already on the waitlist for this book.', 'error');
       return;
    }
    if (loans.some(l => l.title === book.title)) {
       if (onNotify) onNotify('You already have this book borrowed.', 'error');
       return;
    }
    const newRes = {
      id: `RES-${Date.now()}`,
      memberId: memberId,
      member: memberName,
      bookId: book.id || `B-${Date.now()}`,
      title: book.title,
      date: new Date().toISOString().split('T')[0],
      requestedOn: new Date().toISOString().split('T')[0],
      status: 'Pending',
      availableDate: 'Unknown'
    };
    setReservations([...reservations, newRes]);
    if (onNotify) onNotify(`Successfully reserved ${book.title}. You will be notified.`, 'success');
    addAuditLog(`Student reserved book "${book.title}" (ISBN: ${book.isbn})`, 'info', user?.name || user?.email || 'Student');
    setDetailBook(null);
    setActiveTab('reservations');
  };

  // Helper for checking if card number matches card type logo
  const getCardType = (number) => {
    const num = number.replace(/\D/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    return 'generic';
  };

  // Star Rating rendering helper
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  // Status Badge Helper
  const StatusBadge = ({ status }) => {
    if (status === 'Available' || status === 'Active' || status === 'Success' || status === 'Returned' || status === 'Verified' || status === 'Approved') 
      return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    if (status === 'Overdue' || status === 'Error' || status === 'Rejected') 
      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
  };

  // Borrow countdown details helper
  const getProgressBarDetails = (issuedOn, dueDate, status) => {
    if (status === 'returned') return { percent: 100, color: 'bg-emerald-500', text: 'Returned' };
    if (status === 'Pending Approval') return { percent: 100, color: 'bg-amber-500/40 animate-pulse border border-amber-500/30', text: 'Pending Verification' };

    const start = new Date(issuedOn).getTime();
    const end = new Date(dueDate).getTime();
    const now = Date.now();

    if (now >= end) {
      const diffDays = Math.floor((now - end) / 86400000);
      return { 
        percent: 100, 
        color: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]', 
        text: diffDays <= 0 ? 'Overdue today' : `Overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}`
      };
    }

    const total = end - start;
    const elapsed = now - start;
    const percent = Math.min(Math.max((elapsed / total) * 100, 0), 100);

    let color = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    if (percent > 85) {
      color = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
    } else if (percent > 60) {
      color = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
    }

    const remainingDays = Math.ceil((end - now) / 86400000);
    return { 
      percent, 
      color, 
      text: remainingDays === 1 ? '1 day remaining' : `${remainingDays} days remaining` 
    };
  };

  const isAvailable = (book) => {
    if (book.status) return book.status === 'Available';
    return (book.available === undefined || book.available > 0);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden page-enter transition-all duration-700 bg-slate-950 text-white font-inter">
      
      {/* Premium Glass Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto custom-scrollbar shadow-2xl z-20">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="fixed top-20 -left-10 w-40 h-40 bg-slate-800/10 blur-[80px] pointer-events-none" />

        <div className="p-5 relative z-10">
          <div className="mb-8 px-2 pt-3">
             <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
               {isFaculty ? 'Faculty Portal' : 'Student Portal'}
             </h2>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library OS Access</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const badgeCount = {
                reservations: studentApprovedCount,
                fines: studentOverdueCount,
              }[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold relative group overflow-hidden
                    ${isActive 
                      ? 'text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.15)] -translate-y-0.5' 
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-white hover:border-white/5 hover:-translate-y-0.5'}`}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-lg shadow-[0_0_10px_#6366f1]" />}
                  
                  <tab.icon className={`w-4 h-4 transition-transform duration-300 relative z-10 ${isActive ? 'text-indigo-400 scale-110 ml-1' : 'text-slate-500 group-hover:scale-110 group-hover:text-slate-300'}`} />
                  <span className="tracking-wide relative z-10">{tab.label}</span>
                  {badgeCount > 0 && (
                    <span className={`flex items-center justify-center h-5 px-1.5 min-w-[20px] text-[10px] font-black rounded-full relative z-10 ml-auto transition-all duration-300
                      ${isActive
                        ? 'text-indigo-200 bg-indigo-500/30 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                        : 'text-rose-200 bg-rose-500/20 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                  {isActive && <ChevronRight className={`w-4 h-4 text-indigo-400 opacity-50 relative z-10 transform translate-x-1 ${badgeCount > 0 ? 'ml-1.5' : 'ml-auto'}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
        
        {/* ── 1. DASHBOARD OVERVIEW ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 tab-enter">
            {/* Ultra Premium Profile Welcome Banner */}
            <div className="card-glass p-6 md:p-8 bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60 border border-white/10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
                {/* Glowing Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-500/20 border border-white/20">
                  {memberName.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-2xl font-black tracking-tight text-white">{memberName}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${
                      isFaculty 
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
                        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {policy.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-medium">{studentMember.email}</p>
                  
                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 font-semibold">
                    <span>Card Expiry: <span className="text-slate-300 font-mono">{studentMember.expiry || '2027-12-31'}</span></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span>ID: <span className="text-indigo-400 font-mono font-bold">{memberId}</span></span>
                  </div>
                </div>
              </div>

              {/* Status Eligibility Check */}
              <div className="flex flex-col items-center md:items-end justify-center gap-2 relative z-10 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Borrowing Eligibility</span>
                {studentOverdueCount > 0 || totalFineAmount > 0 ? (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2 rounded-2xl shadow-lg shadow-rose-500/5">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Suspended (Fines Due)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-2xl shadow-lg shadow-emerald-500/5">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Eligible to Borrow</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-500">Max limit: {policy.maxBooks} books ({policy.dueDays} days term)</span>
              </div>
            </div>
            
            {/* Metric counters: 4 Columns grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-glass p-5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Active Loans</p>
                <div className="text-3xl font-black text-white">{loans.length} <span className="text-xs font-normal text-slate-500">/ {policy.maxBooks} max</span></div>
              </div>
              <div className={`card-glass p-5 border rounded-2xl hover:border-white/10 transition-all ${studentOverdueCount > 0 ? 'border-rose-500/20 bg-rose-950/5' : 'border-white/5'}`}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Overdue Books</p>
                <div className={`text-3xl font-black ${studentOverdueCount > 0 ? 'text-rose-400' : 'text-white'}`}>{studentOverdueCount}</div>
              </div>
              <div className={`card-glass p-5 border rounded-2xl hover:border-white/10 transition-all ${totalFineAmount > 0 ? 'border-amber-500/20 bg-amber-950/5' : 'border-white/5'}`}>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pending Fines</p>
                <div className={`text-3xl font-black ${totalFineAmount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>₹{totalFineAmount}</div>
              </div>
              <div className="card-glass p-5 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Reservations</p>
                <div className="text-3xl font-black text-white">{studentReservations.length}</div>
              </div>
            </div>

            {/* Overdue Warnings Notification panel */}
            {pendingFines.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-500 text-sm">Action Required: Overdue Fines</h4>
                  <p className="text-xs text-rose-400/80 mt-1">
                    You have {pendingFines.length} overdue book(s) and ₹{totalFineAmount} unpaid fine. Please clear these charges to restore borrow eligibility.
                  </p>
                </div>
              </div>
            )}

            {/* Recently Borrowed Books & Progress Indicators */}
            <div className="card-glass p-6 border border-white/5 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Borrowed Books Progress</h2>
              
              {loans.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium text-sm">
                  <BookOpenCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                  No active borrowings found.
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map(loan => {
                    const rawLoan = allIssuedBooks.find(b => b.id === loan.id) || {};
                    const progress = getProgressBarDetails(rawLoan.issuedOn || loan.issuedOn, loan.dueDate, rawLoan.status);
                    return (
                      <div key={loan.id} className="p-4 bg-white/3 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{loan.title}</p>
                            <p className="text-[11px] text-slate-500">by {loan.author} · ISBN: {loan.isbn}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 opacity-60" /> Due: {loan.dueDate}
                            </span>
                            <StatusBadge status={loan.status} />
                          </div>
                        </div>
                        
                        {/* Countdown progress bar */}
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${progress.color}`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <span>Issued: {loan.issuedOn}</span>
                            <span className={loan.status === 'Overdue' ? 'text-rose-400' : 'text-slate-300'}>{progress.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overdue Board (All Members) */}
            <div className="card-glass p-6 border border-white/5 rounded-2xl mt-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Overdue Board (All Members)
              </h2>
              {overdueMembersList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-medium text-sm">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
                  No members with overdue items!
                </div>
              ) : (
                <div className="overflow-hidden border border-white/5 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="bg-slate-800/30 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-3">Member</th>
                        <th className="p-3">Book Title</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Days Overdue</th>
                        <th className="p-3 text-right">Fine Accrued</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {overdueMembersList.map((item, i) => (
                        <tr key={i} className="hover:bg-white/3 transition-colors">
                          <td className="p-3">
                            <p className="font-bold text-white">{item.member}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{item.memberId} · {item.memberType}</p>
                          </td>
                          <td className="p-3 font-semibold text-slate-200">{item.book}</td>
                          <td className="p-3 font-mono text-slate-400">{item.dueDate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              {item.daysOverdue} days
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-amber-400">₹{item.fine}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 2. SEARCH & BOOK DETAILS MODAL ── */}
        {activeTab === 'search' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Search Library</h1>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or ISBN..."
                  className="input-field !pl-12 py-3.5 text-base border border-white/5 rounded-2xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto">
              {['All', 'Software', 'Engineering', 'AI/ML', 'General'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalog
                .filter(book => {
                  const matchesSearch = !searchQuery || (
                    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  const matchesCategory = selectedCategory === 'All' || 
                    (book.category && book.category.toLowerCase().includes(selectedCategory.toLowerCase()));
                  
                  return matchesSearch && matchesCategory;
                })
                .map(book => {
                  const available = isAvailable(book);
                  return (
                    <div 
                      key={book.id} 
                      onClick={() => setDetailBook(book)}
                      className="card-glass p-5 flex gap-4 border border-white/5 hover:border-white/20 transition-all rounded-2xl cursor-pointer group"
                    >
                      {/* Stylized Book Cover Mockup */}
                      <div className="w-16 h-24 shrink-0 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-lg border border-white/10 flex flex-col justify-between p-2 shadow-lg shadow-black/40 group-hover:scale-105 transition-all">
                        <BookOpen className="w-4 h-4 text-indigo-400 opacity-60" />
                        <span className="text-[8px] font-black text-slate-400 truncate tracking-tighter uppercase leading-none">{book.title}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-bold text-white truncate text-base group-hover:text-indigo-300 transition-colors">{book.title}</h3>
                            <StatusBadge status={available ? 'Available' : 'Unavailable'} />
                          </div>
                          <p className="text-xs text-slate-400 mb-0.5 truncate">by {book.author}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{book.isbn} · {book.category || 'General'}</p>
                        </div>
                        
                        <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                          {available ? (
                            <button 
                              onClick={() => handleBorrow(book)} 
                              className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors uppercase tracking-wider w-full"
                            >
                              Borrow Now
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleReserve(book)} 
                              className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors uppercase tracking-wider w-full"
                            >
                              Reserve Book
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {catalog.filter(book => {
                const matchesSearch = !searchQuery || (
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
                );
                const matchesCategory = selectedCategory === 'All' || 
                  (book.category && book.category.toLowerCase().includes(selectedCategory.toLowerCase()));
                return matchesSearch && matchesCategory;
              }).length === 0 && (
                <div className="col-span-2 card-glass p-12 text-center border border-white/5 rounded-2xl">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No books found in "{selectedCategory}" matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 3. MY BOOKS TAB ── */}
        {activeTab === 'my-books' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">My Books</h1>
            <div className="card-glass overflow-hidden border border-white/5 rounded-2xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/30 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Book Name</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loans.map(loan => {
                      const rawLoan = allIssuedBooks.find(b => b.id === loan.id) || {};
                      return (
                        <tr key={loan.id} className="hover:bg-white/3 transition-colors">
                          <td className="p-4">
                            <span className="font-semibold text-sm text-white block">{loan.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{loan.isbn}</span>
                          </td>
                          <td className="p-4 text-sm text-slate-400">{loan.issuedOn}</td>
                          <td className="p-4 text-sm text-slate-400">{loan.dueDate}</td>
                          <td className="p-4"><StatusBadge status={loan.status} /></td>
                          <td className="p-4 text-right">
                            {loan.status === 'Pending Approval' ? (
                              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg inline-block">
                                Verification Pending
                              </span>
                            ) : (
                              <div className="flex justify-end gap-2">
                                {loan.fine > 0 && (
                                  <button
                                    onClick={() => startCheckout(loan)}
                                    className="bg-amber-600/20 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Wallet className="w-3.5 h-3.5" /> Return & Pay Fine
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenReturnModal(loan)}
                                  className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" /> {loan.fine > 0 ? 'Upload Proof' : 'Return'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {loans.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium text-sm">No active borrowings.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. RESERVATIONS ── */}
        {activeTab === 'reservations' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Waitlist & Reservations</h1>
            <div className="grid grid-cols-1 gap-4">
              {studentReservations.map(res => {
                const book = catalog.find(b => String(b.id) === String(res.bookId)) || {};
                const author = book.author || 'Unknown Author';
                const isbn = book.isbn || 'N/A';
                
                // Calculate waitlist position
                const waitlist = reservations
                  .filter(r => String(r.bookId) === String(res.bookId) && r.status === 'Pending')
                  .sort((a, b) => new Date(a.requestedOn || a.date) - new Date(b.requestedOn || b.date) || String(a.id).localeCompare(String(b.id)));
                const queuePos = waitlist.findIndex(r => r.id === res.id) + 1;
                const totalInQueue = waitlist.length;

                // Estimated wait time display
                let estWait = 'N/A';
                if (res.status === 'Approved') {
                  estWait = 'Ready for pickup';
                } else if (res.status === 'Pending') {
                  estWait = queuePos === 1 ? 'Approx. 2-3 days wait' : `Approx. ${queuePos * 5} days wait`;
                }

                // Pickup window logic (if approved, set 3 day deadline)
                const pickupDeadline = res.status === 'Approved'
                  ? (res.availableDate && res.availableDate !== 'Unknown'
                     ? new Date(new Date(res.availableDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                     : 'Within 3 days')
                  : null;

                return (
                  <div key={res.id} className="card-glass p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/5 rounded-2xl hover:bg-white/8 transition-all animate-fade-in">
                    <div className="flex items-start gap-4 w-full md:w-auto">
                      {/* Book Cover Mock */}
                      <div className="w-14 h-20 bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 rounded-xl flex flex-col justify-between p-2.5 shadow-md shrink-0 select-none">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider block truncate">{isbn}</span>
                      </div>

                      {/* Main Details */}
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-white text-base leading-snug truncate max-w-[280px] sm:max-w-md">{res.title}</h3>
                        <p className="text-xs text-slate-400 font-medium">by {author}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 font-semibold">
                          <span className="font-mono text-indigo-400">Ref ID: {res.id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span>ISBN: {isbn}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Fields Column */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-6 md:gap-8 text-xs w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Requested On</p>
                        <p className="font-bold text-slate-300 font-mono">{res.requestedOn || res.date}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Waitlist Pos.</p>
                        {res.status === 'Pending' ? (
                          <p className="font-bold text-amber-400 font-mono">#{queuePos} <span className="text-[10px] font-normal text-slate-500">of {totalInQueue}</span></p>
                        ) : (
                          <p className="font-bold text-emerald-400 font-mono">Active Hold</p>
                        )}
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                          {res.status === 'Approved' ? 'Pickup Deadline' : 'Est. Availability'}
                        </p>
                        <p className={`font-bold font-mono ${res.status === 'Approved' ? 'text-indigo-400' : 'text-slate-300'}`}>
                          {res.status === 'Approved' ? pickupDeadline : (res.availableDate && res.availableDate !== 'Unknown' ? res.availableDate : estWait)}
                        </p>
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Pickup Counter</p>
                        <p className="font-bold text-slate-300 truncate max-w-[150px]" title="Main Library Desk - Ground Floor">
                          Main Library Desk
                        </p>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <StatusBadge status={res.status} />
                      <button 
                        onClick={() => handleCancelReservation(res.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-500/10 hover:border-red-500/20 px-3.5 py-2 rounded-xl transition-all w-full md:w-auto justify-center"
                      >
                        <XCircle className="w-4 h-4 shrink-0" /> Cancel Waitlist
                      </button>
                    </div>
                  </div>
                );
              })}
              {studentReservations.length === 0 && (
                <div className="card-glass p-12 text-center text-slate-400 border border-white/5 rounded-2xl">
                  <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">You have no active reservations.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5. FINES & INTERACTIVE PAYMENTS ── */}
        {activeTab === 'fines' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Fines & Payments</h1>
            
            {/* Fine Header */}
            <div className="card-glass p-6 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Total Outstanding</p>
                <p className="text-5xl font-black text-white">₹{totalFineAmount}</p>
              </div>
              
              <div className="bg-slate-900/50 p-4 border border-white/5 rounded-2xl text-xs space-y-1.5 max-w-sm text-slate-400 font-medium">
                <p className="text-white font-bold uppercase tracking-wider text-[10px] text-amber-500">Fine policy rates</p>
                <p>· Borrow limit: <strong className="text-slate-200">{policy.maxBooks} books</strong></p>
                <p>· Late Return Fine: <strong className="text-slate-200">₹{policy.dailyFine}/day</strong></p>
              </div>
            </div>

            {/* List of outstanding fines */}
            <div className="card-glass overflow-hidden border border-white/5 rounded-2xl shadow-xl">
              <div className="bg-slate-800/30 px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white text-sm">Fines Ledger</h3>
              </div>
              <div className="divide-y divide-white/5">
                {pendingFines.map(loan => (
                  <div key={loan.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/3 transition-colors">
                    <div>
                      <p className="font-bold text-white text-sm">{loan.title}</p>
                      <p className="text-[11px] text-red-400 mt-1">Overdue since {loan.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-xl text-amber-400">₹{loan.fine}</p>
                      <button 
                        onClick={() => startCheckout(loan)}
                        className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider"
                      >
                        Pay Outstanding
                      </button>
                    </div>
                  </div>
                ))}
                {pendingFines.length === 0 && (
                  <div className="p-8 text-center text-emerald-500 font-medium bg-emerald-500/5 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" /> 
                    All clear! No pending fines.
                  </div>
                )}
              </div>
            </div>

            {/* Payment History ledger */}
            <div className="card-glass overflow-hidden border border-white/5 rounded-2xl shadow-xl">
              <div className="bg-slate-800/30 px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white text-sm">Payment History</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-xs bg-slate-800/10">
                    <th className="p-4 font-semibold">Transaction ID</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Details</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((p, i) => (
                    <tr key={i} className="hover:bg-white/3 transition-colors">
                      <td className="p-4 text-slate-300 font-mono text-xs">{p.txId}</td>
                      <td className="p-4 text-slate-400 text-xs">{p.date}</td>
                      <td className="p-4 text-xs text-slate-400">
                        <p className="font-bold text-slate-300">{p.type}</p>
                        {p.bookTitle && <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]">{p.bookTitle}</p>}
                      </td>
                      <td className="p-4 text-white font-bold">₹{p.amount}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedReceipt(p)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan="6" className="p-6 text-center text-slate-500 text-sm">No payment history found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ── 6. BORROWING HISTORY ── */}
        {activeTab === 'history' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Borrowing History</h1>
            
            <div className="card-glass overflow-hidden border border-white/5 rounded-2xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/30 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Book Name</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Return Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-white/3 transition-colors">
                        <td className="p-4 font-semibold text-white">{item.title}</td>
                        <td className="p-4 text-slate-400">{item.issuedOn}</td>
                        <td className="p-4 text-slate-400">{item.returnedOn}</td>
                        <td className="p-4"><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No borrowing history available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* ── MODAL A: RETURN PROOF UPLOADER ── */}
      {typeof document !== 'undefined' && returnModalLoan && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] md:max-h-[95vh] overflow-y-auto scroll-smooth text-white">
            <button 
              onClick={() => setReturnModalLoan(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"
            >
              <XCircle className="w-5.5 h-5.5" />
            </button>
            
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-indigo-400" /> Book Return Request
            </h3>
            
            <p className="text-xs text-slate-400 mb-4">
              Submitting proof of handover for <strong className="text-slate-200">{returnModalLoan.title}</strong> by {returnModalLoan.author}.
            </p>

            <form onSubmit={submitReturnRequest} className="space-y-3.5">
              {returnModalLoan.fine > 0 ? (
                <>
                  <div className="grid grid-cols-5 gap-3.5 items-center p-3.5 bg-slate-950/50 border border-white/5 rounded-xl">
                    <div className="col-span-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3 text-red-500" /> Late Fee Due
                      </div>
                      <p className="text-2xl font-black text-white leading-none">₹{returnModalLoan.fine}</p>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">UPI ID</p>
                        <p className="text-[10px] text-indigo-400 font-bold font-mono">library@college.edu</p>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-center gap-1.5">
                      <div className="p-1.5 bg-white rounded-lg w-20 h-20 flex items-center justify-center">
                        <svg className="w-18 h-18 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2v3h-3v2h3v2h2v-7h-2zm-3 2h2v-2h-2v2zm3-4h2v2h-2v-2zm-3-3h2V5h-2v2zm6 8h2v-2h-2v2zM8 8V6H6v2h2zm8 0V6h-2v2h2zM8 16v-2H6v2h2z" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Scan to Pay</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      UPI Transaction ID / UTR (12-Digit)
                    </label>
                    <input
                      required
                      type="text"
                      pattern="\d{12}"
                      maxLength={12}
                      value={utr}
                      onChange={e => {
                        setUtr(e.target.value.replace(/\D/g, ''));
                        if (utrError) setUtrError('');
                      }}
                      className="input-field py-2 font-mono text-center tracking-widest text-sm bg-slate-950/60 border border-white/10"
                      placeholder="e.g. 518392018472"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Payment Screenshot
                    </label>
                    <label className="border border-dashed border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-indigo-500/40 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer transition-colors block text-left">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${screenshot ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-200 font-semibold truncate">
                          {screenshotName || 'Upload payment screenshot'}
                        </p>
                        <p className="text-[10px] text-slate-500">Tap to select image</p>
                      </div>
                      <input 
                        type="file" 
                        required
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setScreenshotName(file.name);
                            if (utrError) setUtrError('');
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setScreenshot(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="bg-slate-800/30 border border-white/5 p-4 rounded-xl text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">No Late Fees Due</p>
                  <p className="text-[11px] text-slate-400 mt-1">This return request is on time. No payment required.</p>
                </div>
              )}

              {utrError && (
                <p className="text-xs font-bold text-red-500 text-center">{utrError}</p>
              )}

              <button 
                type="submit" 
                className="w-full btn-primary justify-center py-2.5 text-xs font-bold uppercase tracking-widest mt-1"
              >
                {returnModalLoan.fine > 0 ? 'Submit Return Request' : 'Confirm Return Request'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL B: INTERACTIVE PAYMENT GATEWAY SIMULATOR ── */}
      {typeof document !== 'undefined' && checkoutLoan && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative max-h-[90vh] md:max-h-[95vh] overflow-y-auto scroll-smooth">
            
            {/* Header */}
            <div className="p-6 bg-slate-950/40 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-400" /> College Payment Gateway
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Secure sandbox environment</p>
              </div>
              <button 
                onClick={() => setCheckoutLoan(null)}
                disabled={isVerifyingPayment}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-20"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Steps Spinner Overlay */}
            {isVerifyingPayment && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                <h4 className="text-base font-bold text-white mb-2">Processing Transaction</h4>
                <div className="space-y-1.5 max-w-xs w-full text-xs text-slate-400 font-medium">
                  <p className={verificationStep >= 1 ? 'text-emerald-400 font-bold' : ''}>
                    {verificationStep >= 1 ? '✓' : '●'} Connecting to bank gateway...
                  </p>
                  <p className={verificationStep >= 2 ? 'text-emerald-400 font-bold' : ''}>
                    {verificationStep >= 2 ? '✓' : '●'} Verifying transaction details...
                  </p>
                  <p className={verificationStep >= 3 ? 'text-emerald-400 font-bold' : ''}>
                    {verificationStep >= 3 ? '✓' : '●'} finalising receipt ledger...
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Checkout info */}
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Fee Type: Late Return Fine</span>
                  <h4 className="font-bold text-slate-200 text-sm mt-0.5 truncate max-w-[250px]">{checkoutLoan.title}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Due</span>
                  <span className="text-2xl font-black text-white">₹{checkoutLoan.fine}</span>
                </div>
              </div>

              {/* Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-white/5">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'upi' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" /> UPI Scan / UTR
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Credit/Debit Card
                </button>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="col-span-3 space-y-2 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        <Info className="w-4 h-4 text-indigo-400" /> UPI Merchant
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">College Library Services</p>
                      <p className="text-xs font-bold text-slate-400 font-mono">VPA: library@college.edu</p>
                      
                      {/* Dynamic Scan Countdown */}
                      <div className="pt-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Scan expires in: <span className="text-amber-400 font-mono">
                          {Math.floor(qrTimer / 60)}:{String(qrTimer % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-center">
                      <div className="p-2 bg-white rounded-2xl w-24 h-24 flex items-center justify-center shadow-2xl relative group overflow-hidden">
                        {/* Dynamic Scan pulse animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-indigo-500 top-0 animate-[scan_2s_ease-in-out_infinite]" />
                        <svg className="w-20 h-20 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2v3h-3v2h3v2h2v-7h-2zm-3 2h2v-2h-2v2zm3-4h2v2h-2v-2zm-3-3h2V5h-2v2zm6 8h2v-2h-2v2zM8 8V6H6v2h2zm8 0V6h-2v2h2zM8 16v-2H6v2h2z" />
                        </svg>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5">Scan QR to pay</span>
                    </div>
                  </div>

                  <form onSubmit={handleUpiPaySubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        12-Digit Transaction Reference (UTR)
                      </label>
                      <input
                        required
                        type="text"
                        pattern="\d{12}"
                        maxLength={12}
                        value={utr}
                        onChange={e => {
                          setUtr(e.target.value.replace(/\D/g, ''));
                          if (utrError) setUtrError('');
                        }}
                        placeholder="e.g. 629381048293"
                        className="input-field py-2.5 font-mono text-center text-sm tracking-widest bg-slate-950/60 border border-white/10 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Upload Handover Screenshot / Receipt
                      </label>
                      <label className="border border-dashed border-slate-700 bg-slate-950/30 hover:bg-slate-950/70 hover:border-indigo-500/40 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-colors block text-left">
                        <CheckCircle className={`w-6 h-6 shrink-0 ${screenshot ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-300 font-bold truncate">
                            {screenshotName || 'Select image/receipt photo'}
                          </p>
                          <p className="text-[10px] text-slate-500">Formats: JPG, PNG, WebP</p>
                        </div>
                        <input
                          type="file"
                          required
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setScreenshotName(file.name);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setScreenshot(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {utrError && <p className="text-xs font-bold text-red-400 text-center">{utrError}</p>}

                    <button 
                      type="submit" 
                      className="w-full btn-primary justify-center py-3 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20"
                    >
                      Verify & Confirm Return
                    </button>
                  </form>
                </div>
              )}

              {/* CARD Tab */}
              {paymentMethod === 'card' && (
                <div className="space-y-6">
                  {/* Styled Credit Card Mockup */}
                  <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-white/10 p-5 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 bg-amber-500/80 rounded-md border border-white/10 relative overflow-hidden flex items-center justify-center shadow">
                        <div className="w-3.5 h-full border-r border-slate-900/10" />
                        <div className="w-3.5 h-2/3 border-y border-slate-900/10" />
                      </div>
                      
                      {/* Dynamic Brand Logo */}
                      <span className="text-slate-300 font-black tracking-widest text-xs uppercase italic select-none">
                        {getCardType(cardNo) === 'visa' && <span className="text-blue-400 font-extrabold text-sm">VISA</span>}
                        {getCardType(cardNo) === 'mastercard' && <span className="text-red-400 font-extrabold text-sm">MasterCard</span>}
                        {getCardType(cardNo) === 'generic' && <span className="text-slate-500 text-[10px]">CARD</span>}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Card Number display */}
                      <p className="text-xl font-bold font-mono tracking-widest text-white mt-1 drop-shadow-md">
                        {cardNo || '•••• •••• •••• ••••'}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-none mb-1">Cardholder</p>
                          <p className="font-bold text-slate-300 tracking-wide truncate max-w-[200px] uppercase font-mono">
                            {cardName || 'NAME SURNAME'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-none mb-1">Expires</p>
                          <p className="font-bold text-slate-300 font-mono">
                            {cardExpiry || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCardPaySubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Cardholder Name
                      </label>
                      <input
                        required
                        type="text"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                        placeholder="John Doe"
                        className="input-field py-2 text-sm bg-slate-950/60 border border-white/10 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Card Number (16-Digit)
                      </label>
                      <input
                        required
                        type="text"
                        maxLength={19} // 16 digits + 3 spaces
                        value={cardNo}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          const matches = val.match(/\d{4}/g);
                          const extra = val.length % 4;
                          let formatted = '';
                          if (matches) {
                            formatted = matches.join(' ');
                            if (extra > 0) {
                              formatted += ' ' + val.slice(-extra);
                            }
                          } else {
                            formatted = val;
                          }
                          setCardNo(formatted);
                        }}
                        placeholder="4111 2222 3333 4444"
                        className="input-field py-2 font-mono text-sm bg-slate-950/60 border border-white/10 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          Expiry Date
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={5} // MM/YY
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) {
                              val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            }
                            setCardExpiry(val);
                          }}
                          className="input-field py-2 font-mono text-center text-sm bg-slate-950/60 border border-white/10 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          CVV / CVN
                        </label>
                        <input
                          required
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="input-field py-2 text-center font-mono text-sm bg-slate-950/60 border border-white/10 rounded-xl"
                        />
                      </div>
                    </div>

                    {cardError && <p className="text-xs font-bold text-red-400 text-center">{cardError}</p>}

                    <button 
                      type="submit" 
                      className="w-full btn-primary justify-center py-3 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20"
                    >
                      Pay ₹{checkoutLoan.fine} & Clear Fine
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL C: BILLING RECEIPT INVOICE MODAL (SUCCESS) ── */}
      {typeof document !== 'undefined' && showSuccessReceipt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-scale-up text-white">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] md:max-h-[95vh] overflow-y-auto scroll-smooth">
            
            {/* Top success badge */}
            <div className="bg-emerald-500/10 p-6 text-center border-b border-white/5 space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Payment Successful</h3>
              <p className="text-xs text-emerald-400 font-medium">Verified Late Fee Invoice Generated</p>
            </div>

            {/* Printable Receipt area */}
            <div className="p-6 space-y-5" id="library-invoice-print-area">
              <div className="flex justify-between items-start text-xs border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-black text-slate-200 text-sm">LibraryOS Services</h4>
                  <p className="text-slate-500 mt-0.5">Academic Library Accounts</p>
                  <p className="text-slate-500">LMS Admin Desk</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Receipt ID</p>
                  <p className="font-mono text-slate-300 font-bold text-xs">{showSuccessReceipt.txId || showSuccessReceipt.id}</p>
                  <p className="text-slate-500 text-[10px] mt-1">Date: {showSuccessReceipt.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Bill To</span>
                  <p className="font-bold text-white mt-1">{memberName}</p>
                  <p className="text-slate-400">ID: {memberId}</p>
                  <p className="text-slate-400 font-mono">{studentMember.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Payment Mode</span>
                  <p className="font-bold text-slate-300 mt-1">{showSuccessReceipt.paymentMethod}</p>
                  <span className="mt-1.5 inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {showSuccessReceipt.status}
                  </span>
                </div>
              </div>

              {/* Fee details table */}
              <div className="border-t border-b border-white/5 py-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Late Fee: "{showSuccessReceipt.bookTitle || 'Overdue Book'}"</span>
                  <span>₹{showSuccessReceipt.amount}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-white text-sm">
                  <span>Grand Total Paid</span>
                  <span className="text-emerald-400">₹{showSuccessReceipt.amount}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500">
                This is a computer-generated sandbox invoice for LibraryOS ledger.
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setShowSuccessReceipt(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL D: HISTORY RECEIPT MODAL (VIEW HISTORIC) ── */}
      {typeof document !== 'undefined' && selectedReceipt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-scale-up text-white">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] md:max-h-[95vh] overflow-y-auto scroll-smooth">
            
            {/* Header */}
            <div className="p-5 bg-slate-950/30 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> Library Invoice
                </h3>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                <XCircle className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Receipt invoice content */}
            <div className="p-6 space-y-5" id="library-invoice-history-print">
              <div className="flex justify-between items-start text-xs border-b border-white/5 pb-4">
                <div>
                  <h4 className="font-black text-slate-200 text-sm">LibraryOS Services</h4>
                  <p className="text-slate-500 mt-0.5">Academic Library Accounts</p>
                  <p className="text-slate-500">LMS Admin Desk</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Receipt ID</p>
                  <p className="font-mono text-slate-300 font-bold text-xs">{selectedReceipt.txId}</p>
                  <p className="text-slate-500 text-[10px] mt-1">Date: {selectedReceipt.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Bill To</span>
                  <p className="font-bold text-white mt-1">{memberName}</p>
                  <p className="text-slate-400">ID: {memberId}</p>
                  <p className="text-slate-400 font-mono">{studentMember.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Payment Mode</span>
                  <p className="font-bold text-slate-300 mt-1">{selectedReceipt.paymentMethod || 'UPI'}</p>
                  <span className="mt-1.5 inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-white/5 py-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Late Fee: "{selectedReceipt.bookTitle || 'Overdue Book'}"</span>
                  <span>₹{selectedReceipt.amount}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold text-white text-sm">
                  <span>Grand Total Paid</span>
                  <span className="text-emerald-400">₹{selectedReceipt.amount}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500">
                This is a computer-generated sandbox invoice for LibraryOS ledger.
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-950/40 border-t border-white/5 flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL E: BOOK DETAILS & RELATED RECOMMENDATIONS ── */}
      {typeof document !== 'undefined' && detailBook && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setDetailBook(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full p-1"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
              
              {/* Left Column: Mock Cover (Large) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-40 h-56 bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-white/20 rounded-2xl flex flex-col justify-between p-4 shadow-2xl relative select-none">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <BookOpen className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h3 className="font-black text-white text-base leading-snug tracking-tight drop-shadow-md text-left">{detailBook.title}</h3>
                    <p className="text-[10px] text-indigo-300 font-bold text-left mt-1">by {detailBook.author}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center gap-1.5 bg-slate-950/50 border border-white/5 rounded-2xl px-4 py-2.5 w-full max-w-[160px]">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-white">4.8</span>
                    {renderStars(5)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium">Based on 14 reviews</span>
                </div>
              </div>

              {/* Right Column: Book Details */}
              <div className="md:col-span-7 space-y-4 text-left">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {detailBook.category || 'General Category'}
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight mt-2">{detailBook.title}</h2>
                  <p className="text-sm text-slate-300 mt-0.5">by <span className="font-semibold text-white">{detailBook.author}</span></p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-b border-white/5 pb-3 font-mono">
                  <span>ISBN: {detailBook.isbn}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span>Copies: {detailBook.total || 5}</span>
                </div>

                {/* Synopsis */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synopsis</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {BOOK_DESCRIPTIONS[detailBook.title] || 'No detailed synopsis available in catalog for this edition. Please check the librarian portal for secondary files or indexes.'}
                  </p>
                </div>

                {/* Star Ratings list */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1">Top Reviews</h4>
                  <div className="space-y-2.5 max-h-32 overflow-y-auto pr-1">
                    {BOOK_REVIEWS.slice(0, 2).map((rev, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300">{rev.user}</span>
                          {renderStars(rev.rating)}
                        </div>
                        <p className="text-slate-400 italic font-medium">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Recommendations list */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended books</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {catalog
                      .filter(b => b.id !== detailBook.id && (b.category === detailBook.category || b.author === detailBook.author))
                      .slice(0, 2)
                      .map(b => (
                        <div 
                          key={b.id} 
                          onClick={() => setDetailBook(b)}
                          className="p-2 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer text-left flex items-center gap-2 group"
                        >
                          <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-105 transition-transform" />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{b.title}</p>
                            <p className="text-[9px] text-slate-500 truncate">by {b.author}</p>
                          </div>
                        </div>
                      ))}
                    {catalog.filter(b => b.id !== detailBook.id && (b.category === detailBook.category || b.author === detailBook.author)).length === 0 && (
                      <p className="text-[10px] text-slate-600 italic col-span-2">No related books in this category currently catalogued.</p>
                    )}
                  </div>
                </div>

                {/* Primary borrow button */}
                <div className="pt-2">
                  {isAvailable(detailBook) ? (
                    <button 
                      onClick={() => handleBorrow(detailBook)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Borrow Book Now
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReserve(detailBook)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl transition-all shadow-lg shadow-amber-500/20"
                    >
                      Reserve Book / Enter Waitlist
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
