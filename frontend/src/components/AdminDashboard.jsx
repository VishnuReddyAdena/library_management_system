import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Settings, Shield, Users, Database, Zap, BookMarked, UserPlus,
  Trash2, Edit3, ChevronRight, TrendingUp, BarChart2, Activity,
  FileText, Moon, Sun, Plus, XCircle, CheckCircle, AlertCircle, CreditCard,
  GraduationCap, Briefcase, Eye, EyeOff, BookOpen, Search,
  RotateCcw, Ban, Unlock, Mail, Phone, Calendar, Hash, Download,
  Bell, Command, Server, Clock, Wifi, ChevronLeft, ChevronDown,
  CheckSquare, Square, X, RefreshCw
} from 'lucide-react';
import GlassSelect from './GlassSelect';
import { addAuditLog } from '../utils/auditLogger';
import authService from '../services/authService';

// ─── Mock Data (fallback when API unavailable) ────────────────────────────────
const MOCK_LIBRARIANS = [
  { id: 'L001', name: 'Admin One',   email: 'admin@library.edu',   role: 'Head Librarian', status: 'Active' },
  { id: 'L002', name: 'Sarah Mehta', email: 's.mehta@library.edu', role: 'Librarian',       status: 'Active' },
];
const MOCK_STUDENTS = [
  { id: 'STU001', name: 'John Doe',      email: 'john.doe@college.edu',   phone: '9876543210', dept: 'Computer Science', year: '3rd Year', joinDate: '2022-06-15', status: 'Active',    booksIssued: 2, finesPending: 0,  finesTotal: 20, loans: [{book:'Clean Code',due:'2025-04-30',status:'active'},{book:'Design Patterns',due:'2025-03-10',status:'returned'}] },
  { id: 'STU002', name: 'Priya Nair',    email: 'priya.nair@college.edu', phone: '9123456780', dept: 'Electronics',     year: '2nd Year', joinDate: '2023-07-20', status: 'Active',    booksIssued: 1, finesPending: 27, finesTotal: 27, loans: [{book:'Signals & Systems',due:'2025-03-01',status:'overdue'}] },
  { id: 'STU003', name: 'Rahul Singh',   email: 'rahul.singh@college.edu',phone: '9988776655', dept: 'Mechanical',      year: '4th Year', joinDate: '2021-08-01', status: 'Suspended', booksIssued: 0, finesPending: 60, finesTotal: 60, loans: [] },
  { id: 'STU004', name: 'Alice Johnson', email: 'alice.j@college.edu',    phone: '9001122334', dept: 'Computer Science', year: '1st Year', joinDate: '2024-06-10', status: 'Active',    booksIssued: 3, finesPending: 5,  finesTotal: 5,  loans: [{book:'Data Structures',due:'2025-05-01',status:'active'}] },
  { id: 'STU005', name: 'Meera Reddy',   email: 'meera.reddy@college.edu',phone: '9876512340', dept: 'Civil',           year: '2nd Year', joinDate: '2023-08-12', status: 'Active',    booksIssued: 0, finesPending: 0,  finesTotal: 0,  loans: [] },
];
const MOCK_FACULTY = [
  { id: 'FAC001', name: 'Dr. Ramesh Kumar', email: 'r.kumar@college.edu', phone: '9811223344', dept: 'Computer Science', designation: 'Professor',       joinDate: '2015-01-10', status: 'Active',    booksIssued: 5, finesPending: 0,  finesTotal: 0,  loans: [{book:'SICP',due:'2025-06-01',status:'active'}] },
  { id: 'FAC002', name: 'Prof. Sunita Rao', email: 's.rao@college.edu',   phone: '9912233445', dept: 'Electronics',     designation: 'Asst. Professor', joinDate: '2018-07-15', status: 'Active',    booksIssued: 3, finesPending: 0,  finesTotal: 10, loans: [{book:'Electronic Devices',due:'2025-05-20',status:'active'}] },
  { id: 'FAC003', name: 'Dr. Anita Sharma',email: 'a.sharma@college.edu', phone: '9033445566', dept: 'Mechanical',      designation: 'Professor',       joinDate: '2010-03-20', status: 'Active',    booksIssued: 2, finesPending: 0,  finesTotal: 0,  loans: [] },
  { id: 'FAC004', name: 'Mr. Vivek Menon', email: 'v.menon@college.edu',  phone: '9744556677', dept: 'Physics',         designation: 'Lecturer',        joinDate: '2021-11-05', status: 'Suspended', booksIssued: 0, finesPending: 15, finesTotal: 15, loans: [] },
];
const MOCK_BOOKS = [
  { id: 'BK001', title: 'Clean Code',              author: 'Robert C. Martin', isbn: '9780132350884', category: 'Computer Science', totalCopies: 5, availableCopies: 3, status: 'Available',  description: 'A handbook of agile software craftsmanship.' },
  { id: 'BK002', title: 'Design Patterns',          author: 'Gang of Four',     isbn: '9780201633610', category: 'Computer Science', totalCopies: 4, availableCopies: 1, status: 'Issued',     description: 'Elements of reusable object-oriented software.' },
  { id: 'BK003', title: 'The Great Gatsby',         author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Fiction',         totalCopies: 6, availableCopies: 6, status: 'Available',  description: 'A story of the fabulously wealthy Jay Gatsby.' },
  { id: 'BK004', title: 'Introduction to Algorithms',author: 'CLRS',            isbn: '9780262033848', category: 'Computer Science', totalCopies: 3, availableCopies: 0, status: 'Issued',     description: 'Comprehensive introduction to modern algorithms.' },
  { id: 'BK005', title: 'Engineering Mathematics',  author: 'H.K. Dass',        isbn: '9788121903455', category: 'Engineering',      totalCopies: 8, availableCopies: 5, status: 'Available',  description: 'Standard text for engineering mathematics.' },
  { id: 'BK006', title: 'Signals & Systems',        author: 'Oppenheim',        isbn: '9780138147570', category: 'Engineering',      totalCopies: 4, availableCopies: 2, status: 'Available',  description: 'Comprehensive treatment of signals and systems.' },
  { id: 'BK007', title: 'To Kill a Mockingbird',   author: 'Harper Lee',        isbn: '9780061935466', category: 'Fiction',         totalCopies: 5, availableCopies: 4, status: 'Available',  description: 'Pulitzer Prize-winning masterwork of American literature.' },
  { id: 'BK008', title: 'Principles of Economics', author: 'N. Gregory Mankiw', isbn: '9781305585126', category: 'Business',        totalCopies: 3, availableCopies: 1, status: 'Issued',     description: 'The most widely used economics textbook.' },
  { id: 'BK009', title: 'Organic Chemistry',       author: 'Paula Y. Bruice',   isbn: '9780134042282', category: 'Sciences',        totalCopies: 4, availableCopies: 3, status: 'Overdue',    description: 'Modern approach to organic chemistry.' },
  { id: 'BK010', title: 'The Pragmatic Programmer', author: 'David Thomas',     isbn: '9780135957059', category: 'Computer Science', totalCopies: 3, availableCopies: 2, status: 'Available',  description: 'From journeyman to master programmer.' },
];
const MOCK_ROLES = [
  { id: 'R001', name: 'System Admin',    permissions: ['all'],                              users: 1,   color: 'red'     },
  { id: 'R002', name: 'Head Librarian',  permissions: ['books','members','reports'],        users: 1,   color: 'indigo'  },
  { id: 'R003', name: 'Librarian',       permissions: ['books','circulation'],              users: 2,   color: 'blue'    },
  { id: 'R004', name: 'Student',         permissions: ['search','reserve'],                 users: 320, color: 'emerald' },
];
const MOCK_LOGS = [
  { id: 1, user: 'Admin One',   action: 'Updated fine rate to ₹12/day',       time: '2m ago',  level: 'warning', timestamp: Date.now() - 120000  },
  { id: 2, user: 'Sarah Mehta', action: 'Deleted book ISBN 9780132350884',     time: '15m ago', level: 'error',   timestamp: Date.now() - 900000  },
  { id: 3, user: 'System',      action: 'Backup completed successfully',       time: '1h ago',  level: 'success', timestamp: Date.now() - 3600000 },
  { id: 4, user: 'Admin One',   action: 'Added new librarian L003',            time: '3h ago',  level: 'info',    timestamp: Date.now() - 10800000},
  { id: 5, user: 'System',      action: 'Scheduled fine auto-calculation ran', time: '6h ago',  level: 'success', timestamp: Date.now() - 21600000},
  { id: 6, user: 'Sarah Mehta', action: 'Issued 5 books via bulk scan',        time: '8h ago',  level: 'info',    timestamp: Date.now() - 28800000},
];
const MONTHLY_USAGE = [
  { month: 'Oct', issued: 48, returned: 42 }, { month: 'Nov', issued: 62, returned: 58 },
  { month: 'Dec', issued: 35, returned: 40 }, { month: 'Jan', issued: 75, returned: 70 },
  { month: 'Feb', issued: 88, returned: 82 }, { month: 'Mar', issued: 91, returned: 85 },
  { month: 'Apr', issued: 54, returned: 48 },
];
const POPULAR_CATEGORIES = [
  { name: 'Computer Science', count: 420 }, { name: 'Fiction & Lit.', count: 350 },
  { name: 'Engineering',      count: 280 }, { name: 'Business & Mgmt', count: 210 },
  { name: 'Sciences',         count: 180 },
];
const DEPT_STATS = [
  { dept: 'Computer Science', active: 850, overdue: 45 }, { dept: 'Electronics', active: 620, overdue: 22 },
  { dept: 'Mechanical',       active: 480, overdue: 38 }, { dept: 'Business',    active: 310, overdue: 12 },
  { dept: 'Arts & Design',    active: 240, overdue: 8  },
];
const USER_GROWTH = [
  { month: 'Oct', new: 45, active: 310 }, { month: 'Nov', new: 60,  active: 360 },
  { month: 'Dec', new: 25, active: 380 }, { month: 'Jan', new: 110, active: 470 },
  { month: 'Feb', new: 85, active: 520 }, { month: 'Mar', new: 95,  active: 600 },
  { month: 'Apr', new: 130,active: 710 },
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard',       icon: TrendingUp },
  { id: 'analytics', label: 'Analytics',       icon: BarChart2  },
  { id: 'users',     label: 'User Management', icon: Users      },
  { id: 'books',     label: 'Books',           icon: BookOpen   },
  { id: 'roles',     label: 'Roles',           icon: Shield     },
  { id: 'payments',  label: 'Payments',        icon: CreditCard },
  { id: 'logs',      label: 'Audit Logs',      icon: FileText   },
  { id: 'settings',  label: 'Settings',        icon: Settings   },
];

const formatTime = (l) => {
  if (l.timestamp) {
    const diff = Math.floor((Date.now() - l.timestamp) / 60000);
    if (diff < 1)    return 'Just now';
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }
  return l.time || '';
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Command Palette ──────────────────────────────────────────────────────────
function CommandPalette({ open, onClose, students, faculty, books, logs, setActiveTab }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = useMemo(() => {
    if (!q.trim()) return { users: [], books: [], logs: [] };
    const lq = q.toLowerCase();
    return {
      users: [...students, ...faculty].filter(u =>
        u.name?.toLowerCase().includes(lq) || u.email?.toLowerCase().includes(lq) || u.id?.toLowerCase().includes(lq)
      ).slice(0, 4),
      books: books.filter(b =>
        b.title?.toLowerCase().includes(lq) || b.author?.toLowerCase().includes(lq) || b.isbn?.includes(lq)
      ).slice(0, 4),
      logs: logs.filter(l => l.action?.toLowerCase().includes(lq)).slice(0, 3),
    };
  }, [q, students, faculty, books, logs]);

  const total = results.users.length + results.books.length + results.logs.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 bg-slate-950/80 backdrop-blur-sm"
         onClick={onClose}>
      <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-palette-in"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search users, books, logs…"
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-base" />
          <kbd className="text-[10px] font-bold px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-white/10">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!q.trim() && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <Command className="w-8 h-8 mx-auto mb-3 opacity-30" />
              Start typing to search across users, books, and logs…
            </div>
          )}
          {q.trim() && total === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">No results for "<span className="text-slate-300">{q}</span>"</div>
          )}
          {results.users.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Users</p>
              {results.users.map(u => (
                <button key={u.id} onClick={() => { setActiveTab('users'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email} · {u.id}</p>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {u.status}
                  </span>
                </button>
              ))}
            </div>
          )}
          {results.books.length > 0 && (
            <div className="p-3 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Books</p>
              {results.books.map(b => (
                <button key={b.id} onClick={() => { setActiveTab('books'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.title}</p>
                    <p className="text-xs text-slate-500 truncate">{b.author} · {b.isbn}</p>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${b.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : b.status === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {b.status}
                  </span>
                </button>
              ))}
            </div>
          )}
          {results.logs.length > 0 && (
            <div className="p-3 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Audit Logs</p>
              {results.logs.map(l => (
                <button key={l.id} onClick={() => { setActiveTab('logs'); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left transition-colors">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{l.action}</p>
                    <p className="text-xs text-slate-500">{l.user} · {formatTime(l)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ logs }) {
  const [open, setOpen]       = useState(false);
  const [read, setRead]       = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const btnRef                = useRef(null);
  const panelRef              = useRef(null);
  const recent                = logs.slice(0, 5);
  const hasUnread             = !read && recent.length > 0;

  // Recalculate position whenever open state changes
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelPos({
        top:  rect.bottom + 8,          // 8px gap below the button
        left: rect.left - 280 + rect.width, // align right edge to button right
      });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const levelDot = { success: 'bg-emerald-400', error: 'bg-red-400', warning: 'bg-amber-400', info: 'bg-blue-400' };
  const levelBg  = { success: 'border-emerald-500/20', error: 'border-red-500/20', warning: 'border-amber-500/20', info: 'border-blue-500/20' };

  const panel = open ? (
    <div
      ref={panelRef}
      style={{ top: panelPos.top, left: Math.max(8, panelPos.left) }}
      className="fixed w-80 z-[9999] overflow-hidden rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/10"
      // Use inline style for top/left so it's always relative to viewport,
      // bypassing any parent stacking context caused by backdrop-filter.
    >
      {/* Backdrop — own blur independent of sidebar */}
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl" />

      {/* Content (above the backdrop) */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <p className="text-sm font-bold text-white">Notifications</p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <span className="text-[9px] font-black px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                {recent.length} new
              </span>
            )}
            <button onClick={() => setOpen(false)} className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
          {recent.length === 0 && (
            <p className="p-6 text-sm text-slate-500 text-center">No notifications yet</p>
          )}
          {recent.map((l, i) => (
            <div key={l.id || i} className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-l-2 ${levelBg[l.level] || 'border-blue-500/20'}`}>
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${levelDot[l.level] || 'bg-blue-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-100 leading-snug font-medium">{l.action}</p>
                <p className="text-[10px] text-slate-500 mt-1">{l.user} · {formatTime(l)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/3">
          <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">Last {recent.length} events</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Bell trigger button */}
      <button
        ref={btnRef}
        onClick={() => { setOpen(o => !o); setRead(true); }}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
            {recent.length}
          </span>
        )}
      </button>
      {typeof document !== 'undefined' && createPortal(panel, document.body)}
    </>
  );
}

// ─── System Health Widget ─────────────────────────────────────────────────────
function SystemHealthWidget({ compact = false }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    const t0 = Date.now();
    try {
      const res = await authService.get('/api/health/');
      setHealth({ ...res.data, ping: Date.now() - t0, connected: true });
    } catch {
      setHealth({ connected: false, uptime: '—', ping: '—' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); const iv = setInterval(fetchHealth, 60000); return () => clearInterval(iv); }, [fetchHealth]);

  const items = [
    { label: 'DB Status',     value: loading ? '…' : (health?.connected ? 'Connected' : 'Disconnected'),
      color: health?.connected ? 'text-emerald-400' : 'text-red-400',
      dot:   health?.connected ? 'bg-emerald-400'   : 'bg-red-400', icon: Database },
    { label: 'Server Uptime', value: loading ? '…' : (health?.uptime || '—'), color: 'text-blue-400',   dot: 'bg-blue-400',   icon: Server },
    { label: 'API Ping',      value: loading ? '…' : (health?.ping ? `${health.ping}ms` : '—'),         color: 'text-indigo-400', dot: 'bg-indigo-400', icon: Wifi },
    { label: 'Last Backup',   value: 'Today 3:00 AM', color: 'text-slate-300', dot: 'bg-slate-400',     icon: Clock },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${health?.connected ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]' : 'bg-red-400'} animate-pulse`} />
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          {loading ? '…' : (health?.connected ? 'API Online' : 'API Offline')}
        </span>
      </div>
    );
  }

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" /> System Health
        </h3>
        <button onClick={fetchHealth} className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map(item => (
          <div key={item.label} className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${item.dot} ${item.dot === 'bg-emerald-400' ? 'shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse' : ''}`} />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
            </div>
            <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sparkline Mini Chart ─────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1', height = 40 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaBottom = `${w},${h} 0,${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaBottom}`} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return i === data.length - 1
          ? <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="#0f172a" strokeWidth="1.5" />
          : null;
      })}
    </svg>
  );
}

// ─── Radial Progress Ring ─────────────────────────────────────────────────────
function RadialRing({ pct, color, size = 56, stroke = 5, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
function QuickBtn({ icon: Icon, label, color, bg, border, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${border} ${bg} hover:scale-105 hover:shadow-lg transition-all duration-200 group w-full`}>
      <div className={`p-2 rounded-lg ${bg} border ${border}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wide ${color} group-hover:opacity-100 opacity-70 transition-opacity text-center leading-tight`}>{label}</span>
    </button>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ librarians, darkMode, logs, setActiveTab, students, faculty }) {
  const maxIssued = Math.max(...MONTHLY_USAGE.map(m => Math.max(m.issued, m.returned)));
  const allUsers  = [...students, ...faculty];
  const [selectedChart, setSelectedChart] = useState('circulation');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  const totalMembers   = allUsers.length + 12000;
  const activeLoans    = allUsers.reduce((a, u) => a + (u.booksIssued || 0), 0) + 1230;
  const overdueCount   = allUsers.reduce((a, u) => a + (u.loans?.filter(l => l.status === 'overdue').length || 0), 0) + 138;
  const pendingFines   = allUsers.reduce((a, u) => a + (u.finesPending || 0), 0) + 14000;
  const suspendedCount = allUsers.filter(u => u.status === 'Suspended').length + 40;
  const pendingRes     = 15;
  const totalBooks     = MOCK_BOOKS.reduce((a, b) => a + b.totalCopies, 0);
  const availableBooks = MOCK_BOOKS.reduce((a, b) => a + b.availableCopies, 0);
  const issuedBooks    = totalBooks - availableBooks;
  const overdueBooks   = MOCK_BOOKS.filter(b => b.status === 'Overdue').length;
  const collectionHealth = Math.round((availableBooks / totalBooks) * 100);
  const returnRate     = Math.round(((activeLoans - overdueCount) / activeLoans) * 100);

  // Sparkline datasets (7 day trends)
  const memberSpark   = [11820, 11900, 11950, 11987, 12003, 12007, totalMembers];
  const loanSpark     = [1180, 1195, 1210, 1225, 1228, 1232, activeLoans];
  const overdueSpark  = [142, 140, 141, 139, 138, 139, overdueCount];
  const fineSpark     = [13100, 13400, 13600, 13800, 13950, 14050, pendingFines];

  // Top borrowers (derived from students + faculty)
  const topBorrowers = [...allUsers]
    .sort((a, b) => (b.booksIssued || 0) - (a.booksIssued || 0))
    .slice(0, 5)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  // Recent transactions feed
  const recentTransactions = [
    { id: 'TX001', user: 'John Doe',      action: 'Issued',   book: 'Clean Code',               time: '2m ago',  status: 'success', dept: 'CS' },
    { id: 'TX002', user: 'Priya Nair',    action: 'Returned', book: 'Signals & Systems',         time: '8m ago',  status: 'info',    dept: 'ECE' },
    { id: 'TX003', user: 'Alice Johnson', action: 'Renewed',  book: 'Data Structures',           time: '14m ago', status: 'warning', dept: 'CS' },
    { id: 'TX004', user: 'Rahul Singh',   action: 'Overdue',  book: 'Engineering Mathematics',   time: '31m ago', status: 'error',   dept: 'ME' },
    { id: 'TX005', user: 'Dr. R. Kumar',  action: 'Issued',   book: 'SICP',                      time: '55m ago', status: 'success', dept: 'CS' },
  ];

  const showToast = (msg) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 2500);
  };

  const kpiCards = [
    {
      label: 'Total Members',
      value: totalMembers.toLocaleString(),
      subLabel: `+247 this month`,
      trend: '+4.2%',
      up: true,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      sparkColor: '#3b82f6',
      sparkData: memberSpark,
      ringPct: 72,
      ringColor: '#3b82f6',
    },
    {
      label: 'Active Loans',
      value: activeLoans.toLocaleString(),
      subLabel: `${returnRate}% return rate`,
      trend: '+12.0%',
      up: true,
      icon: BookMarked,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      sparkColor: '#6366f1',
      sparkData: loanSpark,
      ringPct: returnRate,
      ringColor: '#6366f1',
    },
    {
      label: 'Overdue Items',
      value: overdueCount.toString(),
      subLabel: `${Math.round((overdueCount/activeLoans)*100)}% of active loans`,
      trend: '-2.5%',
      up: false,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      sparkColor: '#ef4444',
      sparkData: overdueSpark,
      ringPct: Math.round((overdueCount / activeLoans) * 100),
      ringColor: '#ef4444',
    },
    {
      label: 'Fine Revenue',
      value: `₹${pendingFines.toLocaleString()}`,
      subLabel: 'Collected this semester',
      trend: '+8.1%',
      up: true,
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      sparkColor: '#10b981',
      sparkData: fineSpark,
      ringPct: 81,
      ringColor: '#10b981',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in relative z-10">

      {/* ── Toast ── */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-[500] bg-slate-800 border border-white/15 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          {actionToast}
        </div>
      )}

      {/* ── Row 1: Enhanced KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(s => (
          <div key={s.label}
            className={`card-glass p-5 relative overflow-hidden group hover:border-white/25 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 cursor-pointer border ${s.border}`}
            onClick={() => setActiveTab(s.label.includes('Member') || s.label.includes('Overdue') ? 'users' : s.label.includes('Loan') ? 'books' : 'payments')}>
            {/* Glow blob */}
            <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity ${s.bg.replace('/10', '')}`} />

            {/* Header row */}
            <div className="flex justify-between items-start mb-3 relative">
              <div className={`p-2.5 rounded-xl ${s.bg} border ${s.border} shadow-inner`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <RadialRing pct={s.ringPct} color={s.ringColor} size={44} stroke={4}>
                <span className={`text-[9px] font-black ${s.color}`}>{s.ringPct}%</span>
              </RadialRing>
            </div>

            {/* Value */}
            <div className="relative mb-3">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-black text-white mt-0.5 tracking-tight">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.subLabel}</p>
            </div>

            {/* Sparkline + trend */}
            <div className="flex items-end justify-between relative">
              <Sparkline data={s.sparkData} color={s.sparkColor} height={36} />
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${s.up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <TrendingUp className={`w-2.5 h-2.5 ${s.up ? '' : 'rotate-180'}`} />{s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Chart + Action Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Enhanced Circulation Chart */}
        <div className="lg:col-span-2 card-glass p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" /> Circulation Overview
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">7-month view</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-indigo-500" /><span className="text-[10px] font-bold text-slate-400">Issued</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500" /><span className="text-[10px] font-bold text-slate-400">Returned</span></div>
            </div>
          </div>

          <div className="flex h-[180px] relative">
            <div className="flex flex-col justify-between items-end pr-3 pb-[28px] text-[9px] text-slate-600 font-bold border-r border-white/5 mr-2 w-8 shrink-0 pt-1">
              <span>{Math.ceil(maxIssued)}</span><span>{Math.round(maxIssued*0.66)}</span><span>{Math.round(maxIssued*0.33)}</span><span>0</span>
            </div>
            <div className="flex-1 flex items-end justify-between relative pl-1">
              <div className="absolute inset-x-0 top-1 bottom-[28px] flex flex-col justify-between pointer-events-none opacity-10">
                {[0,1,2,3].map(i => <div key={i} className="w-full border-t border-slate-500 border-dashed" />)}
              </div>
              {MONTHLY_USAGE.map((m, mi) => (
                <div key={m.month}
                  className="flex flex-col items-center gap-2 relative z-10 w-full h-full group pt-1"
                  onMouseEnter={() => setHoveredBar(mi)}
                  onMouseLeave={() => setHoveredBar(null)}>
                  <div className={`flex items-end justify-center w-full gap-1 flex-1 relative transition-opacity duration-200 ${hoveredBar !== null && hoveredBar !== mi ? 'opacity-30' : 'opacity-100'}`}>
                    <div className="w-1/3 max-w-[14px] rounded-t-md relative overflow-hidden h-full bg-slate-800/60">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-700 to-indigo-400 rounded-t-md transition-all duration-700 shadow-lg"
                        style={{ height: `${(m.issued/maxIssued)*100}%` }} />
                    </div>
                    <div className="w-1/3 max-w-[14px] rounded-t-md relative overflow-hidden h-full bg-slate-800/60">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-md transition-all duration-700 shadow-lg"
                        style={{ height: `${(m.returned/maxIssued)*100}%` }} />
                    </div>
                    {hoveredBar === mi && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/15 px-3 py-2 rounded-xl shadow-2xl z-20 pointer-events-none whitespace-nowrap">
                        <p className="text-[10px] font-black text-slate-300 mb-0.5">{m.month}</p>
                        <p className="text-[10px]"><span className="text-indigo-400 font-bold">{m.issued}</span><span className="text-slate-500"> issued · </span><span className="text-emerald-400 font-bold">{m.returned}</span><span className="text-slate-500"> returned</span></p>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
            {[
              { label: 'Total Issued',    value: MONTHLY_USAGE.reduce((a,m)=>a+m.issued,0),    color: 'text-indigo-400' },
              { label: 'Total Returned',  value: MONTHLY_USAGE.reduce((a,m)=>a+m.returned,0),  color: 'text-emerald-400' },
              { label: 'Net Outstanding', value: MONTHLY_USAGE.reduce((a,m)=>a+(m.issued-m.returned),0), color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required — clickable */}
        <div className="card-glass p-5 flex flex-col">
          <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" /> Action Required
          </h3>
          <div className="space-y-3 flex-1">
            {[
              { count: pendingRes,     label: 'Pending Reservations',  sub: 'Books ready for pickup', color: 'amber',  icon: BookMarked,  tab: 'books',    btn: 'Manage' },
              { count: suspendedCount, label: 'Suspended Accounts',    sub: 'Unpaid fines >₹500',     color: 'red',    icon: Ban,         tab: 'users',    btn: 'Review' },
              { count: overdueCount,   label: 'Overdue Books',         sub: 'Past due date',           color: 'rose',   icon: AlertCircle, tab: 'books',    btn: 'Chase' },
              { count: 8,             label: 'Renewal Requests',      sub: 'Students requested ext.', color: 'blue',   icon: RotateCcw,   tab: 'books',    btn: 'Approve' },
            ].map(item => (
              <div key={item.label}
                className={`p-3 rounded-xl bg-${item.color}-500/8 border border-${item.color}-500/20 hover:bg-${item.color}-500/15 transition-all cursor-pointer group`}
                onClick={() => setActiveTab(item.tab)}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg bg-${item.color}-500/15 text-${item.color}-400 shrink-0`}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white font-bold truncate">{item.count} {item.label}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md bg-${item.color}-500/20 text-${item.color}-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1`}>
                        {item.btn} →
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2">
              <QuickBtn icon={UserPlus}  label="Add User"   color="text-blue-400"    bg="bg-blue-500/10"    border="border-blue-500/20"    onClick={() => { setActiveTab('users');    showToast('Opening User Management…'); }} />
              <QuickBtn icon={BookOpen}  label="Add Book"   color="text-purple-400"  bg="bg-purple-500/10"  border="border-purple-500/20"  onClick={() => { setActiveTab('books');    showToast('Opening Books…'); }} />
              <QuickBtn icon={CreditCard}label="Payment"    color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" onClick={() => { setActiveTab('payments'); showToast('Opening Payments…'); }} />
              <QuickBtn icon={FileText}  label="Reports"    color="text-amber-400"   bg="bg-amber-500/10"   border="border-amber-500/20"   onClick={() => { setActiveTab('analytics');showToast('Opening Analytics…'); }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Top Borrowers + Inventory Health + Recent Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Borrowers Leaderboard */}
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" /> Top Borrowers
            </h3>
            <button onClick={() => setActiveTab('users')} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {topBorrowers.map((u, i) => {
              const maxBooks = topBorrowers[0]?.booksIssued || 1;
              const pct = ((u.booksIssued || 0) / maxBooks) * 100;
              const medalColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600', 'text-slate-400', 'text-slate-500'];
              const bgColors    = ['bg-yellow-500/10', 'bg-slate-400/10', 'bg-amber-600/10', 'bg-slate-500/10', 'bg-slate-600/10'];
              const barColors   = ['from-yellow-500 to-yellow-300', 'from-slate-400 to-slate-200', 'from-amber-600 to-amber-400', 'from-slate-500 to-slate-300', 'from-slate-600 to-slate-400'];
              return (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setActiveTab('users')}>
                  <div className={`w-6 h-6 rounded-lg ${bgColors[i]} flex items-center justify-center shrink-0`}>
                    <span className={`text-[10px] font-black ${medalColors[i]}`}>#{u.rank}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-slate-300">{u.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{u.name}</p>
                      <span className="text-[10px] font-black text-slate-300 shrink-0 ml-1">{u.booksIssued || 0}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${barColors[i]} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-600 mt-0.5">{u.dept} · {u.finesPending > 0 ? <span className="text-red-400">₹{u.finesPending} due</span> : <span className="text-emerald-400">No fines</span>}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collection & Inventory Health */}
        <div className="card-glass p-5">
          <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" /> Collection Health
          </h3>

          {/* Center Ring */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <RadialRing pct={collectionHealth} color="#8b5cf6" size={100} stroke={8}>
                <div className="text-center">
                  <p className="text-xl font-black text-white">{collectionHealth}%</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Available</p>
                </div>
              </RadialRing>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Total',     value: totalBooks,     color: 'text-slate-300', bg: 'bg-slate-800/60' },
              { label: 'Issued',    value: issuedBooks,    color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Overdue',   value: overdueBooks,   color: 'text-red-400',    bg: 'bg-red-500/10'    },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center border border-white/5`}>
                <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="space-y-2">
            {POPULAR_CATEGORIES.slice(0, 4).map((cat, idx) => {
              const max = Math.max(...POPULAR_CATEGORIES.map(c => c.count));
              const pct = (cat.count / max) * 100;
              const barGrads = ['from-blue-500 to-blue-300','from-purple-500 to-purple-300','from-emerald-500 to-emerald-300','from-amber-500 to-amber-300'];
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="shrink-0">{cat.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${barGrads[idx]} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-glass p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Recent Transactions
            </h3>
            <button onClick={() => setActiveTab('logs')} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 transition-colors">
              All Logs →
            </button>
          </div>
          <div className="space-y-2 flex-1">
            {recentTransactions.map(tx => {
              const statusMap = {
                success: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Issued' },
                info:    { dot: 'bg-blue-400',    text: 'text-blue-400',    label: 'Returned' },
                warning: { dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'Renewed' },
                error:   { dot: 'bg-red-400',     text: 'text-red-400',     label: 'Overdue' },
              }[tx.status];
              return (
                <div key={tx.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/8">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusMap.dot} mt-1.5 shrink-0 ${tx.status === 'error' ? 'shadow-[0_0_6px_rgba(239,68,68,0.7)]' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-white truncate">{tx.user}</p>
                      <span className={`text-[9px] font-black ${statusMap.text} shrink-0`}>{tx.action}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{tx.book}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-600">{tx.dept}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-slate-700" />
                      <span className="text-[9px] text-slate-600">{tx.time}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
                </div>
              );
            })}
          </div>

          {/* Live feed indicator */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Live Feed</span>
            </div>
            <SystemHealthWidget compact />
          </div>
        </div>
      </div>

      {/* ── Row 4: Popular Categories + Live Activity + System Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dept-wise Circulation */}
        <div className="card-glass p-5">
          <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" /> Dept. Circulation
          </h3>
          <div className="space-y-3">
            {DEPT_STATS.map((d, i) => {
              const maxActive = Math.max(...DEPT_STATS.map(x => x.active));
              const pct = (d.active / maxActive) * 100;
              const gradients = ['from-blue-500 to-cyan-400','from-purple-500 to-pink-400','from-emerald-500 to-teal-400','from-amber-500 to-yellow-400','from-rose-500 to-red-400'];
              return (
                <div key={d.dept} className="group cursor-pointer hover:bg-white/3 rounded-xl p-1 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors truncate pr-2">{d.dept}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-red-400 font-bold">{d.overdue} OD</span>
                      <span className="text-[10px] text-slate-300 font-bold">{d.active}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${gradients[i]} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity */}
        <div className="card-glass p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black tracking-widest flex items-center gap-2">
              <span className="text-red-500 animate-pulse text-sm leading-none">●</span>
              <span className="text-red-400">Live Activity</span>
            </h3>
            <button onClick={() => setActiveTab('logs')} className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-1 flex-1 overflow-y-auto pr-1">
            {(logs || []).slice(0, 5).map((log, i) => {
              const styles = {
                success: { icon: CheckCircle, colors: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                error:   { icon: XCircle,     colors: 'text-red-400 bg-red-500/10 border-red-500/20' },
                warning: { icon: AlertCircle, colors: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                info:    { icon: FileText,    colors: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              }[log.level] || { icon: FileText, colors: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
              const Icon = styles.icon;
              return (
                <div key={log.id || i} className="flex gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors relative border border-transparent hover:border-white/8">
                  {i !== 4 && <div className="absolute left-[23px] top-9 bottom-0 w-px bg-white/5" />}
                  <div className={`p-1.5 rounded-lg h-fit flex-shrink-0 z-10 border ${styles.colors}`}><Icon className="w-3 h-3" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-200 leading-snug line-clamp-1">{log.action}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="text-slate-400">{log.user}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-slate-700" />
                      <span>{formatTime(log)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <SystemHealthWidget />
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ logs }) {
  const [timeframe, setTimeframe] = useState('30 Days');
  const [activeDonut, setActiveDonut] = useState(null);
  const tMult = timeframe === 'Last 7 Days' ? 0.25 : timeframe === '30 Days' ? 1 : 12;

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    let limit = Infinity;
    if (timeframe === 'Last 7 Days') limit = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === '30 Days') limit = 30 * 24 * 60 * 60 * 1000;
    return (logs || []).filter(l => !l.timestamp || (now - l.timestamp) <= limit);
  }, [logs, timeframe]);

  const dynamicMetrics = useMemo(() => {
    let logIssues = 0, logFines = 0, logReturns = 0;
    filteredLogs.forEach(l => {
      const action = l.action || '';
      if (action.includes('Issued book') || action.includes('borrowed book')) logIssues++;
      const m1 = action.match(/Issued (\d+) books/); if (m1) logIssues += parseInt(m1[1],10);
      if (action.includes('paid fine') || action.includes('Verified payment')) { const m2 = action.match(/₹(\d+)/); if (m2) logFines += parseInt(m2[1],10); }
      if (action.includes('Returned book') || action.includes('returned book')) logReturns++;
    });
    const totalIssued  = Math.floor(453 * tMult) + logIssues;
    const totalFines   = Math.floor(11820 * tMult) + logFines;
    const totalReturned= Math.floor(439 * tMult) + logReturns;
    const returnRate   = totalIssued > 0 ? Math.min(100, Math.round((totalReturned/totalIssued)*100)) : 0;
    return { totalIssued, totalFines, returnRate, peakUsage: 'Fri 2PM' };
  }, [filteredLogs, tMult]);

  const inventory = useMemo(() => {
    const raw = [
      { label: 'Available', val: Math.max(10, 65 - Math.floor(tMult*3)), color: '#3b82f6' },
      { label: 'Issued',    val: Math.min(60, 28 + Math.floor(tMult*2.5)), color: '#94a3b8' },
      { label: 'Overdue',   val: 7 + Math.floor(tMult*0.5), color: '#f43f5e' },
    ];
    const total = raw.reduce((s,i) => s+i.val, 0);
    return raw.map(r => ({ ...r, val: Math.round((r.val/total)*100) }));
  }, [tMult]);

  const growthData = useMemo(() => {
    if (timeframe === 'Last 7 Days') return [
      {label:'Mon',active:120,new:18},{label:'Tue',active:155,new:22},{label:'Wed',active:135,new:10},
      {label:'Thu',active:180,new:30},{label:'Fri',active:210,new:45},{label:'Sat',active:260,new:60},{label:'Sun',active:190,new:15}
    ];
    if (timeframe === '30 Days') return [
      {label:'Week 1',active:460,new:85},{label:'Week 2',active:540,new:125},
      {label:'Week 3',active:510,new:65},{label:'Week 4',active:650,new:160}
    ];
    return USER_GROWTH.map(m => ({label:m.month,...m}));
  }, [timeframe]);

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-16">
      <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-white/10 via-slate-500/10 to-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4 items-center pl-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-300 flex items-center justify-center shadow-lg border border-white/20">
              <Activity className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Analysis</h2>
          </div>
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {['Last 7 Days','30 Days','All Time'].map(t => (
              <button key={t} onClick={() => setTimeframe(t)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${timeframe===t ? 'bg-slate-800 text-white shadow-lg border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label:'Gross Revenue', value:`₹${dynamicMetrics.totalFines.toLocaleString()}`, trend:'+14.2%', icon:Zap,      c1:'from-emerald-500/20', c2:'to-emerald-900/5', color:'text-emerald-400', border:'border-emerald-500/20' },
          { label:'Circulation',   value:dynamicMetrics.totalIssued.toLocaleString(),      trend:'+8.5%',  icon:Hash,     c1:'from-blue-500/20',    c2:'to-blue-900/5',    color:'text-blue-400',    border:'border-blue-500/20'    },
          { label:'Return Rate',   value:`${dynamicMetrics.returnRate}%`,                  trend:'-1.2%',  icon:RotateCcw,c1:'from-slate-500/20',   c2:'to-slate-900/5',   color:'text-slate-300',   border:'border-slate-500/20'   },
          { label:'Peak Usage',    value:dynamicMetrics.peakUsage,                         trend:'High',   icon:Activity, c1:'from-rose-500/20',    c2:'to-rose-900/5',    color:'text-rose-400',    border:'border-rose-500/20'    },
        ].map((s,i) => (
          <div key={i} className={`relative group rounded-3xl bg-slate-900/40 border ${s.border} backdrop-blur-md p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.c1} ${s.c2} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/5"><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/50 border border-white/5 ${s.color}`}>{s.trend}</span>
            </div>
            <div className="relative z-10 mt-5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-white mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative p-[1px] rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent group">
          <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl p-7 h-full border border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">User Base Engagement</h3>
                <p className="text-xs text-slate-500 font-medium">Monthly active users versus new registrations.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 px-3 py-1"><div className="w-2.5 h-2.5 rounded bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" /><span className="text-[10px] font-bold text-slate-400 uppercase">Active</span></div>
                <div className="flex items-center gap-2 px-3 py-1"><div className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" /><span className="text-[10px] font-bold text-slate-400 uppercase">New</span></div>
              </div>
            </div>
            <div className="h-[280px] w-full relative flex mt-4">
              <div className="flex flex-col justify-between items-end pr-4 text-[10px] text-slate-500 font-bold opacity-60 pb-8 pt-1 shrink-0">
                <span>800</span><span>500</span><span>200</span><span>0</span>
              </div>
              <div className="flex-1 relative flex items-end justify-around pl-2">
                <div className="absolute inset-x-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
                  {[0,1,2,3].map(i => <div key={i} className="border-t border-slate-500 border-dashed w-full" />)}
                </div>
                {growthData.map(m => {
                  const maxVal = Math.max(...growthData.map(d => d.active)) * 1.3;
                  return (
                    <div key={m.label} className="flex flex-col items-center gap-3 relative z-10 w-full h-full group pt-2">
                      <div className="flex items-end justify-center w-full gap-2 flex-1 relative opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="w-full max-w-[20px] bg-slate-800/80 rounded-t-xl relative overflow-hidden h-full border border-b-0 border-white/5">
                          <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-700 shadow-lg" style={{ height:`${(m.active/maxVal)*100}%` }} />
                        </div>
                        <div className="w-full max-w-[20px] bg-slate-800/80 rounded-t-xl relative overflow-hidden h-full border border-b-0 border-white/5">
                          <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-xl transition-all duration-700 shadow-lg" style={{ height:`${(m.new/maxVal)*100}%` }} />
                        </div>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700/50 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl z-20 pointer-events-none flex gap-3 backdrop-blur-md">
                          <span className="text-[10px] font-black text-blue-400">{m.active.toLocaleString()} ACTIVE</span>
                          <span className="text-[10px] border-l border-white/10 pl-3 font-black text-indigo-400">+{m.new} NEW</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Global Inventory</h3>
            <p className="text-xs text-slate-500 font-medium">Hover parts to view sector allocation.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center pt-6">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                {(() => {
                  const r = 40, c = 2*Math.PI*r; let accum = 0;
                  return inventory.map((item, idx) => {
                    const strokeDashoffset = c - (item.val/100)*c;
                    const rotation = (accum/100)*360;
                    accum += item.val;
                    const isActive = activeDonut === idx;
                    return (
                      <circle key={item.label} cx="50" cy="50" r={r} fill="transparent"
                        stroke={item.color} strokeWidth={isActive ? "16" : "12"}
                        strokeDasharray={c} strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${rotation} 50 50)`}
                        className={`transition-all duration-300 cursor-crosshair ${isActive ? 'opacity-100' : 'opacity-80'}`}
                        onMouseEnter={() => setActiveDonut(idx)} onMouseLeave={() => setActiveDonut(null)} />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`transition-all duration-300 flex flex-col items-center absolute ${activeDonut===null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-0.5">Total Books</span>
                  <span className="text-3xl font-black text-white">42.5k</span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
                </div>
                {inventory.map((item,idx) => (
                  <div key={'c'+idx} className={`transition-all duration-300 flex flex-col items-center absolute w-full px-4 text-center ${activeDonut===idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <span className="text-[10px] font-black tracking-widest uppercase mb-1" style={{color:item.color}}>{item.label}</span>
                    <span className="text-4xl font-black text-white">{item.val}%</span>
                    <span className="text-[10px] text-slate-300 font-bold mt-1">{(42500*(item.val/100)).toLocaleString()} Items</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full mt-8 flex flex-col gap-2">
              {inventory.map((item,idx) => (
                <div key={item.label} onMouseEnter={() => setActiveDonut(idx)} onMouseLeave={() => setActiveDonut(null)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${activeDonut===idx ? 'bg-slate-800/80 border-white/10 scale-105 shadow-xl' : 'bg-transparent border-transparent'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor:`${item.color}30`}}>
                      <div className="w-1.5 h-1.5 rounded-full m-auto mt-[3px]" style={{backgroundColor:item.color}} />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${activeDonut===idx ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                  <span className={`text-xs font-black ${activeDonut===idx ? 'text-white' : 'text-slate-500'}`}>{item.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept Liability Index */}
        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Dept. Liability Index</h3>
              <p className="text-xs text-slate-500 font-medium">Active loans vs overdue by department.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded" /><span className="text-[10px] text-slate-400 font-bold">Good</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded" /><span className="text-[10px] text-slate-400 font-bold">Overdue</span></div>
            </div>
          </div>
          <div className="space-y-6">
            {DEPT_STATS.map((d) => {
              const globalMax = Math.max(...DEPT_STATS.map(x => x.active+x.overdue));
              const activePct = (d.active/globalMax)*100;
              const overduePct = (d.overdue/globalMax)*100;
              return (
                <div key={d.dept} className="relative group">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span className="group-hover:text-white transition-colors truncate pr-4">{d.dept}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-indigo-400">{d.active.toLocaleString()}</span>
                      <span className="text-rose-400">{d.overdue}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 flex">
                    <div className="h-full bg-gradient-to-r from-indigo-700 to-indigo-400 transition-all duration-700" style={{width:`${activePct}%`}} />
                    <div className="h-full bg-gradient-to-r from-rose-700 to-rose-400 transition-all duration-700" style={{width:`${overduePct}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap */}
        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Peak Traffic Heatmap</h3>
              <p className="text-xs text-slate-500 font-medium">Library footfall by Day and Time.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">Quiet</span>
              <div className="flex gap-1 border border-white/5 p-1 rounded-md bg-slate-900/50">
                {['#1e293b','#4f46e5','#7c3aed','#d946ef'].map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{backgroundColor:c}} />)}
              </div>
              <span className="text-[10px] font-bold text-slate-500">Busy</span>
            </div>
          </div>
          <div className="w-full flex gap-4 mt-2">
            <div className="flex flex-col justify-between text-[10px] font-bold text-slate-500 uppercase pb-6 pt-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="h-6 flex items-center">{d}</span>)}
            </div>
            <div className="flex-1">
              <div className="grid grid-rows-6 gap-2">
                {[[30,45,80,50,95,30],[15,50,75,45,85,25],[40,60,90,55,110,40],[25,55,85,48,100,35],[35,70,110,65,140,50],[50,105,130,90,60,20]].map((row,rIdx) => (
                  <div key={rIdx} className="grid grid-cols-6 gap-2">
                    {row.map((val,cIdx) => {
                      let bgClass = 'bg-slate-800';
                      if (val > 105) bgClass = 'bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.4)]';
                      else if (val > 75) bgClass = 'bg-violet-600';
                      else if (val > 45) bgClass = 'bg-indigo-600';
                      return (
                        <div key={cIdx} className={`h-6 rounded-md relative group cursor-crosshair transition-all duration-300 hover:scale-110 ${bgClass}`}>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 bg-slate-950 border border-slate-700/50 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none flex flex-col items-center min-w-[100px]">
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-b border-r border-slate-700/50 rotate-45" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase relative z-10">{['Mon','Tue','Wed','Thu','Fri','Sat'][rIdx]}, {['9 AM','11 AM','1 PM','3 PM','5 PM','7 PM'][cIdx]}</span>
                            <span className="text-sm font-black text-white relative z-10">{val} <span className="text-[9px] text-slate-500 font-bold">Visitors</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2 mt-3">
                {['9 AM','11 AM','1 PM','3 PM','5 PM','7 PM'].map(t => (
                  <span key={t} className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-tight">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Books Management Tab ─────────────────────────────────────────────────────
function BooksManagementTab({ books, setBooks, onNotify, addLog }) {
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('All');
  const [statusFilter, setStatus]     = useState('All');
  const [selected, setSelected]       = useState(null);
  const [editTarget, setEditTarget]   = useState(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [addForm, setAddForm]         = useState({});
  const [page, setPage]               = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const PAGE_SIZE = 10;

  const allCats = ['All', ...new Set(books.map(b => b.category))];
  const filtered = books.filter(b => {
    const lq = search.toLowerCase();
    const matchQ = !search || b.title.toLowerCase().includes(lq) || b.author.toLowerCase().includes(lq) || b.isbn.includes(lq);
    const matchC = catFilter === 'All' || b.category === catFilter;
    const matchS = statusFilter === 'All' || b.status === statusFilter;
    return matchQ && matchC && matchS;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const statusColor = s => s === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : s === 'Overdue' ? 'bg-red-500/10 text-red-400 border-red-500/30'
    : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

  const handleAdd = (e) => {
    e.preventDefault();
    const newBook = {
      id: `BK${String(books.length+1).padStart(3,'0')}`,
      status: 'Available',
      availableCopies: parseInt(addForm.totalCopies||1),
      ...addForm,
      totalCopies: parseInt(addForm.totalCopies||1),
    };
    setBooks(prev => [newBook, ...prev]);
    setShowAdd(false); setAddForm({});
    onNotify?.(`"${newBook.title}" added to catalog.`);
    addLog?.(`Added book "${newBook.title}" (${newBook.isbn})`, 'success', 'Admin');
  };

  const handleDelete = (id) => {
    const b = books.find(x => x.id === id);
    setBooks(prev => prev.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    setConfirmDel(null);
    onNotify?.(`"${b?.title}" removed from catalog.`);
    addLog?.(`Deleted book "${b?.title}" (${b?.isbn})`, 'error', 'Admin');
  };

  const handleBulkDelete = () => {
    const toDelete = books.filter(b => selectedIds.has(b.id));
    setBooks(prev => prev.filter(b => !selectedIds.has(b.id)));
    setSelectedIds(new Set()); setSelected(null); setBulkConfirm(false);
    onNotify?.(`${toDelete.length} books removed from catalog.`);
    addLog?.(`Bulk deleted ${toDelete.length} books`, 'error', 'Admin');
  };

  const handleBulkMarkStatus = (status) => {
    setBooks(prev => prev.map(b => selectedIds.has(b.id) ? { ...b, status } : b));
    onNotify?.(`${selectedIds.size} books marked as ${status}.`);
    addLog?.(`Bulk updated ${selectedIds.size} books → "${status}"`, 'info', 'Admin');
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedBooks = books.filter(b => selectedIds.has(b.id));
    const csv = [
      'Title,Author,ISBN,Category,Copies,Status',
      ...selectedBooks.map(b => `"${b.title}","${b.author}","${b.isbn}","${b.category}",${b.totalCopies},${b.status}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `books_export_${selectedIds.size}.csv`; a.click();
    URL.revokeObjectURL(url);
    onNotify?.(`Exported ${selectedIds.size} books to CSV.`);
  };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleAll = () => setSelectedIds(selectedIds.size === paged.length ? new Set() : new Set(paged.map(b => b.id)));

  const formFields = [
    { key: 'title',        label: 'Title',           type: 'text',   ph: 'e.g. Clean Code' },
    { key: 'author',       label: 'Author',          type: 'text',   ph: 'e.g. Robert C. Martin' },
    { key: 'isbn',         label: 'ISBN',            type: 'text',   ph: 'e.g. 9780132350884' },
    { key: 'category',     label: 'Category',        type: 'text',   ph: 'e.g. Computer Science' },
    { key: 'totalCopies',  label: 'Total Copies',    type: 'number', ph: '1' },
    { key: 'description',  label: 'Description',     type: 'text',   ph: 'Brief description…' },
  ];

  const kpis = [
    { label: 'Total Books',     value: books.length,                                                   color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
    { label: 'Available',       value: books.filter(b => b.status === 'Available').length,              color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Issued',          value: books.filter(b => b.status === 'Issued').length,                 color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    { label: 'Overdue',         value: books.filter(b => b.status === 'Overdue').length,                color: 'text-red-400',     bg: 'bg-red-500/10'     },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">Book Catalog</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Book</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`card-glass p-5 text-center border border-white/5 ${k.bg}`}>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-glass p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-800/60 rounded-xl px-3 py-2 border border-white/5">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, author, ISBN…"
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1" />
        </div>
        <GlassSelect value={catFilter} onChange={v => { setCatFilter(v); setPage(1); }} options={allCats} className="w-44" />
        <GlassSelect value={statusFilter} onChange={v => { setStatus(v); setPage(1); }} options={['All','Available','Issued','Overdue']} className="w-36" />
        <button onClick={() => { setSearch(''); setCatFilter('All'); setStatus('All'); setPage(1); }}
          className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors">Reset</button>
      </div>

      {/* Table + Drawer */}
      <div className="flex gap-5">
        <div className={`card-glass overflow-x-auto transition-all duration-300 ${selected ? 'flex-1' : 'w-full'}`}>
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              <th className="p-4 w-10">
                <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors">
                  {selectedIds.size === paged.length && paged.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              {['Title / Author','ISBN','Category','Copies','Status','Actions'].map(h => (
                <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {paged.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">No books match your filters.</td></tr>}
              {paged.map(b => (
                <tr key={b.id} onClick={() => setSelected(b)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${selected?.id === b.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''}`}>
                  <td className="p-4" onClick={e => { e.stopPropagation(); toggleSelect(b.id); }}>
                    {selectedIds.has(b.id) ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-indigo-400">{b.title.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{b.title}</p>
                        <p className="text-xs text-slate-500 truncate">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">{b.isbn}</td>
                  <td className="p-4 text-sm text-slate-400 hidden md:table-cell">{b.category}</td>
                  <td className="p-4 text-sm hidden lg:table-cell">
                    <span className="text-emerald-400 font-bold">{b.availableCopies}</span>
                    <span className="text-slate-500">/{b.totalCopies}</span>
                  </td>
                  <td className="p-4"><span className={`badge border text-xs ${statusColor(b.status)}`}>{b.status}</span></td>
                  <td className="p-4">
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditTarget({...b})} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirmDel(b)} className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({length: Math.min(5, totalPages)}, (_,i) => {
                  const p = Math.max(1, Math.min(totalPages-4, page-2)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page===p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="w-72 shrink-0 card-glass p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Book Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-red-400 transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-2 py-3 border-y border-white/10">
              <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-3xl font-black text-indigo-400">{selected.title.charAt(0)}</span>
              </div>
              <p className="text-sm font-bold text-white text-center">{selected.title}</p>
              <span className={`badge border text-xs ${statusColor(selected.status)}`}>{selected.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Author',   value: selected.author   },
                { label: 'ISBN',     value: selected.isbn     },
                { label: 'Category', value: selected.category },
                { label: 'Copies',   value: `${selected.availableCopies} available / ${selected.totalCopies} total` },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{r.label}</p>
                    <p className="text-slate-200 font-semibold truncate">{r.value || '—'}</p>
                  </div>
                </div>
              ))}
              {selected.description && (
                <div className="mt-2 p-3 bg-slate-800/50 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selected.description}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setEditTarget({...selected})} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Book
              </button>
              <button onClick={() => setConfirmDel(selected)} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Remove Book
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Bulk Action Bar — portalled to body so fixed positioning is never trapped ── */}
      {selectedIds.size > 0 && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            animation: 'floatBarIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
            pointerEvents: 'auto',
          }}
          className="flex items-center gap-0 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* COUNT BADGE */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-r border-white/10">
            <div className="relative">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">
                {selectedIds.size}
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white leading-none">{selectedIds.size} Selected</p>
              <p className="text-[9px] text-slate-500 mt-0.5 leading-none">
                {books.filter(b => selectedIds.has(b.id)).slice(0, 2).map(b => b.title.split(' ').slice(0, 2).join(' ')).join(', ')}
                {selectedIds.size > 2 ? ` +${selectedIds.size - 2} more` : ''}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          {!bulkConfirm ? (
            <>
              {/* Mark Available */}
              <button
                onClick={() => handleBulkMarkStatus('Available')}
                title="Mark all selected as Available"
                className="flex items-center gap-1.5 px-3 py-3 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs font-bold border-r border-white/10"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Available</span>
              </button>

              {/* Mark Issued */}
              <button
                onClick={() => handleBulkMarkStatus('Issued')}
                title="Mark all selected as Issued"
                className="flex items-center gap-1.5 px-3 py-3 text-amber-400 hover:bg-amber-500/10 transition-colors text-xs font-bold border-r border-white/10"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Issue</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleBulkExport}
                title="Export selected to CSV"
                className="flex items-center gap-1.5 px-3 py-3 text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-bold border-r border-white/10"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              {/* Delete — shows confirm state */}
              <button
                onClick={() => setBulkConfirm(true)}
                title="Delete all selected"
                className="flex items-center gap-1.5 px-3 py-3 text-red-400 hover:bg-red-500/15 transition-colors text-xs font-bold border-r border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            /* CONFIRM DELETE STATE */
            <div className="flex items-center gap-2 px-3 py-2 border-r border-white/10">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />
              <span className="text-xs font-bold text-white whitespace-nowrap">Delete {selectedIds.size} books?</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setBulkConfirm(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white text-xs font-bold rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* DESELECT ALL */}
          <button
            onClick={() => { setSelectedIds(new Set()); setBulkConfirm(false); }}
            title="Clear selection"
            className="flex items-center gap-1.5 px-3 py-3 text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-5">Add New Book</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} required={f.key !== 'description'} placeholder={f.ph}
                    className="input-field" value={addForm[f.key]||''}
                    onChange={e => setAddForm({...addForm, [f.key]: e.target.value})} />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full justify-center py-3"><Plus className="w-4 h-4" /> Add Book</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-5">Edit: <span className="text-indigo-400">{editTarget.title}</span></h3>
            <form onSubmit={e => {
              e.preventDefault();
              setBooks(prev => prev.map(b => b.id === editTarget.id ? {...editTarget} : b));
              if (selected?.id === editTarget.id) setSelected({...editTarget});
              setEditTarget(null);
              onNotify?.(`"${editTarget.title}" updated successfully.`);
              addLog?.(`Updated book "${editTarget.title}"`, 'info', 'Admin');
            }} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} className="input-field"
                    value={editTarget[f.key]||''}
                    onChange={e => setEditTarget({...editTarget, [f.key]: f.type==='number' ? parseInt(e.target.value)||0 : e.target.value})} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                <GlassSelect value={editTarget.status} onChange={v => setEditTarget({...editTarget, status: v})} options={['Available','Issued','Overdue']} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center py-3"><CheckCircle className="w-4 h-4" /> Save Changes</button>
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 py-3 text-sm font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Remove Book?</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                "<span className="text-white font-bold">{confirmDel.title}</span>" will be removed from the catalog.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => handleDelete(confirmDel.id)} className="flex-1 py-3 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all">Yes, Remove</button>
                <button onClick={() => setConfirmDel(null)} className="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Roles Tab ────────────────────────────────────────────────────────────────
function RolesTab({ librarians, setLibrarians, onNotify, addLog }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState({ name: '', email: '', role: 'Librarian' });
  const roleColors = { 'Head Librarian': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', 'Librarian': 'text-blue-400 bg-blue-500/10 border-blue-500/30' };

  const handleAdd = (e) => {
    e.preventDefault();
    const newLib = { id: `L${String(librarians.length+1).padStart(3,'0')}`, status: 'Active', ...form };
    setLibrarians(prev => [...prev, newLib]);
    setShowAddModal(false); setForm({ name:'', email:'', role:'Librarian' });
    onNotify?.(`${form.name} added as ${form.role}.`);
    addLog?.(`Added librarian ${form.name} (${form.role})`, 'success', 'Admin');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Role Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Librarian</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_ROLES.map(r => (
          <div key={r.id} className={`card-glass p-4 border-t-2 border-${r.color}-500`}>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{r.name}</p>
            <p className={`text-2xl font-black text-${r.color}-400`}>{r.users}</p>
            <p className="text-xs text-slate-500 mt-1">{r.users === 1 ? 'user' : 'users'}</p>
          </div>
        ))}
      </div>
      <div className="card-glass overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['Admin ID','Name','Email','Role','Status','Actions'].map(h => (
              <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {librarians.map(lib => (
              <tr key={lib.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-indigo-400 text-sm">{lib.id}</td>
                <td className="p-4 font-bold text-white text-sm">{lib.name}</td>
                <td className="p-4 text-slate-400 text-sm">{lib.email}</td>
                <td className="p-4"><span className={`badge border text-xs ${roleColors[lib.role]||'text-slate-400 bg-slate-500/10 border-slate-500/30'}`}>{lib.role}</span></td>
                <td className="p-4"><span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{lib.status}</span></td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => setEditTarget({...lib})} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => { setLibrarians(prev => prev.filter(l => l.id !== lib.id)); onNotify?.(`${lib.name} removed.`); addLog?.(`Removed librarian ${lib.name}`, 'warning', 'Admin'); }}
                    className="p-2 text-red-400 hover:text-white bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Add Librarian / Admin</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              {[{key:'name',label:'Full Name',type:'text',ph:'e.g. Riya Kumar'},{key:'email',label:'Email Address',type:'email',ph:'riya@library.edu'}].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input required type={f.type} placeholder={f.ph} className="input-field" value={form[f.key]||''} onChange={e => setForm({...form,[f.key]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Assign Role</label>
                <GlassSelect value={form.role} onChange={v => setForm({...form,role:v})} options={['Librarian','Head Librarian']} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3">Add to System</button>
            </form>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setEditTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-4">Edit: <span className="text-indigo-400">{editTarget.name}</span></h3>
            <form onSubmit={e => {
              e.preventDefault();
              setLibrarians(prev => prev.map(l => l.id === editTarget.id ? {...editTarget} : l));
              onNotify?.(`${editTarget.name} updated.`);
              addLog?.(`Updated librarian ${editTarget.name}`, 'info', 'Admin');
              setEditTarget(null);
            }} className="space-y-4">
              {[{key:'name',label:'Full Name',type:'text'},{key:'email',label:'Email Address',type:'email'}].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input required type={f.type} className="input-field" value={editTarget[f.key]||''} onChange={e => setEditTarget({...editTarget,[f.key]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Role</label>
                <GlassSelect value={editTarget.role} onChange={v => setEditTarget({...editTarget,role:v})} options={['Librarian','Head Librarian']} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 justify-center py-3"><CheckCircle className="w-4 h-4" /> Save</button>
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 py-3 text-sm font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab({ logs }) {
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  const colors = {
    success: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
    error:   { badge: 'bg-red-500/10 text-red-400 border-red-500/30',             dot: 'bg-red-500'     },
    warning: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',       dot: 'bg-amber-500'   },
    info:    { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',           dot: 'bg-blue-500'    },
  };

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.level !== filter) return false;
    if (search && !l.action?.toLowerCase().includes(search.toLowerCase()) && !l.user?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && l.timestamp && l.timestamp < new Date(dateFrom).getTime()) return false;
    if (dateTo   && l.timestamp && l.timestamp > new Date(dateTo).getTime() + 86399999) return false;
    return true;
  });

  const exportCSV = () => {
    const header = 'Level,User,Action,Time\n';
    const rows = filtered.map(l => `"${l.level}","${l.user}","${(l.action||'').replace(/"/g,'""')}","${formatTime(l)}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'audit_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">Audit Logs</h2>
        <button onClick={exportCSV} className="btn-primary bg-emerald-700 hover:bg-emerald-600">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card-glass p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-800/60 rounded-xl px-3 py-2 border border-white/5">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs by action or user…"
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1" />
          </div>
          <div className="flex gap-2">
            {['all','success','warning','error','info'].map(lvl => (
              <button key={lvl} onClick={() => setFilter(lvl)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${filter===lvl ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {lvl.charAt(0).toUpperCase()+lvl.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Calendar className="w-4 h-4" /> Date Range:
          </div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="input-field py-1.5 text-xs w-40" />
          <span className="text-slate-500 text-xs">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="input-field py-1.5 text-xs w-40" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 bg-white/5 rounded-lg">Clear</button>
          )}
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['Level','User','Action','Time'].map(h => (
              <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4"><span className={`badge border text-xs ${colors[log.level]?.badge || colors.info.badge}`}>{log.level?.toUpperCase()}</span></td>
                <td className="p-4 text-sm font-bold text-white">{log.user}</td>
                <td className="p-4 text-[13px] text-slate-300">{log.action}</td>
                <td className="p-4 text-xs text-slate-500 whitespace-nowrap">{formatTime(log)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No logs match your filters.</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-white/10 text-xs text-slate-500 font-semibold">
          {filtered.length} of {logs.length} entries shown
        </div>
      </div>
    </div>
  );
}

// ─── Users Management Tab ─────────────────────────────────────────────────────
function UsersManagementTab({ students, setStudents, faculty, setFaculty, onNotify, addLog }) {
  const [userType, setUserType]         = useState('students');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter]     = useState('All');
  const [selected, setSelected]         = useState(null);
  const [editTarget, setEditTarget]     = useState(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [addForm, setAddForm]           = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
  const [page, setPage]                 = useState(1);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const PAGE_SIZE = 10;

  const data    = userType === 'students' ? students : faculty;
  const setData = userType === 'students' ? setStudents : setFaculty;
  const allDepts = ['All', ...new Set(data.map(u => u.dept))];

  const filtered = data.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchDept   = deptFilter   === 'All' || u.dept   === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const active    = data.filter(u => u.status === 'Active').length;
  const suspended = data.filter(u => u.status === 'Suspended').length;
  const totalFines= data.reduce((a, u) => a + u.finesPending, 0);

  const statusBadge = s => s === 'Active'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-red-500/10 border-red-500/30 text-red-400';

  const toggleStatus = (id) => {
    setData(data.map(u => {
      if (u.id !== id) return u;
      const next = u.status === 'Active' ? 'Suspended' : 'Active';
      onNotify?.(`${u.name} status changed to ${next}.`);
      addLog?.(`Changed status of ${u.name} to ${next}`, next === 'Active' ? 'success' : 'warning', 'Admin');
      return { ...u, status: next };
    }));
    if (selected?.id === id) setSelected(s => ({ ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' }));
  };
  const deleteUser = (id) => {
    const u = data.find(x => x.id === id);
    if (u.booksIssued > 0) { onNotify?.('Cannot delete — user has active loans.', 'error'); return; }
    setConfirmDelete(u);
  };
  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    setRecentlyDeleted({ ...confirmDelete, type: userType });
    setData(data.filter(x => x.id !== confirmDelete.id));
    if (selected?.id === confirmDelete.id) setSelected(null);
    setConfirmDelete(null);
    onNotify?.(`${confirmDelete.name} removed from system.`);
    addLog?.(`Deleted user ${confirmDelete.name} (${confirmDelete.id})`, 'error', 'Admin');
  };
  const handleUndo = () => {
    if (!recentlyDeleted) return;
    const { type, ...userData } = recentlyDeleted;
    if (type === 'students') setStudents(p => [...p, userData]);
    else setFaculty(p => [...p, userData]);
    setRecentlyDeleted(null);
    onNotify?.(`${userData.name} restored.`);
  };
  const waiveFine = (id) => {
    const u = data.find(x => x.id === id);
    setData(data.map(u => u.id === id ? { ...u, finesPending: 0 } : u));
    if (selected?.id === id) setSelected(s => ({ ...s, finesPending: 0 }));
    onNotify?.('Fine waived successfully.');
    addLog?.(`Waived fine for ${u?.name}`, 'success', 'Admin');
  };
  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelectedIds(selectedIds.size === paged.length ? new Set() : new Set(paged.map(u => u.id)));
  const bulkAction = (action) => {
    const affected = data.filter(u => selectedIds.has(u.id));
    if (action === 'suspend')  { setData(data.map(u => selectedIds.has(u.id) ? {...u,status:'Suspended'} : u)); onNotify?.(`${affected.length} accounts suspended.`); addLog?.(`Bulk suspended ${affected.length} users`, 'warning', 'Admin'); }
    if (action === 'activate') { setData(data.map(u => selectedIds.has(u.id) ? {...u,status:'Active'}    : u)); onNotify?.(`${affected.length} accounts activated.`); addLog?.(`Bulk activated ${affected.length} users`, 'success', 'Admin'); }
    if (action === 'waive')    { setData(data.map(u => selectedIds.has(u.id) ? {...u,finesPending:0}     : u)); onNotify?.(`Fines waived for ${affected.length} users.`); addLog?.(`Bulk waived fines for ${affected.length} users`, 'success', 'Admin'); }
    setSelectedIds(new Set());
  };

  const studentFields = [
    {key:'name',label:'Full Name',type:'text',ph:'e.g. John Doe'},{key:'email',label:'Email',type:'email',ph:'student@college.edu'},
    {key:'phone',label:'Phone',type:'text',ph:'9876543210'},{key:'dept',label:'Department',type:'text',ph:'e.g. Computer Science'},
    {key:'year',label:'Year',type:'text',ph:'e.g. 2nd Year'},{key:'joinDate',label:'Join Date',type:'date',ph:''},
  ];
  const facultyFields = [
    {key:'name',label:'Full Name',type:'text',ph:'e.g. Dr. Ramesh Kumar'},{key:'email',label:'Email',type:'email',ph:'faculty@college.edu'},
    {key:'phone',label:'Phone',type:'text',ph:'9811223344'},{key:'dept',label:'Department',type:'text',ph:'e.g. Computer Science'},
    {key:'designation',label:'Designation',type:'text',ph:'e.g. Professor'},{key:'joinDate',label:'Join Date',type:'date',ph:''},
  ];
  const formFields = userType === 'students' ? studentFields : facultyFields;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">User Management</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add {userType === 'students' ? 'Student' : 'Faculty'}</button>
      </div>

      {/* Toggle */}
      <div className="flex gap-2">
        {[{type:'students',label:'Students',icon:GraduationCap,color:'indigo'},{type:'faculty',label:'Faculty',icon:Briefcase,color:'purple'}].map(t => (
          <button key={t.type} onClick={() => { setUserType(t.type); setSelected(null); setSearch(''); setStatusFilter('All'); setDeptFilter('All'); setPage(1); setSelectedIds(new Set()); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${userType===t.type ? `bg-${t.color}-600 border-${t.color}-500 text-white shadow-lg shadow-${t.color}-500/20` : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:'Total',       value:data.length, color:'text-indigo-400',  bg:'bg-indigo-500/10' },
          {label:'Active',      value:active,      color:'text-emerald-400', bg:'bg-emerald-500/10'},
          {label:'Suspended',   value:suspended,   color:'text-red-400',     bg:'bg-red-500/10'    },
          {label:'Fines Pending',value:`₹${totalFines}`,color:'text-amber-400',bg:'bg-amber-500/10'},
        ].map(s => (
          <div key={s.label} className={`card-glass p-5 text-center border border-white/5 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-glass p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-800/60 rounded-xl px-3 py-2 border border-white/5">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, ID or email…"
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1" />
        </div>
        <GlassSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} options={['All','Active','Suspended']} className="w-36" />
        <GlassSelect value={deptFilter}   onChange={v => { setDeptFilter(v);   setPage(1); }} options={allDepts} className="w-48" />
        <button onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All'); setPage(1); }}
          className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors">Reset</button>
        {recentlyDeleted && (
          <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 rounded-xl border border-indigo-500/30 transition-all animate-pulse-subtle">
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
        )}
      </div>

      {/* Table + Drawer */}
      <div className="flex gap-5">
        <div className={`card-glass overflow-x-auto transition-all duration-300 ${selected ? 'flex-1' : 'w-full'}`}>
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              <th className="p-4 w-10">
                <button onClick={toggleAll} className="text-slate-400 hover:text-white transition-colors">
                  {selectedIds.size === paged.length && paged.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Dept</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">{userType==='students' ? 'Year' : 'Designation'}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fines</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {paged.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-slate-500">No records match your search.</td></tr>}
              {paged.map(u => (
                <tr key={u.id} onClick={() => setSelected(u)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${selected?.id===u.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''}`}>
                  <td className="p-4" onClick={e => { e.stopPropagation(); toggleSelect(u.id); }}>
                    {selectedIds.has(u.id) ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                  </td>
                  <td className="p-4 font-mono text-indigo-400 text-xs">{u.id}</td>
                  <td className="p-4"><p className="text-sm font-bold text-white">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                  <td className="p-4 text-sm text-slate-400 hidden md:table-cell">{u.dept}</td>
                  <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">{userType==='students' ? u.year : u.designation}</td>
                  <td className="p-4"><span className={`badge border text-xs ${statusBadge(u.status)}`}>{u.status}</span></td>
                  <td className="p-4 text-sm font-bold">{u.finesPending > 0 ? <span className="text-red-400">₹{u.finesPending}</span> : <span className="text-slate-600">—</span>}</td>
                  <td className="p-4"><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditTarget({...u})} className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleStatus(u.id)} className={`p-1.5 rounded-lg transition-colors ${u.status==='Active' ? 'text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500' : 'text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500'}`}>
                      {u.status==='Active' ? <Ban className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                  const p = Math.max(1,Math.min(totalPages-4,page-2))+i;
                  return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page===p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{p}</button>;
                })}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-white/5 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="w-80 shrink-0 card-glass p-5 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Profile</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-red-400 transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-2 py-3 border-y border-white/10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${userType==='students' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {selected.name.charAt(0)}
              </div>
              <p className="text-base font-bold text-white">{selected.name}</p>
              <span className={`badge border text-xs ${statusBadge(selected.status)}`}>{selected.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                {icon:Hash,      label:'ID',         value:selected.id},
                {icon:Mail,      label:'Email',      value:selected.email},
                {icon:Phone,     label:'Phone',      value:selected.phone},
                {icon:Database,  label:'Department', value:selected.dept},
                ...(userType==='students' ? [{icon:GraduationCap,label:'Year',value:selected.year}] : [{icon:Briefcase,label:'Designation',value:selected.designation}]),
                {icon:Calendar,  label:'Joined',     value:selected.joinDate},
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <row.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{row.label}</p>
                    <p className="text-slate-200 font-semibold truncate">{row.value||'—'}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fines</p>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Pending</span><span className={selected.finesPending > 0 ? 'text-red-400 font-black' : 'text-slate-500'}>₹{selected.finesPending}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Total Paid</span><span className="text-emerald-400 font-bold">₹{selected.finesTotal}</span></div>
              {selected.finesPending > 0 && (
                <button onClick={() => waiveFine(selected.id)} className="w-full mt-2 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition-colors">Waive Pending Fine</button>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Loan History ({selected.loans.length})</p>
              {selected.loans.length === 0 && <p className="text-xs text-slate-600">No loans on record.</p>}
              <div className="space-y-2">
                {selected.loans.map((loan,i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs border ${loan.status==='overdue' ? 'bg-red-500/10 border-red-500/20' : loan.status==='active' ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/50 border-white/5'}`}>
                    <BookOpen className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                    <div><p className="font-bold text-slate-200">{loan.book}</p><p className={`font-semibold ${loan.status==='overdue' ? 'text-red-400' : loan.status==='active' ? 'text-indigo-400' : 'text-emerald-400'}`}>{loan.status==='returned' ? '✓ Returned' : `Due: ${loan.due}`}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setEditTarget({...selected})} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"><Edit3 className="w-4 h-4" /> Edit Profile</button>
              <button onClick={() => toggleStatus(selected.id)} className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl border transition-colors ${selected.status==='Active' ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}>
                {selected.status==='Active' ? <><Ban className="w-4 h-4" /> Suspend Account</> : <><Unlock className="w-4 h-4" /> Activate Account</>}
              </button>
              <button onClick={() => deleteUser(selected.id)} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /> Remove User</button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900/95 border border-white/15 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-xl animate-palette-in">
          <span className="text-sm font-bold text-white">{selectedIds.size} selected</span>
          <div className="w-px h-5 bg-white/10" />
          <button onClick={() => bulkAction('activate')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:text-white hover:bg-emerald-500 rounded-xl border border-emerald-500/30 transition-all"><CheckCircle className="w-3.5 h-3.5" /> Activate</button>
          <button onClick={() => bulkAction('suspend')}  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-amber-400 hover:text-white hover:bg-amber-500 rounded-xl border border-amber-500/30 transition-all"><Ban className="w-3.5 h-3.5" /> Suspend</button>
          <button onClick={() => bulkAction('waive')}    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-500 rounded-xl border border-blue-500/30 transition-all"><Zap className="w-3.5 h-3.5" /> Waive Fines</button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modals */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-5">Edit {userType==='students' ? 'Student' : 'Faculty'}: {editTarget.name}</h3>
            <form onSubmit={e => {
              e.preventDefault();
              setData(data.map(u => u.id === editTarget.id ? {...editTarget} : u));
              if (selected?.id === editTarget.id) setSelected({...editTarget});
              setEditTarget(null);
              onNotify?.('User details updated successfully.');
              addLog?.(`Updated details for ${editTarget.name}`, 'info', 'Admin');
            }} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} required placeholder={f.ph} className="input-field" value={editTarget[f.key]||''} onChange={e => setEditTarget({...editTarget,[f.key]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                <GlassSelect value={editTarget.status} onChange={v => setEditTarget({...editTarget,status:v})} options={['Active','Suspended']} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center py-3"><CheckCircle className="w-4 h-4" /> Save Changes</button>
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 py-3 text-sm font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400"><XCircle className="w-6 h-6" /></button>
            <h3 className="text-lg font-bold text-white mb-5">Add New {userType==='students' ? 'Student' : 'Faculty Member'}</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const prefix = userType==='students' ? 'STU' : 'FAC';
              const newUser = { id:`${prefix}${String(data.length+1).padStart(3,'0')}`, status:'Active', booksIssued:0, finesPending:0, finesTotal:0, loans:[], ...addForm };
              setData(prev => [...prev, newUser]);
              setShowAdd(false); setAddForm({});
              onNotify?.(`${newUser.name} added successfully.`);
              addLog?.(`Registered new user ${newUser.name}`, 'success', 'Admin');
            }} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} required placeholder={f.ph} className="input-field" value={addForm[f.key]||''} onChange={e => setAddForm({...addForm,[f.key]:e.target.value})} />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full justify-center py-3"><UserPlus className="w-4 h-4" /> Add {userType==='students' ? 'Student' : 'Faculty'}</button>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30"><Trash2 className="w-8 h-8 text-red-500" /></div>
              <h3 className="text-xl font-black text-white mb-2">Are you sure?</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">You are about to delete <span className="text-white font-bold">{confirmDelete.name}</span>. This action can be undone briefly.</p>
              <div className="flex gap-3 w-full">
                <button onClick={handleConfirmDelete} className="flex-1 py-3 text-sm font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 text-sm font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ settings, setSettings, onNotify, darkMode, setDarkMode, addLog }) {
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [loading, setLoading]             = useState(false);
  const [fetchLoading, setFetchLoading]   = useState(true);

  // Load from backend on mount
  useEffect(() => {
    setFetchLoading(true);
    authService.get('/api/settings/')
      .then(res => {
        const s = res.data;
        const mapped = {
          fineRate: s.fineRate, maxBooksStudent: s.maxBooksStudent, maxBooksFaculty: s.maxBooksFaculty,
          borrowDurationStudent: s.borrowDurationStudent, borrowDurationFaculty: s.borrowDurationFaculty,
          globalMaxBooks: s.globalMaxBooks, reservationExpiry: s.reservationExpiry,
        };
        setLocalSettings(mapped); setSettings(mapped);
      })
      .catch(() => { /* use default */ })
      .finally(() => setFetchLoading(false));
  }, []);

  useEffect(() => { setLocalSettings({ ...settings }); }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const changes = [];
    const fieldNames = { fineRate:'Fine rate', maxBooksStudent:'Max books (student)', maxBooksFaculty:'Max books (faculty)', borrowDurationStudent:'Borrow duration (student)', borrowDurationFaculty:'Borrow duration (faculty)', globalMaxBooks:'Global max books', reservationExpiry:'Reservation expiry' };
    Object.keys(localSettings).forEach(key => {
      if (String(settings[key]) !== String(localSettings[key])) {
        changes.push(`Updated ${fieldNames[key]||key} from ${settings[key]} to ${localSettings[key]}`);
      }
    });
    try {
      await authService.put('/api/settings/', localSettings);
      setSettings({ ...localSettings });
      changes.forEach(c => addLog?.(c, 'info', 'Admin'));
      onNotify?.(changes.length > 0 ? `Successfully updated ${changes.length} setting(s).` : 'No settings were changed.', changes.length > 0 ? 'success' : 'info');
    } catch {
      onNotify?.('Failed to save settings. Changes saved locally.', 'warning');
      setSettings({ ...localSettings });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">System Settings</h2>
      </div>
      <form onSubmit={handleSave} className="space-y-4 max-w-4xl">
        <div className="card-glass p-4 space-y-3 border-l-4 border-red-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" /> Fines & Penalties</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Fine Per Day (₹)</label>
              <input type="number" min="1" value={localSettings.fineRate} onChange={e => setLocalSettings({...localSettings,fineRate:e.target.value})} className="input-field py-2" />
            </div>
          </div>
        </div>
        <div className="card-glass p-4 space-y-3 border-l-4 border-indigo-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><BookMarked className="w-4 h-4 text-indigo-400" /> Borrow Limits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {key:'maxBooksStudent',      label:'Max Books — Student'},
              {key:'maxBooksFaculty',      label:'Max Books — Faculty'},
              {key:'borrowDurationStudent',label:'Borrow Duration — Student (Days)'},
              {key:'borrowDurationFaculty',label:'Borrow Duration — Faculty (Days)'},
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">{f.label}</label>
                <input type="number" min="1" value={localSettings[f.key]} onChange={e => setLocalSettings({...localSettings,[f.key]:e.target.value})} className="input-field py-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-glass p-4 space-y-3 border-l-4 border-emerald-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /> System Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {key:'globalMaxBooks',    label:'Global Max Books'},
              {key:'reservationExpiry', label:'Reservation Expiry (Days)'},
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">{f.label}</label>
                <input type="number" min="1" value={localSettings[f.key]||''} onChange={e => setLocalSettings({...localSettings,[f.key]:e.target.value})} className="input-field py-2" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary py-3 px-8 text-base disabled:opacity-60">
            {loading ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" /></svg> : <CheckCircle className="w-4 h-4" />}
            {loading ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

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

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, setPayments, issuedBooks, setIssuedBooks, addLog, onNotify }) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const verified = payments.filter(p => p.status === 'Verified').reduce((a,b) => a+b.amount, 0);
  const pending  = payments.filter(p => p.status === 'Pending' || p.status === 'Pending Verification').reduce((a,b) => a+b.amount, 0);

  const handleVerify = (payment) => {
    setPayments(payments.map(x => x.id === payment.id ? { ...x, status: 'Verified' } : x));
    if (payment.bookId && issuedBooks && setIssuedBooks) {
      setIssuedBooks(issuedBooks.map(b => b.id === payment.bookId ? { 
        ...b, 
        status: 'returned', 
        fine: 0, 
        returnedOn: new Date().toISOString() 
      } : b));
    }
    onNotify?.(`Verified payment of ₹${payment.amount} from ${payment.member}.`, 'success');
    addLog?.(`Verified payment of ₹${payment.amount} from ${payment.member} & returned book`, 'success', 'Admin');
  };

  const handleReject = (payment) => {
    setPayments(payments.map(x => x.id === payment.id ? { ...x, status: 'Rejected' } : x));
    if (payment.bookId && issuedBooks && setIssuedBooks) {
      setIssuedBooks(issuedBooks.map(b => b.id === payment.bookId ? { 
        ...b, 
        status: 'issued'
      } : b));
    }
    onNotify?.(`Rejected payment request from ${payment.member}.`, 'warning');
    addLog?.(`Rejected return payment of ₹${payment.amount} from ${payment.member}`, 'warning', 'Admin');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="section-title mb-0">Payments & Returns Ledger</h2>
      
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

      <div className="card-glass overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-slate-800/50">
              {['Receipt ID', 'Member', 'Amount', 'Type', 'Date', 'Status', 'Action'].map(h => (
                <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {payments.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">No transactions recorded.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-xs font-mono text-indigo-400">{p.id}</td>
                <td className="p-4">
                  <p className="text-sm font-bold text-white">{p.member}</p>
                  <p className="text-xs text-slate-500">{p.memberId}</p>
                </td>
                <td className="p-4 text-sm font-black text-slate-200">₹{p.amount.toFixed(2)}</td>
                <td className="p-4 text-sm text-slate-400">
                  <div>{p.type}</div>
                  {p.bookTitle && <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[180px]">For: {p.bookTitle}</div>}
                </td>
                <td className="p-4 text-sm text-slate-400">{p.date}</td>
                <td className="p-4">
                  <span className={`badge border ${p.status==='Verified' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : p.status==='Rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>{p.status}</span>
                </td>
                <td className="p-4">
                  {(p.status === 'Pending' || p.status === 'Pending Verification') && (
                    <div className="flex gap-2">
                      {p.status === 'Pending Verification' ? (
                        <button 
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-all"
                        >
                          Verify Return
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerify(p)} 
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Screenshot Viewer Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-white">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedPayment(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition-colors z-10 bg-slate-900/50 rounded-full">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Verification Receipt</h3>
            <div className="space-y-4 text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Receipt ID:</span>
                <span className="text-white font-mono">{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Member:</span>
                <span className="text-white font-bold">{selectedPayment.member} ({selectedPayment.memberId})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Book:</span>
                <span className="text-white font-medium">{selectedPayment.bookTitle || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">₹{selectedPayment.amount.toFixed(2)}</span>
              </div>
              
              <div>
                <span className="block text-slate-400 text-sm mb-2">Receipt Screenshot:</span>
                {selectedPayment.screenshot ? (
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-64">
                    <img src={selectedPayment.screenshot} alt="Receipt Screenshot" className="max-w-full max-h-64 object-contain" />
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-xs">
                    No screenshot uploaded
                  </div>
                )}
              </div>
              
              {selectedPayment.status === 'Pending Verification' && (
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      handleVerify(selectedPayment);
                      setSelectedPayment(null);
                    }}
                    className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25 justify-center py-2.5"
                  >
                    Approve Return
                  </button>
                  <button 
                    onClick={() => {
                      handleReject(selectedPayment);
                      setSelectedPayment(null);
                    }}
                    className="flex-1 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-2.5 rounded-xl text-sm transition-all text-center"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ user, onNotify }) {
  const darkMode = true; // always dark
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [librarians, setLibrarians] = useState(MOCK_LIBRARIANS);
  const [students, setStudents]     = useState(MOCK_STUDENTS);
  const [faculty, setFaculty]       = useState(MOCK_FACULTY);
  const [books, setBooks]           = useState(MOCK_BOOKS);
  const [issuedBooks, setIssuedBooks] = useLocalStorage('library_issuedBooks', []);
  const [payments, setPayments]       = useLocalStorage('library_payments', []);
  const [reservations, setReservations] = useLocalStorage('library_reservations', []);

  const pendingReservationsCount = reservations.filter(r => r.status === 'Pending').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending' || p.status === 'Pending Verification').length;
  const [settings, setSettings] = useState({
    fineRate: 10, maxBooksStudent: 5, maxBooksFaculty: 15,
    borrowDurationStudent: 14, borrowDurationFaculty: 30,
    globalMaxBooks: 20, reservationExpiry: 7,
  });
  const [logs, setLogs] = useState(() => {
    try { const s = localStorage.getItem('admin_audit_logs'); return s ? JSON.parse(s) : MOCK_LOGS; }
    catch { return MOCK_LOGS; }
  });
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Sync with global theme — admin-light-mode on body is now handled by ThemeContext

  // Global keyboard shortcut for palette
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(o => !o); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const syncLogs = () => {
    try { const s = localStorage.getItem('admin_audit_logs'); if (s) setLogs(JSON.parse(s)); } catch {}
  };
  const fetchDbLogs = () => {
    authService.get('/api/audit-logs/')
      .then(res => { if (Array.isArray(res.data)) { setLogs(res.data); localStorage.setItem('admin_audit_logs', JSON.stringify(res.data)); } })
      .catch(() => syncLogs());
  };

  useEffect(() => {
    fetchDbLogs();
    window.addEventListener('storage', syncLogs);
    window.addEventListener('storage_updated', fetchDbLogs);
    return () => { window.removeEventListener('storage', syncLogs); window.removeEventListener('storage_updated', fetchDbLogs); };
  }, []);

  const addLog = (action, level = 'info', u = 'System') => addAuditLog(action, level, u);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab librarians={librarians} darkMode={darkMode} logs={logs} setActiveTab={setActiveTab} students={students} faculty={faculty} />;
      case 'analytics': return <AnalyticsTab logs={logs} />;
      case 'users':     return <UsersManagementTab students={students} setStudents={setStudents} faculty={faculty} setFaculty={setFaculty} onNotify={onNotify} addLog={addLog} />;
      case 'books':     return <BooksManagementTab books={books} setBooks={setBooks} onNotify={onNotify} addLog={addLog} />;
      case 'roles':     return <RolesTab librarians={librarians} setLibrarians={setLibrarians} onNotify={onNotify} addLog={addLog} />;
      case 'payments':  return <PaymentsTab payments={payments} setPayments={setPayments} issuedBooks={issuedBooks} setIssuedBooks={setIssuedBooks} onNotify={onNotify} addLog={addLog} />;
      case 'logs':      return <LogsTab logs={logs} />;
      case 'settings':  return <SettingsTab settings={settings} setSettings={setSettings} onNotify={onNotify} darkMode={darkMode} setDarkMode={setDarkMode} addLog={addLog} />;
      default: return null;
    }
  };

  return (
    <div className={`flex h-[calc(100vh-64px)] w-full overflow-hidden page-enter transition-all duration-700 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900 admin-light-mode'}`}>

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)}
        students={students} faculty={faculty} books={books} logs={logs} setActiveTab={setActiveTab} />

      {/* Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto custom-scrollbar shadow-2xl z-20 flex flex-col">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="p-5 relative z-10 flex-1">
          <div className="mb-5 px-2 pt-3 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">Admin Portal</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Control</p>
              </div>
            </div>
            <NotificationBell logs={logs} />
          </div>

          {/* Global Search Button */}
          <button onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-slate-800/60 border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10 transition-all text-xs font-medium">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search anything…</span>
            <kbd className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-700 rounded-md border border-white/5">⌘K</kbd>
          </button>

          <div className="flex flex-col gap-2">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const badgeCount = {
                books: pendingReservationsCount,
                payments: pendingPaymentsCount,
              }[tab.id] || 0;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-bold relative group overflow-hidden
                    ${isActive ? 'text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.15)] -translate-y-0.5' : 'text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-white hover:border-white/5 hover:-translate-y-0.5'}`}>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
