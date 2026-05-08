import React, { useState } from 'react';
import { BookOpen, AlertCircle, Clock, CheckCircle, CreditCard, Search, LayoutDashboard, Bookmark, History, RotateCcw, XCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// MOCK DATA
const MOCK_LOANS = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '978-0135957059', issuedOn: '2025-03-25', dueDate: '2025-04-10', status: 'Active', fine: 0 },
  { id: 2, title: 'Designing Data-Intensive Apps', author: 'Martin Kleppmann', isbn: '978-1449373320', issuedOn: '2025-03-01', dueDate: '2025-03-15', status: 'Overdue', fine: 280 },
];

const MOCK_RESERVATIONS = [
  { id: 101, title: 'Clean Architecture', requestedOn: '2025-04-01', status: 'Pending', availableDate: '2025-04-18' },
];

const MOCK_HISTORY = [
  { id: 3, title: 'Clean Code', issuedOn: '2025-01-10', returnedOn: '2025-01-20', status: 'Returned' },
  { id: 4, title: 'Introduction to Algorithms', issuedOn: '2024-11-05', returnedOn: '2024-12-01', status: 'Returned' },
];

const MOCK_PAYMENTS = [
  { txId: 'TXN-9821', amount: 150, date: '2024-12-01', status: 'Success' },
];

const MOCK_CATALOG = [
  { id: 201, title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', status: 'Available' },
  { id: 202, title: 'System Design Interview', author: 'Alex Xu', isbn: '979-8664653403', status: 'Unavailable' },
  { id: 203, title: 'Refactoring', author: 'Martin Fowler', isbn: '978-0201485677', status: 'Available' },
  { id: 204, title: 'Design Patterns', author: 'Erich Gamma', isbn: '978-0201633610', status: 'Available' }
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
  
  const [loans, setLoans] = useState(MOCK_LOANS);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const [reservations, setReservations] = useState(MOCK_RESERVATIONS);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);

  // Fines Logic
  const pendingFines = loans.filter(l => l.status === 'Overdue');
  const totalFineAmount = pendingFines.reduce((sum, l) => sum + l.fine, 0);

  // Actions
  const handleReturnBook = (loan) => {
    if (loan.status === 'Overdue' && loan.fine > 0) {
      if (onNotify) onNotify(`Please clear the ₹${loan.fine} fine before returning this book.`, 'error');
      return;
    }
    setLoans(loans.filter(l => l.id !== loan.id));
    setHistory([{ id: Date.now(), title: loan.title, issuedOn: loan.issuedOn, returnedOn: new Date().toISOString().split('T')[0], status: 'Returned' }, ...history]);
    if (onNotify) onNotify(`Successfully returned ${loan.title}.`, 'success');
  };

  const handleCancelReservation = (id) => {
    setReservations(reservations.filter(r => r.id !== id));
    if (onNotify) onNotify('Reservation cancelled successfully.', 'success');
  };

  const processPayment = (loanId, amount) => {
    setLoans(loans.map(l => l.id === loanId ? { ...l, fine: 0, status: 'Active' } : l));
    setPayments([{ txId: `TXN-${Math.floor(Math.random()*10000)}`, amount, date: new Date().toISOString().split('T')[0], status: 'Success' }, ...payments]);
    if (onNotify) onNotify(`Payment of ₹${amount} successful via Razorpay Sandbox.`, 'success');
  };

  const handleBorrow = (book) => {
    if (loans.some(l => l.title === book.title)) {
       if (onNotify) onNotify('You already have this book borrowed.', 'error');
       return;
    }
    const newLoan = {
      id: Date.now(), title: book.title, author: book.author, isbn: book.isbn,
      issuedOn: new Date().toISOString().split('T')[0], 
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active', fine: 0
    };
    setLoans([...loans, newLoan]);
    if (onNotify) onNotify(`Successfully borrowed ${book.title}.`, 'success');
  };

  const handleReserve = (book) => {
    if (reservations.some(r => r.title === book.title)) {
       if (onNotify) onNotify('You are already on the waitlist for this book.', 'error');
       return;
    }
    const newRes = {
      id: Date.now(), title: book.title, requestedOn: new Date().toISOString().split('T')[0],
      status: 'Pending', availableDate: 'Unknown'
    };
    setReservations([...reservations, newRes]);
    if (onNotify) onNotify(`Successfully reserved ${book.title}. You will be notified.`, 'success');
  };


  // Status Badge Helper
  const StatusBadge = ({ status }) => {
    if (status === 'Available' || status === 'Active' || status === 'Success' || status === 'Returned') 
      return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    if (status === 'Overdue' || status === 'Error') 
      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto page-enter min-h-[70vh]">
      
      {/* Premium Glass Sidebar */}
      <aside className="w-full md:w-64 shrink-0 relative z-20">
        <div className="p-5 sticky top-24 border border-white/5 bg-slate-950/40 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden card-glass">
          {/* Subtle glowing orb in the corner */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="absolute top-10 -left-10 w-40 h-40 bg-purple-500/20 blur-[60px] pointer-events-none" />

          <div className="mb-8 px-2 pt-3 relative z-10">
             <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">Student Portal</h2>
             <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Library Access</p>
             </div>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        
        {/* -- DASHBOARD -- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-glass p-5 border-l-4 border-l-blue-500">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Borrowed</p>
                <div className="text-3xl font-black text-white">{loans.length}</div>
              </div>
              <div className="card-glass p-5 border-l-4 border-l-amber-500">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Due Soon</p>
                <div className="text-3xl font-black text-white">{loans.filter(l => l.status === 'Active').length}</div>
              </div>
              <div className="card-glass p-5 border-l-4 border-l-red-500">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pending Fines</p>
                <div className="text-3xl font-black text-red-400">₹{totalFineAmount}</div>
              </div>
            </div>

            {pendingFines.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-500">Action Required</h4>
                  <p className="text-sm text-red-400/80 mt-1">You have {pendingFines.length} overdue book(s). Please clear your fines to restore borrowing privileges.</p>
                </div>
              </div>
            )}

            <div className="card-glass p-6">
              <h2 className="text-lg font-bold text-white mb-4">Recently Borrowed Books</h2>
              <div className="space-y-3">
                {loans.map(loan => (
                  <div key={loan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 gap-3">
                    <div>
                      <p className="font-bold text-slate-200">{loan.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Due: {loan.dueDate}
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* -- SEARCH BOOKS -- */}
        {activeTab === 'search' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Search Library</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Search by title, author, or category..." className="input-field !pl-12 py-4 text-base" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_CATALOG.map(book => (
                <div key={book.id} className="card-glass p-5 flex flex-col md:flex-row gap-4 hover:border-indigo-500/30 transition-all group">
                  <div className="w-16 h-24 shrink-0 bg-indigo-500/10 rounded border border-indigo-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-400 opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-white truncate text-base group-hover:text-indigo-300 transition-colors">{book.title}</h3>
                      <StatusBadge status={book.status} />
                    </div>
                    <p className="text-sm text-slate-400 mb-4 truncate">by {book.author}</p>
                    {book.status === 'Available' ? (
                      <button onClick={() => handleBorrow(book)} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors uppercase tracking-wider w-full">
                        Borrow Now
                      </button>
                    ) : (
                      <button onClick={() => handleReserve(book)} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors uppercase tracking-wider w-full">
                        Reserve Book
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* -- MY BOOKS -- */}
        {activeTab === 'my-books' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">My Books</h1>
            <div className="card-glass overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Book Name</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loans.map(loan => (
                      <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-sm text-white">{loan.title}</td>
                        <td className="p-4 text-sm text-slate-400">{loan.issuedOn}</td>
                        <td className="p-4 text-sm text-slate-400">{loan.dueDate}</td>
                        <td className="p-4"><StatusBadge status={loan.status} /></td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleReturnBook(loan)}
                            className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" /> Return
                          </button>
                        </td>
                      </tr>
                    ))}
                    {loans.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No active borrowings.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -- RESERVATIONS -- */}
        {activeTab === 'reservations' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Waitlist & Reservations</h1>
            <div className="grid grid-cols-1 gap-4">
              {reservations.map(res => (
                <div key={res.id} className="card-glass p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg mb-1">{res.title}</h3>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>Requested: {res.requestedOn}</span>
                      <span>Est. Available: {res.availableDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={res.status} />
                    <button onClick={() => handleCancelReservation(res.id)} className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ))}
              {reservations.length === 0 && (
                <div className="card-glass p-12 text-center text-slate-400 border border-white/5">
                  <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p>You have no active reservations.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -- FINES & PAYMENTS -- */}
        {activeTab === 'fines' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Fines & Payments</h1>
            
            <div className="card-glass p-6 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <p className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-1">Total Outstanding</p>
              <p className="text-5xl font-black text-white">₹{totalFineAmount}</p>
            </div>

            <div className="card-glass overflow-hidden border border-white/10">
              <div className="bg-slate-800/50 px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white">Pending Fines</h3>
              </div>
              <div className="divide-y divide-white/5">
                {pendingFines.map(loan => (
                  <div key={loan.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-bold text-white">{loan.title}</p>
                      <p className="text-xs text-red-400 mt-1">Overdue since {loan.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-xl text-amber-400">₹{loan.fine}</p>
                      <button onClick={() => processPayment(loan.id, loan.fine)} className="btn-primary py-2 px-5 text-sm">
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
                {pendingFines.length === 0 && <div className="p-8 text-center text-emerald-500 font-medium bg-emerald-500/5"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400"/> No pending fines!</div>}
              </div>
            </div>

            <div className="card-glass overflow-hidden border border-white/10">
              <div className="bg-slate-800/50 px-5 py-3 border-b border-white/10">
                <h3 className="font-semibold text-white">Payment History</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-xs">
                    <th className="p-4 font-semibold">Transaction ID</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((p, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-4 text-slate-300 font-mono">{p.txId}</td>
                      <td className="p-4 text-slate-400">{p.date}</td>
                      <td className="p-4 text-white font-bold">₹{p.amount}</td>
                      <td className="p-4"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-500">No payment history found.</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* -- HISTORY -- */}
        {activeTab === 'history' && (
          <div className="space-y-6 tab-enter">
            <h1 className="text-2xl font-bold text-white">Borrowing History</h1>
            
            <div className="card-glass overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Book Name</th>
                      <th className="p-4">Issue Date</th>
                      <th className="p-4">Return Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">{item.title}</td>
                        <td className="p-4 text-slate-400">{item.issuedOn}</td>
                        <td className="p-4 text-slate-400">{item.returnedOn}</td>
                        <td className="p-4"><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                    {history.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No borrowing history available.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
