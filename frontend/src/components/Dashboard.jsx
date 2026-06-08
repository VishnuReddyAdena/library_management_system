import React, { useState, useEffect } from 'react';
import {
  Users, BookText, AlertCircle, TrendingUp, Search, Plus,
  RotateCcw, UserPlus, ShoppingCart, BookMarked, ChevronRight,
  Package, Edit3, Trash2, CheckCircle, XCircle, BookOpen, Pin, Mail,
  CreditCard, FileText, Calendar, Download, BarChart2, Shield, Upload
} from 'lucide-react';
import { addAuditLog } from '../utils/auditLogger';
import authService from '../services/authService';

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

  return [value, setValue];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ISSUED_BOOKS = [
  { id: 1, member: 'John Doe', memberId: 'M001', book: 'Clean Code', isbn: '9780132350884', issuedOn: '2025-03-22', dueDate: '2025-04-05', fine: 0, status: 'issued' },
  { id: 2, member: 'Priya Nair', memberId: 'M002', book: 'System Design Interview', isbn: '9798664653403', issuedOn: '2025-03-10', dueDate: '2025-03-24', fine: 27.00, status: 'issued' },
  { id: 3, member: 'Rahul Singh', memberId: 'M003', book: 'Deep Learning', isbn: '9780262035613', issuedOn: '2025-03-25', dueDate: '2025-04-08', fine: 0, status: 'issued' },
];

const MEMBERS = [
  { id: 'M001', name: 'John Doe', type: 'Student', expiry: '2026-01-01', status: 'Active' },
  { id: 'M002', name: 'Priya Nair', type: 'Faculty', expiry: '2025-06-30', status: 'Active' },
  { id: 'M003', name: 'Rahul Singh', type: 'Student', expiry: '2025-04-10', status: 'Expiring' },
  { id: 'M004', name: 'Alice Johnson', type: 'Student', expiry: '2024-12-31', status: 'Expired' },
];

const ORDERS = [
  { id: 'PO001', publisher: 'O\'Reilly Media', items: 12, amount: 18400, status: 'Pending' },
  { id: 'PO002', publisher: 'Pearson Education', items: 8, amount: 9600, status: 'Shipped' },
  { id: 'PO003', publisher: 'Springer Publications', items: 5, amount: 6250, status: 'Received' },
];

const PUBLISHERS = [
  { id: 1, name: "O'Reilly Media", email: 'orders@oreilly.com', books: 47 },
  { id: 2, name: 'Pearson Education', email: 'orders@pearson.com', books: 62 },
  { id: 3, name: 'Springer', email: 'orders@springer.com', books: 33 },
];

const AUTHORS = [
  { id: 1, name: 'Robert C. Martin', born: '1952', books: 8 },
  { id: 2, name: 'Andrew Hunt', born: '1964', books: 5 },
  { id: 3, name: 'Thomas H. Cormen', born: '1956', books: 4 },
];

const MOCK_BOOKS_CATALOG = [
  { id: 'B001', title: 'Clean Code', author: 'Robert C. Martin', category: 'Software', isbn: '9780132350884', total: 10, available: 8 },
  { id: 'B002', title: 'System Design Interview', author: 'Alex Xu', category: 'Engineering', isbn: '9798664653403', total: 5, available: 1 },
  { id: 'B003', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Software', isbn: '9780135957059', total: 12, available: 12 },
  { id: 'B004', title: 'Deep Learning', author: 'Ian Goodfellow', category: 'AI/ML', isbn: '9780262035613', total: 4, available: 0 },
];

const MOCK_RESERVATIONS = [
  { id: 'RES001', memberId: 'M003', member: 'Rahul Singh', bookId: 'B002', title: 'System Design Interview', date: '2025-04-10', status: 'Pending' },
  { id: 'RES002', memberId: 'M001', member: 'John Doe', bookId: 'B004', title: 'Deep Learning', date: '2025-04-12', status: 'Approved' },
  { id: 'RES003', memberId: 'M004', member: 'Alice Johnson', bookId: 'B002', title: 'System Design Interview', date: '2025-04-13', status: 'Pending' },
];

const MOCK_PAYMENTS = [
  { id: 'PAY-1101', member: 'Priya Nair', memberId: 'M002', amount: 27.00, type: 'Late Fine', status: 'Verified', date: '2025-04-11' },
  { id: 'PAY-1102', member: 'Rahul Singh', memberId: 'M003', amount: 15.00, type: 'Lost Book', status: 'Pending', date: '2025-04-12' },
  { id: 'PAY-1103', member: 'Alice Johnson', memberId: 'M004', amount: 5.00, type: 'Late Fine', status: 'Pending', date: '2025-04-13' },
];

const RECENT_ACTIVITY = [
  { text: '"Clean Code" issued to John Doe', time: '10m ago', type: 'issue' },
  { text: '"Design Patterns" returned by Sarah', time: '35m ago', type: 'return' },
  { text: 'New member: Alice Johnson onboarded', time: '1h ago', type: 'member' },
  { text: 'PO002 received from Pearson Education', time: '3h ago', type: 'order' },
  { text: 'Fine of ₹27 waived for M002', time: '5h ago', type: 'fine' },
];

const MOCK_LOGS = [
  { id: 1, user: 'Admin One',   action: 'Updated fine rate to ₹12/day',        time: '2m ago',  level: 'warning' },
  { id: 2, user: 'Sarah Mehta', action: 'Deleted book ISBN 9780132350884',      time: '15m ago', level: 'error'   },
  { id: 3, user: 'System',      action: 'Backup completed successfully',        time: '1h ago',  level: 'success' },
  { id: 4, user: 'Admin One',   action: 'Added new librarian L003',             time: '3h ago',  level: 'info'    },
  { id: 5, user: 'System',      action: 'Scheduled fine auto-calculation ran',  time: '6h ago',  level: 'success' },
  { id: 6, user: 'Sarah Mehta', action: 'Issued 5 books via bulk scan',         time: '8h ago',  level: 'info'    },
  { id: 7, user: 'Admin One',   action: 'Blocked member M003 (Rahul Singh)',    time: '1d ago',  level: 'warning' },
];

const TABS = [
  { key: 'overview',      label: 'Overview',        icon: TrendingUp  },
  { key: 'books',         label: 'Books Management', icon: BookText    },
  { key: 'users',         label: 'Users',            icon: Users       },
  { key: 'circulation',   label: 'Issue / Return',   icon: RotateCcw   },
  { key: 'reservations',  label: 'Reservations',     icon: Calendar    },
  { key: 'payments',      label: 'Payments',         icon: CreditCard  },
  { key: 'reports',       label: 'Reports',          icon: FileText    },
  { key: 'logs',          label: 'Audit Logs',       icon: FileText    },
];

// ─── Sub-sections ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card-glass p-6 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className="text-slate-300 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function Overview({ onSwitchTab, issuedBooks, setIssuedBooks, members, logs, user }) {
  const [memberId, setMemberId] = useLocalStorage('library_quick_memberId', '');
  const [isbn, setIsbn] = useLocalStorage('library_quick_isbn', '');
  const [memberSearch, setMemberSearch] = useState('');

  const handleQuickIssue = () => {
    if (!memberId || !isbn) {
      alert("Please enter both Member ID and Book ISBN.");
      return;
    }

    if (issuedBooks.some(b => b.memberId === memberId && b.status === 'issued')) {
      alert("No duplicated data is allowed");
      return;
    }

    const memberObj = MEMBERS.find(m => m.id === memberId);
    if (!memberObj) {
      alert("Member not found! (Try M001 or M002 for mock data)");
      return;
    }
    const bookToAdd = {
      id: Date.now(),
      member: memberObj.name,
      memberId: memberId,
      book: 'Quick Scan Book',
      isbn: isbn,
      issuedOn: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      fine: 0,
      status: 'issued'
    };
    setIssuedBooks([bookToAdd, ...issuedBooks]);
    addActivity(`"${bookToAdd.book}" issued to ${memberObj.name}`, 'issue');
    addAuditLog(`Issued book "${bookToAdd.book}" (ISBN: ${isbn}) to ${memberObj.name}`, 'success', user?.name || 'Librarian');
    alert(`Book ${isbn} successfully issued to ${memberObj.name}. (Check Circulation Tab)`);
    setMemberId('');
    setIsbn('');
  };

  const handleQuickReturn = () => {
    if (!isbn) {
      alert("Please enter at least the Book ISBN to return.");
      return;
    }
    const bookIndex = issuedBooks.findIndex(b => b.isbn === isbn && b.status === 'issued' && (memberId ? b.memberId === memberId : true));
    if (bookIndex === -1) {
      alert("No active record found for this ISBN.");
      return;
    }
    const updated = [...issuedBooks];
    let finalFine = updated[bookIndex].fine || 0;
    const due = new Date(updated[bookIndex].dueDate);
    const now = new Date();
    if (due < now) {
      const daysLeft = (due - now) / 86400000;
      finalFine += Math.floor(Math.max(daysLeft * -1, 1)) * 10;
    }
    updated[bookIndex] = { ...updated[bookIndex], status: 'returned', fine: finalFine, returnedOn: now.toISOString() };
    setIssuedBooks(updated);
    const memberName = members.find(m => m.id === updated[bookIndex].memberId)?.name || 'Member';
    addActivity(`"${updated[bookIndex].book}" returned by ${memberName}`, 'return');
    addAuditLog(`Returned book "${updated[bookIndex].book}" (ISBN: ${isbn}) from ${memberName}`, 'success', user?.name || 'Librarian');
    if (finalFine > updated[bookIndex].fine) {
      addActivity(`Fine of ₹${finalFine} registered for ${memberName}`, 'fine');
      addAuditLog(`Late fine of ₹${finalFine} registered for ${memberName}`, 'warning', user?.name || 'Librarian');
    }
    alert(`Reference ${isbn} successfully returned!`);
    setMemberId('');
    setIsbn('');
  };

  const overdueBooks = issuedBooks.filter(b => b.status === 'issued' && new Date(b.dueDate) < new Date());
  const pendingFines = issuedBooks.reduce((sum, b) => {
    let fine = b.fine || 0;
    if (b.status === 'issued' && new Date(b.dueDate) < new Date()) {
      fine += Math.floor(Math.max((new Date() - new Date(b.dueDate)) / 86400000, 1)) * 10;
    }
    return sum + fine;
  }, 0);

  return (
    <div className="space-y-8 relative">
      {memberSearch && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] z-30 transition-all duration-300"
          onClick={() => setMemberSearch('')}
        />
      )}

      {/* Universal Member Search */}
      <div className={`card-glass flex items-center gap-3 relative rounded-2xl mx-1 z-40 transition-all ${memberSearch ? 'ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-[1.01] bg-slate-900 border-indigo-500/30' : ''}`}>
        <div className="pl-5 text-slate-400 font-bold"><Search className="w-5 h-5" /></div>
        <input
          type="text"
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Lookup members instantly by Name or ID..."
          className="bg-transparent border-none text-white text-base w-full focus:outline-none focus:ring-0 py-4 placeholder-slate-500 font-medium tracking-tight rounded-2xl"
        />
        {memberSearch && (
          <div className="absolute top-[110%] left-0 right-0 bg-slate-900 p-2 max-h-72 overflow-y-auto shadow-2xl shadow-black/50 rounded-2xl border border-white/10 origin-top animate-fade-in text-sm">
            {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.id.toLowerCase().includes(memberSearch.toLowerCase())).length > 0 ? (
              members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.id.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                <div key={m.id} className="p-4 hover:bg-white/5 rounded-xl flex items-center justify-between cursor-default transition-colors">
                  <div>
                    <p className="text-white font-semibold flex items-center gap-2">{m.name} <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] tracking-wider">{m.id}</span></p>
                    <p className="text-slate-400 text-xs mt-1">{m.email}</p>
                  </div>
                  <span className={`badge border ${m.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : m.status === 'Expired' ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
                    {m.status === 'Expired' ? 'Frozen' : m.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm py-8 text-center font-medium">No registered member found.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookText} label="Total Books" value="1,248" sub="+12 this month" color="bg-indigo-500" />
        <StatCard icon={TrendingUp} label="Books Issued" value={issuedBooks.filter(b => b.status === 'issued').length.toString()} sub="Live data" color="bg-emerald-500" />
        <StatCard icon={Users} label="Active Members" value={MEMBERS.filter(m => m.status === 'Active').length.toString()} sub="Updated" color="bg-purple-500" />
        <StatCard icon={AlertCircle} label="Overdue / Fines" value={overdueBooks.length.toString()} sub={`₹${pendingFines} pending`} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Scan Bar */}
        <div className="card-glass p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><BookMarked className="w-5 h-5 text-indigo-400" />Quick Circulation</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">Member ID / Barcode Scan</label>
              <div className="flex gap-2">
                <input type="text" value={memberId} onChange={(e) => setMemberId(e.target.value.toUpperCase())} className="input-field flex-1" placeholder="e.g. M001 or M002" />
                <button className="btn-primary px-4"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">Book ISBN / Barcode Scan</label>
              <div className="flex gap-2">
                <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="input-field flex-1" placeholder="e.g. 9780132350884" />
                <button className="btn-primary px-4"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleQuickIssue} className="btn-primary flex-1 justify-center py-3"><Plus className="w-4 h-4" />Issue Book</button>
              <button onClick={handleQuickReturn} className="flex-1 justify-center py-3 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl border border-white/10 transition-all">
                <RotateCcw className="w-4 h-4" />Return Book
              </button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-glass p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-red-500 tracking-wider flex items-center gap-2">
              <span className="text-red-500 animate-pulse text-base leading-none">●</span> Live Activity
            </h3>
            <button 
              onClick={() => onSwitchTab('logs')}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full transition-colors"
            >
              View All Logs
            </button>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-2">
            {(logs || []).slice(0, 5).map((log, i) => {
              const styles = { 
                success: { icon: CheckCircle, colors: 'text-emerald-400 bg-emerald-500/10' }, 
                error:   { icon: XCircle,     colors: 'text-red-400 bg-red-500/10' }, 
                warning: { icon: AlertCircle, colors: 'text-amber-400 bg-amber-500/10' }, 
                info:    { icon: FileText,    colors: 'text-blue-400 bg-blue-500/10' } 
              }[log.level] || { icon: FileText, colors: 'text-blue-400 bg-blue-500/10' };
              const Icon = styles.icon;
              const formatTime = (l) => {
                if (l.timestamp) {
                  const diff = Math.floor((Date.now() - l.timestamp) / 60000);
                  if (diff < 1) return 'Just now';
                  if (diff < 60) return `${diff}m ago`;
                  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
                  return `${Math.floor(diff / 1440)}d ago`;
                }
                return l.time;
              };
              return (
                <div key={log.id || i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors relative">
                  {i !== 4 && <div className="absolute left-[27px] top-10 bottom-0 w-[1px] bg-white/10" />}
                  <div className={`p-2 rounded-full h-fit flex-shrink-0 z-10 ${styles.colors}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 mt-0.5 leading-snug">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <span className="text-slate-400">{log.user}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{formatTime(log)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Circulation({ issuedBooks, setIssuedBooks, addActivity, user }) {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newBook, setNewBook] = useLocalStorage('library_draft_newBook', { member: '', memberId: '', book: '', isbn: '', dueDate: '' });

  // Return Flow States
  const [returnModalBook, setReturnModalBook] = useState(null);
  const [returnMethod, setReturnMethod] = useState('email');
  const [returnEmail, setReturnEmail] = useState('');
  const [returnPhone, setReturnPhone] = useState('');
  const [returnCode, setReturnCode] = useState('');
  const [actualOtp, setActualOtp] = useState(null);
  const [otpError, setOtpError] = useState('');
  const [returnProof, setReturnProof] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // Email Alert Modal State
  const [emailModal, setEmailModal] = useState(null); // { to, subject, body }
  const [copied, setCopied] = useState(false);

  const openEmailModal = (row, subject, body, recipientEmail) => {
    setEmailModal({ to: recipientEmail || '', subject, body, memberName: row.member });
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailModal.body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSendEmail = () => {
    const { to, subject, body } = emailModal;
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_self');
  };

  const handleIssue = (e) => {
    e.preventDefault();
    if (!newBook.member || !newBook.book) return;

    if (issuedBooks.some(b => b.memberId === newBook.memberId && b.status === 'issued')) {
      alert("No duplicated data is allowed");
      return;
    }

    const bookToAdd = {
      id: Date.now(),
      ...newBook,
      memberId: newBook.memberId || 'M00X',
      isbn: newBook.isbn || '978XXXXXXXXXX',
      issuedOn: new Date().toISOString().split('T')[0],
      dueDate: newBook.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      fine: 0,
      status: 'issued'
    };
    setIssuedBooks([bookToAdd, ...issuedBooks]);
    addActivity(`"${bookToAdd.book}" formally issued to ${bookToAdd.member}`, 'issue');
    addAuditLog(`Issued book "${bookToAdd.book}" (ISBN: ${bookToAdd.isbn}) to ${bookToAdd.member}`, 'success', user?.name || 'Librarian');
    setShowIssueModal(false);
    setNewBook({ member: '', memberId: '', book: '', isbn: '', dueDate: '' });
  };

  const handleReturnClick = (book) => {
    setReturnModalBook(book);
    setReturnMethod('email');
    setReturnEmail('');
    setReturnPhone('');
    setReturnCode('');
    setReturnProof(null);
    setOtpSent(false);
    setActualOtp(null);
    setOtpError('');
  };

  const handleGetOtp = (e) => {
    e.preventDefault();
    if (returnMethod === 'email' && !returnEmail) return;
    if (returnMethod === 'phone' && !returnPhone) return;

    setOtpError('');
    const destination = returnMethod === 'email' ? returnEmail : returnPhone;

    if (returnMethod === 'email') {
      authService.post('/api/otp/send', { email: destination })
        .then(response => {
          setOtpSent(true);
          if (response.data.simulated) {
            setActualOtp(response.data.otp); // fallback local storage for mock verification
            alert(`[OTP SIMULATION]\nSMTP settings are not configured in backend/.env.\n\nSimulated OTP code has been logged to the console.\n\nTo: ${destination}\nVerification Code: ${response.data.otp}`);
          } else {
            setActualOtp(null); // code is verified in the backend
            alert(`A 6-digit verification code has been sent to: ${destination}`);
          }
        })
        .catch(err => {
          console.error(err);
          const errorMsg = err.response?.data?.error || err.message || 'Failed to connect to authentication server.';
          setOtpError(`Failed to send code: ${errorMsg}`);
        });
    } else {
      // Simulate sending SMS
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setActualOtp(generatedCode);
      setOtpSent(true);
      alert(`[SMS SIMULATION]\nA code has been sent to: ${destination}\n\nSubject: LibraryOS Verification\nBody: Your book return verification code is ${generatedCode}.`);
    }

    setTimeout(() => {
      setOtpSent(false); // allow requesting again after 15 seconds
    }, 15000);
  };

  const confirmReturn = (e) => {
    e.preventDefault();
    if (!returnCode) return;
    setOtpError('');

    const destination = returnMethod === 'email' ? returnEmail : returnPhone;

    const completeReturn = () => {
      let calculatedFine = 0;
      setIssuedBooks(issuedBooks.map(b => {
        if (b.id === returnModalBook.id) {
          calculatedFine = b.fine || 0;
          const due = new Date(b.dueDate);
          const now = new Date();
          if (due < now) {
            const daysLeft = (due - now) / 86400000;
            calculatedFine += Math.floor(Math.max(daysLeft * -1, 1)) * 10;
          }
          return { ...b, status: 'returned', fine: calculatedFine, returnedOn: now.toISOString() };
        }
        return b;
      }));
      addActivity(`"${returnModalBook.book}" formally returned by ${returnModalBook.member}`, 'return');
      addAuditLog(`Returned book "${returnModalBook.book}" (ISBN: ${returnModalBook.isbn}) from ${returnModalBook.member}`, 'success', user?.name || 'Librarian');
      if (calculatedFine > (returnModalBook.fine || 0)) {
        addActivity(`System mapped fine of ₹${calculatedFine} for ${returnModalBook.member}`, 'fine');
        addAuditLog(`Late fine of ₹${calculatedFine} registered for ${returnModalBook.member}`, 'warning', user?.name || 'Librarian');
      }
      setReturnModalBook(null);
    };

    if (returnMethod === 'email' && !actualOtp) {
      // Real backend verification
      authService.post('/api/otp/verify', { email: destination, otp: returnCode })
        .then(response => {
          if (response.data.success) {
            completeReturn();
          } else {
            setOtpError(response.data.error || 'Invalid code!');
          }
        })
        .catch(err => {
          console.error(err);
          const errorMsg = err.response?.data?.error || err.message || 'Failed to verify code with server.';
          setOtpError(errorMsg);
        });
    } else {
      // Local/SMS simulation fallback verification
      if (returnCode.trim() !== actualOtp) {
        setOtpError('Invalid code!');
        return;
      }
      completeReturn();
    }
  };

  const handleUndoReturn = (id) => {
    setIssuedBooks(issuedBooks.map(b => b.id === id ? { ...b, status: 'issued' } : b));
    const target = issuedBooks.find(b => b.id === id);
    addActivity(`Return successfully reversed for "${target.book}"`, 'issue');
    addAuditLog(`Reversed return of book "${target.book}" for ${target.member}`, 'warning', user?.name || 'Librarian');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Issued Books</h2>
        <button onClick={() => setShowIssueModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />Issue New Book
        </button>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowIssueModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Issue New Book</h3>
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Member Name</label>
                <input required type="text" value={newBook.member} onChange={e => setNewBook({ ...newBook, member: e.target.value })} className="input-field py-2" placeholder="e.g. Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Member ID</label>
                <input type="text" value={newBook.memberId} onChange={e => setNewBook({ ...newBook, memberId: e.target.value })} className="input-field py-2" placeholder="e.g. M005" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title</label>
                <input required type="text" value={newBook.book} onChange={e => setNewBook({ ...newBook, book: e.target.value })} className="input-field py-2" placeholder="e.g. Designing Data-Intensive Applications" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ISBN</label>
                <input type="text" value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} className="input-field py-2" placeholder="e.g. 9781449373320" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date & Time limit</label>
                <input required type="datetime-local" value={newBook.dueDate} onChange={e => setNewBook({ ...newBook, dueDate: e.target.value })} className="input-field py-2" />
              </div>
              <button type="submit" className="w-full btn-primary justify-center mt-2 py-2.5">Confirm Issue</button>
            </form>
          </div>
        </div>
      )}

      {/* Return Verification Modal */}
      {returnModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setReturnModalBook(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Verify Return</h3>
            <p className="text-sm text-slate-300 mb-5">
              Returning <strong>{returnModalBook.book}</strong> for user <strong className="text-indigo-400">{returnModalBook.member}</strong>.
            </p>
            <form onSubmit={confirmReturn} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {returnMethod === 'email' ? 'Member Email Address' : 'Member Phone Number'}
                </label>
                <div className="relative">
                  <input
                    required
                    type={returnMethod === 'email' ? 'email' : 'tel'}
                    value={returnMethod === 'email' ? returnEmail : returnPhone}
                    onChange={e => returnMethod === 'email' ? setReturnEmail(e.target.value) : setReturnPhone(e.target.value)}
                    className="input-field py-3 pr-28 text-sm"
                    placeholder={returnMethod === 'email' ? 'member@example.com' : '+91 98765 43210'}
                  />
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    disabled={otpSent || (returnMethod === 'email' ? !returnEmail : !returnPhone)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-emerald-600 disabled:opacity-50"
                  >
                    {otpSent ? 'OTP Sent!' : 'Get OTP'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReturnMethod(returnMethod === 'email' ? 'phone' : 'email');
                    setOtpSent(false);
                    setActualOtp(null);
                  }}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
                >
                  {returnMethod === 'email' ? 'Continue with phone instead' : 'Continue with email instead'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Verification Code</label>
                <input
                  required type="text"
                  value={returnCode}
                  onChange={e => {
                    setReturnCode(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  disabled={!otpSent && !returnCode}
                  className={`input-field tracking-widest text-lg font-mono text-center py-3 disabled:opacity-50 disabled:cursor-not-allowed ${otpError ? 'border-red-500 bg-red-500/10 text-red-100 placeholder-red-300' : ''}`}
                  placeholder="------" maxLength={6}
                />
                {otpError ? (
                  <p className="text-[12px] text-red-500 mt-1.5 text-center font-bold">{otpError}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                    {otpSent ? `Enter the code sent to the member's ${returnMethod}.` : 'Request OTP to enable code entry.'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proof of Handover (Photo)</label>
                <label className="border-2 border-dashed border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
                  <CheckCircle className={`w-6 h-6 mb-2 ${returnProof ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-sm text-slate-300 font-medium">{returnProof ? returnProof.name : 'Click to Upload Image (Optional)'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => setReturnProof(e.target.files[0])} />
                </label>
              </div>
              <button type="submit" disabled={!returnCode} className="w-full btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25 justify-center py-3">Confirm Return</button>
            </form>
          </div>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Member', 'Book', 'ISBN', 'Issued On', 'Due Date', 'Due Time', 'Fine', 'Action'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {issuedBooks.length === 0 ? (
              <tr><td colSpan="8" className="px-5 py-8 text-center text-slate-500">No books currently issued.</td></tr>
            ) : issuedBooks.map(row => {
              const due = new Date(row.dueDate);
              const now = new Date();
              const isOverdue = due < now;
              const daysLeft = (due - now) / 86400000;

              let colorCls = 'text-slate-400';
              if (row.status !== 'returned') {
                if (isOverdue) colorCls = 'text-red-400 font-bold';
                else if (daysLeft <= 2) colorCls = 'text-amber-400 font-bold';
                else colorCls = 'text-emerald-400 font-bold';
              }

              const dDate = row.dueDate.includes('T') ? row.dueDate.split('T')[0] : row.dueDate;
              let dTime = row.dueDate.includes('T') ? row.dueDate.split('T')[1] : '--:--';

              if (dTime === '--:--' && (colorCls.includes('emerald') || colorCls.includes('red'))) {
                dTime = null;
              }

              let countdownText = '';
              if (row.status !== 'returned') {
                if (!isOverdue) {
                  if (daysLeft > 2) countdownText = `${Math.ceil(daysLeft)} days left`;
                  else countdownText = `${Math.ceil(daysLeft * 24)} hours left`;
                } else {
                  const overdueDays = daysLeft * -1;
                  if (overdueDays > 2) countdownText = `Overdue by ${Math.floor(overdueDays)} days`;
                  else countdownText = `Overdue by ${Math.ceil(overdueDays * 24)} hours`;
                }
              }

              let computedFine = row.fine || 0;
              if (row.status !== 'returned' && isOverdue) {
                computedFine += Math.floor(Math.max(daysLeft * -1, 1)) * 10;
              }

              const alertMsg = `[EMAIL DISPATCH SIMULATION]\n\nTO: Mr/Mrs. ${row.member}\nSUBJECT: Library Notice - ${isOverdue ? 'Overdue Book' : 'Return Reminder'}\n\nDear Mr/Mrs. ${row.member},\n\nThis is a notification regarding your library book.\n\n[ ISSUE DETAILS ]\n• Book Name : ${row.book}\n• ISBN Number : ${row.isbn}\n• Issued On : ${row.issuedOn}\n• Due Date : ${dDate}\n• Due Time : ${row.dueDate.includes('T') ? row.dueDate.split('T')[1] : '--:--'}\n• Current Fine: ₹${computedFine.toFixed(2)}\n\n${computedFine > 0 ? 'Please return the book immediately and settle your pending fine.' : 'Please ensure the book is returned on or before the due date.'}`;

              return (
                <tr key={row.id} className={`transition-colors ${row.status === 'returned' ? 'bg-emerald-900/10 opacity-70' : 'hover:bg-white/5'}`}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-white text-sm">{row.member}</p>
                    <p className="text-slate-500 text-xs">{row.memberId}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      {row.book}
                      {isOverdue && row.status !== 'returned' && <Pin className="w-3.5 h-3.5 text-red-500 fill-red-500 rotate-45" title="Overdue Book" />}
                    </div>
                    {row.status === 'returned' && <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">Returned</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs font-mono">{row.isbn}</td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{row.issuedOn}</td>
                  <td className={`px-5 py-4 text-sm ${colorCls}`}>{dDate}</td>
                  <td className={`px-5 py-4 text-sm ${colorCls}`}>
                    <div className="flex flex-col">
                      {dTime && <span>{dTime}</span>}
                      {countdownText && <span className="text-[10px] opacity-75 font-medium mt-0.5 tracking-tight">{countdownText}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {computedFine > 0
                      ? <span className="text-red-400 font-semibold">₹{computedFine.toFixed(2)}</span>
                      : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-5 py-4 flex flex-wrap gap-2">
                    {row.status !== 'returned' ? (
                      <button onClick={() => handleReturnClick(row)} className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />Return
                      </button>
                    ) : (
                      <button onClick={() => handleUndoReturn(row.id)} className="text-xs bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 -scale-x-100" />Undo
                      </button>
                    )}
                    {row.status !== 'returned' && (isOverdue || daysLeft <= 3 || computedFine > 0) && (
                      <button
                        onClick={() => {
                          const subject = isOverdue
                            ? `Library Notice — Overdue Book: ${row.book}`
                            : `Library Reminder — Book Due Soon: ${row.book}`;
                          const body = [
                            `Dear ${row.member},`,
                            '',
                            isOverdue
                              ? `This is an official notice regarding your overdue library book.`
                              : `This is a friendly reminder that your borrowed book is due soon.`,
                            '',
                            '── ISSUE DETAILS ──────────────────────',
                            `  Book Title  : ${row.book}`,
                            `  ISBN        : ${row.isbn}`,
                            `  Member ID   : ${row.memberId}`,
                            `  Issued On   : ${row.issuedOn}`,
                            `  Due Date    : ${dDate}`,
                            computedFine > 0 ? `  Fine Due    : ₹${computedFine.toFixed(2)}` : '',
                            '────────────────────────────────────────',
                            '',
                            computedFine > 0
                              ? `Please return the book immediately and settle your outstanding fine of ₹${computedFine.toFixed(2)}.`
                              : `Please ensure the book is returned on or before the due date to avoid fines.`,
                            '',
                            'Regards,',
                            'Library Management — LibraryOS',
                          ].filter(l => l !== undefined).join('\n');
                          openEmailModal(row, subject, body, '');
                        }}
                        className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />Send Alert
                      </button>
                    )}
                    {row.status === 'returned' && computedFine > 0 && (
                      <button onClick={() => {
                        setIssuedBooks(issuedBooks.map(b => b.id === row.id ? { ...b, fine: 0 } : b));
                        addActivity(`Financial penalty formally waived for ${row.member}`, 'fine');
                        addAuditLog(`Waived fine for ${row.member} on book "${row.book}"`, 'success', user?.name || 'Librarian');
                      }}
                        className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                        Clear Fine
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Email Alert Modal ──────────────────────────────────────────────── */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Send Email Alert</h3>
                  <p className="text-xs text-slate-400">To: {emailModal.memberName}</p>
                </div>
              </div>
              <button onClick={() => setEmailModal(null)} className="text-slate-400 hover:text-white transition-colors p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient email input */}
            <div className="px-6 pt-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Email Address</label>
              <input
                type="email"
                value={emailModal.to}
                onChange={e => setEmailModal(prev => ({ ...prev, to: e.target.value }))}
                placeholder="member@college.edu"
                className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50"
              />
            </div>

            {/* Subject */}
            <div className="px-6 pt-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
              <p className="text-sm text-slate-200 bg-slate-800/50 rounded-xl px-4 py-2.5 border border-white/5">{emailModal.subject}</p>
            </div>

            {/* Body preview */}
            <div className="px-6 pt-3 pb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Message Preview</label>
              <pre className="text-xs text-slate-300 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto font-mono">{emailModal.body}</pre>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={handleSendEmail}
                disabled={!emailModal.to}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-amber-500/20"
              >
                <Mail className="w-4 h-4" />
                Send via Email Client
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-5 rounded-xl transition-all text-sm border border-white/10"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => setEmailModal(null)} className="text-slate-400 hover:text-slate-200 py-2.5 px-4 rounded-xl transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MembersTab({ members, setMembers, addActivity, user }) {
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useLocalStorage('library_draft_newMember', { name: '', email: '', type: 'Student' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);

  const handleDeleteClick = (m) => setConfirmDelete(m);

  const confirmDeleteMember = () => {
    if (!confirmDelete) return;
    const m = confirmDelete;
    setRecentlyDeleted(m);
    setMembers(members.filter(x => x.id !== m.id));
    if (addActivity) addActivity(`${m.name} removed from registry`, 'member');
    addAuditLog(`Removed member ${m.name} (${m.id})`, 'error', user?.name || 'Librarian');
    setConfirmDelete(null);
  };

  const handleUndo = () => {
    if (!recentlyDeleted) return;
    setMembers([recentlyDeleted, ...members]);
    if (addActivity) addActivity(`${recentlyDeleted.name} restored to system`, 'member');
    addAuditLog(`Restored member ${recentlyDeleted.name} (${recentlyDeleted.id})`, 'success', user?.name || 'Librarian');
    setRecentlyDeleted(null);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const addedMember = {
      id: `M${(members.length + 1).toString().padStart(3, '0')}`,
      name: newMember.name,
      type: newMember.type,
      expiry: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Active'
    };
    setMembers([addedMember, ...members]);
    addActivity(`New member: ${newMember.name} systematically registered`, 'member');
    addAuditLog(`Registered member ${newMember.name} (${addedMember.id})`, 'success', user?.name || 'Librarian');
    setShowModal(false);
    setNewMember({ name: '', email: '', type: 'Student' });
  };

  const toggleFreeze = (id) => {
    let targetName = '';
    let newStatus = '';
    setMembers(members.map(m => {
      if (m.id === id) {
        targetName = m.name;
        newStatus = m.status === 'Active' ? 'Frozen' : 'Unfrozen';
        return { ...m, status: m.status === 'Active' ? 'Expired' : 'Active' };
      }
      return m;
    }));
    if (targetName) {
      addActivity(`Account conditionally ${newStatus.toLowerCase()} for ${targetName}`, 'member');
      addAuditLog(`Changed status of member ${targetName} to ${newStatus === 'Frozen' ? 'Frozen' : 'Active'}`, newStatus === 'Frozen' ? 'warning' : 'success', user?.name || 'Librarian');
    }
  };

  const statusCls = { Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', Expiring: 'bg-amber-500/15 text-amber-400 border-amber-500/30', Expired: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Member Registry</h2>
        <div className="flex items-center gap-3">
          {recentlyDeleted && (
            <button onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 rounded-xl border border-indigo-500/30 transition-all animate-pulse-subtle">
              <RotateCcw className="w-3.5 h-3.5" /> Undo Delete
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />Register Member
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Register New Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input required type="text" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="input-field py-2" placeholder="e.g. Jane Smith" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input required type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} className="input-field py-2" placeholder="e.g. jane@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Member Type</label>
                <select value={newMember.type} onChange={e => setNewMember({ ...newMember, type: e.target.value })} className="input-field py-2">
                  <option>Student</option>
                  <option>Faculty</option>
                  <option>Staff</option>
                </select>
              </div>
              <button type="submit" className="w-full btn-primary justify-center mt-2 py-2.5">Add Member</button>
            </form>
          </div>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Member ID', 'Name', 'Type', 'Expiry', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 text-indigo-400 font-mono text-sm">{m.id}</td>
                <td className="px-5 py-4 font-medium text-white text-sm">{m.name}</td>
                <td className="px-5 py-4"><span className="badge bg-purple-500/10 text-purple-300 border border-purple-500/20">{m.type}</span></td>
                <td className="px-5 py-4 text-slate-400 text-sm">{m.expiry}</td>
                <td className="px-5 py-4"><span className={`badge border ${statusCls[m.status] || statusCls.Expired}`}>{m.status === 'Expired' ? 'Frozen' : m.status}</span></td>
                <td className="px-5 py-4 flex gap-2">
                  <button onClick={() => toggleFreeze(m.id)} className={`p-1.5 rounded-lg transition-all ${m.status === 'Active' ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'}`} title={m.status === 'Active' ? "Freeze Account" : "Unfreeze"}>
                    <AlertCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(m)} className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors" title="Delete Member">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                You are about to delete <span className="text-white font-bold">{confirmDelete.name}</span>. This action can be undone briefly.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={confirmDeleteMember}
                  className="flex-1 py-3 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all font-inter"
                >
                  Yes, Delete
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all font-inter"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useLocalStorage('library_orders', ORDERS);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useLocalStorage('library_draft_newOrder', { publisher: '', items: '', amount: '' });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!newOrder.publisher || !newOrder.items || !newOrder.amount) return;

    // Generate a new ID based on the count to keep it looking like PO004, PO005 etc
    const newIdNum = orders.length + 1;
    const addedOrder = {
      id: `PO${newIdNum.toString().padStart(3, '0')}`,
      publisher: newOrder.publisher,
      items: parseInt(newOrder.items, 10),
      amount: parseFloat(newOrder.amount),
      status: 'Pending'
    };

    setOrders([addedOrder, ...orders]);
    setShowOrderModal(false);
    setNewOrder({ publisher: '', items: '', amount: '' });
  };

  const statusCls = { Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30', Shipped: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', Received: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Book Purchase Orders</h2>
        <button onClick={() => setShowOrderModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />New Purchase Order
        </button>
      </div>

      {/* New Purchase Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create Purchase Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Publisher</label>
                <input required type="text" value={newOrder.publisher} onChange={e => setNewOrder({ ...newOrder, publisher: e.target.value })} className="input-field py-2" placeholder="e.g. Penguin Random House" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Books</label>
                  <input required type="number" min="1" value={newOrder.items} onChange={e => setNewOrder({ ...newOrder, items: e.target.value })} className="input-field py-2" placeholder="e.g. 100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Amount (₹)</label>
                  <input required type="number" min="0" step="0.01" value={newOrder.amount} onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })} className="input-field py-2" placeholder="e.g. 50000" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary justify-center mt-2 py-2.5">Submit Order</button>
            </form>
          </div>
        </div>
      )}

      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Order ID', 'Publisher', 'Items', 'Amount (₹)', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 text-indigo-400 font-mono text-sm">{o.id}</td>
                <td className="px-5 py-4 font-medium text-white text-sm">{o.publisher}</td>
                <td className="px-5 py-4 text-slate-300 text-sm">{o.items} books</td>
                <td className="px-5 py-4 text-slate-300 text-sm font-semibold">₹{o.amount.toLocaleString()}</td>
                <td className="px-5 py-4"><span className={`badge border ${statusCls[o.status]}`}>{o.status}</span></td>
                <td className="px-5 py-4 flex gap-2">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                  {o.status === 'Shipped' && (
                    <button onClick={() => setOrders(orders.map(or => or.id === o.id ? { ...or, status: 'Received' } : or))} className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 transition-all">Accession</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PublishersTab({ publishers, setPublishers }) {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useLocalStorage('library_draft_newPublisher', { name: '', email: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    const added = { id: publishers.length + 1, name: newItem.name, email: newItem.email, books: 0 };
    setPublishers([...publishers, added]);
    setShowModal(false);
    setNewItem({ name: '', email: '' });
  };

  const handleDelete = (id) => {
    setPublishers(publishers.filter(p => p.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Publishers</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Add Publisher</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Add Publisher</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Publisher Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-field py-2" placeholder="e.g. O'Reilly Media" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email</label>
                <input type="email" value={newItem.email} onChange={e => setNewItem({ ...newItem, email: e.target.value })} className="input-field py-2" placeholder="e.g. orders@oreilly.com" />
              </div>
              <button type="submit" className="w-full btn-primary justify-center mt-2 py-2.5">Save Publisher</button>
            </form>
          </div>
        </div>
      )}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative text-center">
            <button onClick={() => setConfirmDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"><XCircle className="w-6 h-6" /></button>
            <div className="bg-red-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. This record will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-ghost bg-white/5 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl py-2.5 transition-colors shadow-lg shadow-red-500/20">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{['ID', 'Publisher Name', 'Contact Email', 'Books Catalogued', 'Actions'].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {publishers.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 text-slate-500 text-sm">#{p.id}</td>
                <td className="px-5 py-4 font-medium text-white text-sm">{p.name}</td>
                <td className="px-5 py-4 text-slate-400 text-sm">{p.email}</td>
                <td className="px-5 py-4 text-slate-300 text-sm">{p.books}</td>
                <td className="px-5 py-4 flex gap-2">
                  <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuthorsTab({ authors, setAuthors }) {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useLocalStorage('library_draft_newAuthor', { name: '', born: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    const added = { id: authors.length + 1, name: newItem.name, born: newItem.born, books: 0 };
    setAuthors([...authors, added]);
    setShowModal(false);
    setNewItem({ name: '', born: '' });
  };

  const handleDelete = (id) => {
    setAuthors(authors.filter(a => a.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Authors</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Add Author</button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Add Author</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Author Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="input-field py-2" placeholder="e.g. Stephen King" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Year</label>
                <input type="text" value={newItem.born} onChange={e => setNewItem({ ...newItem, born: e.target.value })} className="input-field py-2" placeholder="e.g. 1947" />
              </div>
              <button type="submit" className="w-full btn-primary justify-center mt-2 py-2.5">Save Author</button>
            </form>
          </div>
        </div>
      )}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative text-center">
            <button onClick={() => setConfirmDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full"><XCircle className="w-6 h-6" /></button>
            <div className="bg-red-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. This record will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-ghost bg-white/5 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl py-2.5 transition-colors shadow-lg shadow-red-500/20">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      <div className="card-glass overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{['ID', 'Author Name', 'Birth Year', 'Books', 'Actions'].map(h => <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/5">
            {authors.map(a => (
              <tr key={a.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-4 text-slate-500 text-sm">#{a.id}</td>
                <td className="px-5 py-4 font-medium text-white text-sm">{a.name}</td>
                <td className="px-5 py-4 text-slate-400 text-sm">{a.born}</td>
                <td className="px-5 py-4 text-slate-300 text-sm">{a.books}</td>
                <td className="px-5 py-4 flex gap-2">
                  <button onClick={() => setConfirmDelete(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BooksManagementTab({ books, setBooks, onNotify, user }) {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ title:'', author:'', category:'', isbn:'', copies:1 });

  const openAddModal = () => {
    setForm({ title:'', author:'', category:'', isbn:'', copies:1 });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (book) => {
    setForm({ title: book.title, author: book.author, category: book.category, isbn: book.isbn, copies: book.total });
    setEditingId(book.id);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title || !form.isbn) return;
    
    if (editingId) {
      const oldBook = books.find(b => b.id === editingId);
      const issued = oldBook.total - oldBook.available;
      const newTotal = parseInt(form.copies);
      if (newTotal < issued) {
        alert("Cannot reduce total below currently issued copies (" + issued + ").");
        return;
      }
      setBooks(books.map(b => b.id === editingId ? { ...b, ...form, total: newTotal, available: newTotal - issued } : b));
      if (onNotify) onNotify('Book updated successfully.', 'success');
      addAuditLog(`Updated book "${form.title}" (ISBN: ${form.isbn})`, 'info', user?.name || 'Librarian');
    } else {
      if (books.find(b => b.isbn === form.isbn)) { alert('ISBN already exists!'); return; }
      setBooks([{ id:`B${Date.now()}`, ...form, total: parseInt(form.copies), available: parseInt(form.copies) }, ...books]);
      if (onNotify) onNotify('Book added successfully.', 'success');
      addAuditLog(`Added book "${form.title}" (ISBN: ${form.isbn})`, 'success', user?.name || 'Librarian');
    }
    
    setShowModal(false);
    setForm({ title:'', author:'', category:'', isbn:'', copies:1 });
    setEditingId(null);
  };

  const handleBulkImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx') {
      alert("Native XLSX import is currently unsupported. Please save your file as CSV and upload again.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let newBooks = [];
        const content = event.target.result;
        if (ext === 'json') {
          const parsed = JSON.parse(content);
          newBooks = Array.isArray(parsed) ? parsed : [parsed];
        } else if (ext === 'csv') {
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const book = {};
            headers.forEach((h, idx) => { book[h] = values[idx]; });
            newBooks.push(book);
          }
        }
        const mappedBooks = newBooks.map(b => ({
          id: `B${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          isbn: b.isbn || b.ISBN,
          title: b.title || b.Title,
          author: b.author || b.Author || 'Unknown Data',
          category: b.category || b.Category || 'General',
          total: parseInt(b.total) || parseInt(b.Total) || 1,
          available: parseInt(b.total) || parseInt(b.Total) || 1,
        })).filter(b => b.isbn && b.title);
        if (mappedBooks.length === 0) throw new Error("No valid books found. Ensure column headers 'ISBN' and 'Title' exist.");
        setImportData(mappedBooks);
      } catch (err) { alert("Error parsing file: " + err.message); }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    setIsImporting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setBooks([...importData, ...books]);
        setIsImporting(false);
        setImportProgress(0);
        if (onNotify) onNotify(`Successfully imported ${importData.length} books.`, 'success');
        addAuditLog(`Imported ${importData.length} books via bulk import`, 'success', user?.name || 'Librarian');
        setImportData(null);
        setShowImportModal(false);
      }
    }, 100);
  };

  const downloadTemplate = () => {
    const csv = "ISBN,Title,Author,Category,Total\n9780132350884,Clean Code,Robert C. Martin,Software,5\n9780262035613,Deep Learning,Ian Goodfellow,AI/ML,3";
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'library_bulk_import_template.csv';
    a.click();
  };


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Books Catalog</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-xl transition-all">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              {[['Title','title','Book Title'],['Author','author','e.g. Robert C. Martin'],['Category','category','e.g. Software'],['ISBN','isbn','Unique ISBN']].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{label}</label>
                  <input required type="text" placeholder={ph} className="input-field" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                </div>
              ))}
              <div><label className="text-xs font-semibold text-slate-300 block mb-1">Copies</label>
                <input required type="number" min="1" className="input-field" value={form.copies} onChange={e => setForm({...form, copies: e.target.value})} />
              </div>
              <button className="btn-primary w-full justify-center py-3 mt-2">{editingId ? 'Update Book' : 'Save Book'}</button>
            </form>
          </div>
        </div>
      )}
      
      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl relative transition-all ${importData ? 'w-full max-w-3xl' : 'w-full max-w-md'}`}>
            <button onClick={() => { setShowImportModal(false); setImportData(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 z-10">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-white mb-5">{importData ? 'Review Data' : 'Bulk Import Books'}</h3>

            {!importData ? (
              <div className="space-y-5">
                <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-8 text-center bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors relative cursor-pointer">
                  <input type="file" accept=".csv, .json" onChange={handleBulkImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">Click or drag file to upload</p>
                  <p className="text-xs text-slate-400">Supports .csv and .json</p>
                </div>
                <div className="text-center">
                  <button onClick={downloadTemplate} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Download Template (.csv)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="max-h-64 overflow-y-auto border border-white/10 rounded-xl bg-slate-950/50">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-800 text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">ISBN</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Author</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {importData.map((d, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-3 text-indigo-400 font-mono">{d.isbn}</td>
                          <td className="p-3 text-white font-medium">{d.title}</td>
                          <td className="p-3 text-slate-400">{d.author}</td>
                          <td className="p-3 text-slate-400">{d.category}</td>
                          <td className="p-3 text-slate-300 font-bold text-right">{d.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {isImporting ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Importing...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={confirmImport} className="flex-1 btn-primary py-3 justify-center text-sm">
                      Confirm & Upload {importData.length} Books
                    </button>
                    <button onClick={() => setImportData(null)} className="px-6 py-3 text-sm font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="card-glass overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['ISBN','Title & Author','Category','Total','Available','Actions'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {books.map(b => (
              <tr key={b.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-xs font-mono text-indigo-400">{b.isbn}</td>
                <td className="p-4"><p className="text-sm font-bold text-white">{b.title}</p><p className="text-xs text-slate-500">{b.author}</p></td>
                <td className="p-4"><span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20">{b.category}</span></td>
                <td className="p-4 text-sm font-bold text-slate-300">{b.total}</td>
                <td className="p-4 text-sm font-bold">{b.available > 0 ? <span className="text-emerald-400">{b.available}</span> : <span className="text-red-400">Out of Stock</span>}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEditClick(b)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { if(b.available < b.total) { alert('Cannot delete — copies are currently issued.'); return; } setBooks(books.filter(x => x.id !== b.id)); addAuditLog(`Deleted book "${b.title}" (ISBN: ${b.isbn})`, 'error', user?.name || 'Librarian'); }} className="p-2 text-red-400 hover:text-white bg-red-500/10 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reservations Tab ─────────────────────────────────────────────────────────
function ReservationsTab({ reservations, setReservations, user }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="section-title mb-0">Reservation Queue</h2>
      <div className="card-glass p-4 border-l-4 border-indigo-500 bg-indigo-500/5 text-sm text-slate-300">
        <strong className="text-white">FIFO Queue:</strong> Reservations are processed first-come-first-served. Approve to notify the member when the book is available.
      </div>
      <div className="card-glass overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['ID','Member','Book Requested','Date','Status','Actions'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {reservations.map(r => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-xs font-mono text-indigo-400">{r.id}</td>
                <td className="p-4"><p className="text-sm font-bold text-white">{r.member}</p><p className="text-xs text-slate-500">{r.memberId}</p></td>
                <td className="p-4 text-sm text-slate-300">{r.title}</td>
                <td className="p-4 text-sm text-slate-400">{r.date}</td>
                <td className="p-4">
                  <span className={`badge border ${ r.status==='Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : r.status==='Cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>{r.status}</span>
                </td>
                <td className="p-4 flex gap-2">
                  {r.status === 'Pending' && (
                    <>
                      <button onClick={() => { setReservations(reservations.map(x => x.id===r.id ? {...x, status:'Approved'} : x)); addAuditLog(`Approved reservation for "${r.title}" for member ${r.member}`, 'success', user?.name || 'Librarian'); }} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Approve</button>
                      <button onClick={() => { setReservations(reservations.map(x => x.id===r.id ? {...x, status:'Cancelled'} : x)); addAuditLog(`Cancelled reservation for "${r.title}" for member ${r.member}`, 'warning', user?.name || 'Librarian'); }} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10">Cancel</button>
                    </>
                  )}
                  {r.status !== 'Pending' && <span className="text-xs text-slate-500">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, setPayments, user }) {
  const verified = payments.filter(p => p.status === 'Verified').reduce((a,b) => a+b.amount, 0);
  const pending  = payments.filter(p => p.status === 'Pending').reduce((a,b) => a+b.amount, 0);
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="section-title mb-0">Payments Ledger</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="card-glass p-6 text-center border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Verified Revenue</p>
          <p className="text-3xl font-black text-white">₹{verified.toFixed(2)}</p>
        </div>
        <div className="card-glass p-6 text-center border border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Pending Clearance</p>
          <p className="text-3xl font-black text-white">₹{pending.toFixed(2)}</p>
        </div>
      </div>
      <div className="card-glass overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['Receipt ID','Member','Amount','Type','Date','Status','Action'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-xs font-mono text-indigo-400">{p.id}</td>
                <td className="p-4"><p className="text-sm font-bold text-white">{p.member}</p><p className="text-xs text-slate-500">{p.memberId}</p></td>
                <td className="p-4 text-sm font-black text-slate-200">₹{p.amount.toFixed(2)}</td>
                <td className="p-4 text-sm text-slate-400">{p.type}</td>
                <td className="p-4 text-sm text-slate-400">{p.date}</td>
                <td className="p-4">
                  <span className={`badge border ${p.status==='Verified' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>{p.status}</span>
                </td>
                <td className="p-4">
                  {p.status === 'Pending' && (
                    <button onClick={() => { setPayments(payments.map(x => x.id===p.id ? {...x, status:'Verified'} : x)); addAuditLog(`Verified payment of ₹${p.amount} from ${p.member}`, 'success', user?.name || 'Librarian'); }} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">Verify</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab({ issuedBooks, members, payments }) {
  const [reportType, setReportType] = useState('issued');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const now = new Date();

  // ── Derived Data ──────────────────────────────────────────────────────────
  const overdue = issuedBooks.filter(b => b.status === 'issued' && new Date(b.dueDate) < now);
  const totalFines = payments.filter(p => p.status === 'Verified').reduce((a, b) => a + b.amount, 0);
  const pendingFines = payments.filter(p => p.status === 'Pending').reduce((a, b) => a + b.amount, 0);

  // ── Filter Helper ─────────────────────────────────────────────────────────
  const inDateRange = (dateStr) => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
  };

  const matchesUser = (memberName) =>
    !filterUser || memberName.toLowerCase().includes(filterUser.toLowerCase());

  // ── Report Datasets ───────────────────────────────────────────────────────
  const issuedRows = issuedBooks.filter(b =>
    b.status === 'issued' &&
    inDateRange(b.issuedOn) &&
    matchesUser(b.member)
  );

  const overdueRows = issuedBooks.filter(b =>
    b.status === 'issued' &&
    new Date(b.dueDate) < now &&
    matchesUser(b.member)
  );

  const revenueRows = payments.filter(p =>
    inDateRange(p.date) &&
    matchesUser(p.member)
  );

  // ── Active rows for current report type ───────────────────────────────────
  const activeRows = reportType === 'issued' ? issuedRows
    : reportType === 'overdue' ? overdueRows
    : revenueRows;

  // ── CSV Export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    let headers, rows;
    if (reportType === 'issued') {
      headers = ['Member', 'Member ID', 'Book', 'ISBN', 'Issued On', 'Due Date', 'Fine'];
      rows = issuedRows.map(b => [b.member, b.memberId, b.book, b.isbn, b.issuedOn, b.dueDate, b.fine || 0]);
    } else if (reportType === 'overdue') {
      headers = ['Member', 'Member ID', 'Book', 'ISBN', 'Due Date', 'Days Overdue', 'Fine (₹)'];
      rows = overdueRows.map(b => {
        const days = Math.ceil((now - new Date(b.dueDate)) / 86400000);
        return [b.member, b.memberId, b.book, b.isbn, b.dueDate, days, days * 10];
      });
    } else {
      headers = ['Receipt ID', 'Member', 'Amount', 'Type', 'Date', 'Status'];
      rows = revenueRows.map(p => [p.id, p.member, `₹${p.amount}`, p.type, p.date, p.status]);
    }
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportJSON = () => {
    const data = activeRows;
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportPDF = () => {
    alert('[PDF Export Simulation]\n\nIn production, this triggers a server-side PDF generator (e.g. Puppeteer / WeasyPrint) with the current filters applied.\n\nFilters applied:\n• Report: ' + reportType + '\n• Date From: ' + (dateFrom || 'Any') + '\n• Date To: ' + (dateTo || 'Any') + '\n• User filter: ' + (filterUser || 'All'));
  };

  const cats = [
    { label: 'Software',    value: 85 },
    { label: 'Engineering', value: 65 },
    { label: 'AI/ML',       value: 50 },
    { label: 'Fiction',     value: 35 },
  ];

  const REPORT_TYPES = [
    { key: 'issued',   label: 'Issued Books Report',   color: 'indigo' },
    { key: 'overdue',  label: 'Overdue Books Report',  color: 'red'    },
    { key: 'revenue',  label: 'Revenue & Fines',       color: 'emerald'},
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">Reports & Analytics</h2>
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={exportJSON} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 transition-colors">
            <Download className="w-3.5 h-3.5" /> Excel/JSON
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/40 transition-colors">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Loans',     value: issuedBooks.filter(b=>b.status==='issued').length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Overdue Books',    value: overdue.length,                                    color: 'text-red-400',    bg: 'bg-red-500/10'    },
          { label: 'Fines Collected',  value: `₹${totalFines.toFixed(0)}`,                       color: 'text-emerald-400',bg: 'bg-emerald-500/10'},
          { label: 'Fines Pending',    value: `₹${pendingFines.toFixed(0)}`,                     color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
        ].map(s => (
          <div key={s.label} className={`card-glass p-5 text-center border border-white/5 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-3 flex-wrap">
        {REPORT_TYPES.map(rt => (
          <button key={rt.key} onClick={() => setReportType(rt.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border
              ${reportType === rt.key
                ? `bg-${rt.color}-600 border-${rt.color}-500 text-white shadow-lg shadow-${rt.color}-500/20`
                : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
            {rt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card-glass p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search className="w-4 h-4" /> Filters
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="input-field py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="input-field py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-semibold">Member Name</label>
            <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)}
              placeholder="Search member..." className="input-field py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setDateFrom(''); setDateTo(''); setFilterUser(''); setFilterCategory('All'); }}
              className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Data Table */}
      <div className="card-glass overflow-x-auto">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            {REPORT_TYPES.find(r => r.key === reportType)?.label}
            <span className="ml-2 text-xs text-slate-400 font-normal">{activeRows.length} records</span>
          </p>
        </div>

        {reportType === 'issued' && (
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              {['Member','Book','ISBN','Issued On','Due Date','Fine'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {issuedRows.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-slate-500">No records match the current filters.</td></tr>}
              {issuedRows.map(b => (
                <tr key={b.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4"><p className="text-sm font-bold text-white">{b.member}</p><p className="text-xs text-slate-500">{b.memberId}</p></td>
                  <td className="p-4 text-sm text-slate-300">{b.book}</td>
                  <td className="p-4 text-xs font-mono text-slate-400">{b.isbn}</td>
                  <td className="p-4 text-sm text-slate-400">{b.issuedOn}</td>
                  <td className="p-4 text-sm font-bold text-slate-300">{b.dueDate}</td>
                  <td className="p-4 text-sm">{(b.fine||0) > 0 ? <span className="text-red-400 font-bold">₹{b.fine}</span> : <span className="text-slate-500">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === 'overdue' && (
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              {['Member','Book','ISBN','Due Date','Days Overdue','Fine Accrued'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {overdueRows.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-slate-500">No overdue books match the current filters.</td></tr>}
              {overdueRows.map(b => {
                const days = Math.ceil((now - new Date(b.dueDate)) / 86400000);
                return (
                  <tr key={b.id} className="hover:bg-white/5 bg-red-500/5 transition-colors">
                    <td className="p-4"><p className="text-sm font-bold text-white">{b.member}</p><p className="text-xs text-slate-500">{b.memberId}</p></td>
                    <td className="p-4 text-sm text-slate-300">{b.book}</td>
                    <td className="p-4 text-xs font-mono text-slate-400">{b.isbn}</td>
                    <td className="p-4 text-sm font-bold text-red-400">{b.dueDate}</td>
                    <td className="p-4"><span className="badge bg-red-500/10 text-red-400 border border-red-500/30">{days} days</span></td>
                    <td className="p-4 text-sm font-black text-red-400">₹{days * 10}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {reportType === 'revenue' && (
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              {['Receipt ID','Member','Amount','Type','Date','Status'].map(h => <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {revenueRows.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-slate-500">No payment records match the current filters.</td></tr>}
              {revenueRows.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs font-mono text-indigo-400">{p.id}</td>
                  <td className="p-4"><p className="text-sm font-bold text-white">{p.member}</p><p className="text-xs text-slate-500">{p.memberId}</p></td>
                  <td className="p-4 text-sm font-black text-slate-200">₹{p.amount.toFixed(2)}</td>
                  <td className="p-4 text-sm text-slate-400">{p.type}</td>
                  <td className="p-4 text-sm text-slate-400">{p.date}</td>
                  <td className="p-4"><span className={`badge border ${p.status==='Verified' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Bar Chart */}
      <div className="card-glass p-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" /> Most Borrowed Categories
        </h3>
        <div className="space-y-4">
          {cats.map(c => (
            <div key={c.label}>
              <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-400">
                <span>{c.label}</span><span>{c.value} borrows</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000" style={{ width: `${c.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsTab({ logs }) {
  const [filter, setFilter] = useState('all');

  const colors = {
    success: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
    error:   { badge: 'bg-red-500/10 text-red-400 border-red-500/30',             dot: 'bg-red-500'     },
    warning: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',       dot: 'bg-amber-500'   },
    info:    { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',           dot: 'bg-blue-500'    },
  };

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  const formatTime = (l) => {
    if (l.timestamp) {
      const diff = Math.floor((Date.now() - l.timestamp) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    }
    return l.time;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">Audit Logs</h2>
        <div className="flex gap-2">
          {['all', 'success', 'warning', 'error', 'info'].map(lvl => (
            <button key={lvl} onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border
                ${filter === lvl ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['Level', 'User', 'Action', 'Time'].map(h =>
              <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            )}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <span className={`badge border text-xs ${colors[log.level].badge}`}>
                    {log.level.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold text-white">{log.user}</td>
                <td className="p-4 text-[13px] text-slate-300">{log.action}</td>
                <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{formatTime(log)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No logs for this level.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard({ user, onNotify }) {
  const [activeTab, setActiveTab] = useLocalStorage('library_activeTab', 'overview');
  const [issuedBooks, setIssuedBooks] = useLocalStorage('library_issuedBooks', ISSUED_BOOKS);
  const [members, setMembers] = useLocalStorage('library_members', MEMBERS);
  const [booksCatalog, setBooksCatalog] = useLocalStorage('library_books_catalog', MOCK_BOOKS_CATALOG);
  const [reservations, setReservations] = useLocalStorage('library_reservations', MOCK_RESERVATIONS);
  const [payments, setPayments] = useLocalStorage('library_payments', MOCK_PAYMENTS);
  const [activityLog, setActivityLog] = useLocalStorage('library_activity_log', RECENT_ACTIVITY.map((a, i) => ({ ...a, timestamp: Date.now() - (i * 3600000) })));

  const addActivity = (text, type) => {
    setActivityLog(prev => [{ text, type, timestamp: Date.now() }, ...prev].slice(0, 15));
  };

  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_audit_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const syncLogs = () => {
    try {
      const stored = localStorage.getItem('admin_audit_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDbLogs = () => {
    authService.get('/api/audit-logs/')
      .then(res => {
        if (Array.isArray(res.data)) {
          setLogs(res.data);
          localStorage.setItem('admin_audit_logs', JSON.stringify(res.data));
        }
      })
      .catch(err => {
        console.error("Failed to fetch logs from database:", err);
        syncLogs();
      });
  };

  useEffect(() => {
    fetchDbLogs();
    window.addEventListener('storage', syncLogs);
    window.addEventListener('storage_updated', fetchDbLogs);
    return () => {
      window.removeEventListener('storage', syncLogs);
      window.removeEventListener('storage_updated', fetchDbLogs);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':     return <Overview onSwitchTab={setActiveTab} issuedBooks={issuedBooks} setIssuedBooks={setIssuedBooks} members={members} logs={logs} user={user} />;
      case 'books':        return <BooksManagementTab books={booksCatalog} setBooks={setBooksCatalog} onNotify={onNotify} user={user} />;
      case 'users':        return <MembersTab members={members} setMembers={setMembers} addActivity={addActivity} user={user} />;
      case 'circulation':  return <Circulation issuedBooks={issuedBooks} setIssuedBooks={setIssuedBooks} addActivity={addActivity} user={user} />;
      case 'reservations': return <ReservationsTab reservations={reservations} setReservations={setReservations} user={user} />;
      case 'payments':     return <PaymentsTab payments={payments} setPayments={setPayments} user={user} />;
      case 'reports':      return <ReportsTab issuedBooks={issuedBooks} members={members} payments={payments} />;
      case 'logs':         return <LogsTab logs={logs} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden page-enter">
      {/* Premium Glass Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto custom-scrollbar shadow-2xl z-20">
        
        {/* Subtle glowing orb in the corner */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 -left-10 w-40 h-40 bg-slate-800/10 blur-[80px] pointer-events-none" />

        <div className="p-5 relative z-10">
          <div className="mb-8 px-2 pt-3">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
              {user?.role === 'faculty' ? 'Faculty Portal' : 'Librarian Portal'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library Control</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold relative group overflow-hidden
                    ${isActive
                      ? 'text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.15)] -translate-y-0.5'
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-white hover:border-white/5 hover:-translate-y-0.5'}`}
                >
                  {/* Glass reflection on active state */}
                  {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
                  
                  {/* Left edge active indicator */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-lg shadow-[0_0_10px_#6366f1]" />}
                  
                  <tab.icon className={`w-4 h-4 transition-transform duration-300 relative z-10 ${isActive ? 'text-indigo-400 scale-110 ml-1' : 'text-slate-500 group-hover:scale-110 group-hover:text-slate-300'}`} />
                  <span className="tracking-wide relative z-10">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-indigo-400 opacity-50 relative z-10 transform translate-x-1" />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
