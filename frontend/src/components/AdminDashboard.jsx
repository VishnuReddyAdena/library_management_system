import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Settings, Shield, Users, Database, Zap, BookMarked, UserPlus,
  Trash2, Edit3, ChevronRight, TrendingUp, BarChart2, Activity,
  FileText, Moon, Sun, Plus, XCircle, CheckCircle, AlertCircle,
  GraduationCap, Briefcase, Eye, EyeOff, BookOpen, Search,
  RotateCcw, Ban, Unlock, Mail, Phone, Calendar, Hash, Download
} from 'lucide-react';
import GlassSelect from './GlassSelect';
import { addAuditLog } from '../utils/auditLogger';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LIBRARIANS = [
  { id: 'L001', name: 'Admin One', email: 'admin@library.edu', role: 'Head Librarian', status: 'Active' },
  { id: 'L002', name: 'Sarah Mehta', email: 's.mehta@library.edu', role: 'Librarian', status: 'Active' },
];

const MOCK_STUDENTS = [
  { id: 'STU001', name: 'John Doe',      email: 'john.doe@college.edu',      phone: '9876543210', dept: 'Computer Science', year: '3rd Year', joinDate: '2022-06-15', status: 'Active',    booksIssued: 2, finesPending: 0,   finesTotal: 20,  loans: [{book:'Clean Code', due:'2025-04-30', status:'active'},{book:'Design Patterns',due:'2025-03-10',status:'returned'}] },
  { id: 'STU002', name: 'Priya Nair',    email: 'priya.nair@college.edu',    phone: '9123456780', dept: 'Electronics',     year: '2nd Year', joinDate: '2023-07-20', status: 'Active',    booksIssued: 1, finesPending: 27,  finesTotal: 27,  loans: [{book:'Signals & Systems',due:'2025-03-01',status:'overdue'}] },
  { id: 'STU003', name: 'Rahul Singh',   email: 'rahul.singh@college.edu',   phone: '9988776655', dept: 'Mechanical',      year: '4th Year', joinDate: '2021-08-01', status: 'Suspended', booksIssued: 0, finesPending: 60,  finesTotal: 60,  loans: [] },
  { id: 'STU004', name: 'Alice Johnson', email: 'alice.j@college.edu',       phone: '9001122334', dept: 'Computer Science', year: '1st Year', joinDate: '2024-06-10', status: 'Active',    booksIssued: 3, finesPending: 5,   finesTotal: 5,   loans: [{book:'Data Structures',due:'2025-05-01',status:'active'},{book:'Algorithms',due:'2025-05-10',status:'active'},{book:'OS Concepts',due:'2025-05-15',status:'active'}] },
  { id: 'STU005', name: 'Meera Reddy',   email: 'meera.reddy@college.edu',   phone: '9876512340', dept: 'Civil',           year: '2nd Year', joinDate: '2023-08-12', status: 'Active',    booksIssued: 0, finesPending: 0,   finesTotal: 0,   loans: [] },
];

const MOCK_FACULTY = [
  { id: 'FAC001', name: 'Dr. Ramesh Kumar',  email: 'r.kumar@college.edu',    phone: '9811223344', dept: 'Computer Science', designation: 'Professor',       joinDate: '2015-01-10', status: 'Active',    booksIssued: 5, finesPending: 0,   finesTotal: 0,   loans: [{book:'SICP',due:'2025-06-01',status:'active'},{book:'CLRS',due:'2025-06-01',status:'active'}] },
  { id: 'FAC002', name: 'Prof. Sunita Rao',  email: 's.rao@college.edu',      phone: '9912233445', dept: 'Electronics',     designation: 'Asst. Professor', joinDate: '2018-07-15', status: 'Active',    booksIssued: 3, finesPending: 0,   finesTotal: 10,  loans: [{book:'Electronic Devices',due:'2025-05-20',status:'active'}] },
  { id: 'FAC003', name: 'Dr. Anita Sharma',  email: 'a.sharma@college.edu',   phone: '9033445566', dept: 'Mechanical',      designation: 'Professor',       joinDate: '2010-03-20', status: 'Active',    booksIssued: 2, finesPending: 0,   finesTotal: 0,   loans: [] },
  { id: 'FAC004', name: 'Mr. Vivek Menon',   email: 'v.menon@college.edu',    phone: '9744556677', dept: 'Physics',         designation: 'Lecturer',        joinDate: '2021-11-05', status: 'Suspended', booksIssued: 0, finesPending: 15,  finesTotal: 15,  loans: [] },
];

const MOCK_ROLES = [
  { id: 'R001', name: 'System Admin', permissions: ['all'], users: 1, color: 'red' },
  { id: 'R002', name: 'Head Librarian', permissions: ['books', 'members', 'reports'], users: 1, color: 'indigo' },
  { id: 'R003', name: 'Librarian', permissions: ['books', 'circulation'], users: 2, color: 'blue' },
  { id: 'R004', name: 'Student', permissions: ['search', 'reserve'], users: 320, color: 'emerald' },
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

// Simple inline bar chart (no external lib needed)
const MONTHLY_USAGE = [
  { month: 'Oct', issued: 48, returned: 42 },
  { month: 'Nov', issued: 62, returned: 58 },
  { month: 'Dec', issued: 35, returned: 40 },
  { month: 'Jan', issued: 75, returned: 70 },
  { month: 'Feb', issued: 88, returned: 82 },
  { month: 'Mar', issued: 91, returned: 85 },
  { month: 'Apr', issued: 54, returned: 48 },
];

const FINE_COLLECTION = [
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1850 },
  { month: 'Dec', amount: 900  },
  { month: 'Jan', amount: 2100 },
  { month: 'Feb', amount: 1750 },
  { month: 'Mar', amount: 2600 },
  { month: 'Apr', amount: 1420 },
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: TrendingUp    },
  { id: 'analytics', label: 'Analytics',  icon: BarChart2     },
  { id: 'users',     label: 'User Management', icon: Users         },
  { id: 'roles',     label: 'Roles',      icon: Shield        },
  { id: 'logs',      label: 'Audit Logs', icon: FileText      },
  { id: 'settings',  label: 'Settings',   icon: Settings      },
];

// ─── Component specific mock data ───
const POPULAR_CATEGORIES = [
  { name: 'Computer Science', count: 420 },
  { name: 'Fiction & Lit.',   count: 350 },
  { name: 'Engineering',      count: 280 },
  { name: 'Business & Mgmt',  count: 210 },
  { name: 'Sciences',         count: 180 },
];

const DEPT_STATS = [
  { dept: 'Computer Science', active: 850, overdue: 45 },
  { dept: 'Electronics',      active: 620, overdue: 22 },
  { dept: 'Mechanical',       active: 480, overdue: 38 },
  { dept: 'Business',         active: 310, overdue: 12 },
  { dept: 'Arts & Design',    active: 240, overdue: 8 },
];

const USER_GROWTH = [
  { month: 'Oct', new: 45, active: 310 },
  { month: 'Nov', new: 60, active: 360 },
  { month: 'Dec', new: 25, active: 380 },
  { month: 'Jan', new: 110, active: 470 },
  { month: 'Feb', new: 85, active: 520 },
  { month: 'Mar', new: 95, active: 600 },
  { month: 'Apr', new: 130, active: 710 },
];

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ librarians, darkMode, logs, setActiveTab }) {
  const maxIssued = Math.max(...MONTHLY_USAGE.map(m => Math.max(m.issued, m.returned)));

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members',   value: '12,450',  trend: '+4.2%',  up: true,  icon: Users,      color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { label: 'Active Loans',    value: '1,248',   trend: '+12.0%', up: true,  icon: BookMarked, color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
          { label: 'Overdue Items',   value: '142',     trend: '-2.5%',  up: true,  icon: AlertCircle,color: 'text-red-400',     bg: 'bg-red-500/10' },
          { label: 'Fine Revenue',    value: '₹14,520', trend: '+8.1%',  up: true,  icon: Zap,        color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className="card-glass p-5 relative overflow-hidden group hover:border-white/20 transition-all">
            {/* Glow effect behind icon */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${s.bg.replace('/10', '')}`} />
            
            <div className="flex justify-between items-start mb-4 relative">
              <div className={`p-2.5 rounded-xl ${s.bg} border border-white/5 shadow-inner`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
                s.up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {s.trend}
              </div>
            </div>
            
            <div className="relative">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Overview — Takes 2/3 width */}
        <div className="lg:col-span-2 card-glass p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" /> Circulation Overview
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" /><span className="text-[11px] font-bold text-slate-400">Issued</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><span className="text-[11px] font-bold text-slate-400">Returned</span></div>
            </div>
          </div>
          
          <div className="flex h-[200px] relative">
            {/* Y-Axis Grid Labels */}
            <div className="flex flex-col justify-between items-end pr-3 pb-[32px] text-[10px] text-slate-500 font-bold border-r border-white/10 mr-2 w-10 shrink-0 opacity-80 pt-1">
              <span>{Math.ceil(maxIssued)}</span>
              <span>{Math.round(maxIssued * 0.66)}</span>
              <span>{Math.round(maxIssued * 0.33)}</span>
              <span>0</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between relative pl-1">
              {/* Background Grid Lines */}
              <div className="absolute inset-x-0 top-2 bottom-[32px] flex flex-col justify-between pointer-events-none opacity-20 z-0">
                {[0, 1, 2, 3].map(i => <div key={i} className="w-full border-t border-slate-600 border-dashed" />)}
              </div>
              
              {MONTHLY_USAGE.map(m => (
                <div key={m.month} className="flex flex-col items-center gap-3 relative z-10 w-full h-full group pt-2">
                  <div className="flex items-end justify-center w-full gap-1.5 flex-1 relative group-hover:opacity-100 opacity-90 transition-opacity">
                    {/* Issued Column */}
                    <div className="w-1/3 max-w-[16px] bg-slate-800 rounded-t-md relative overflow-hidden h-full">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-700 to-indigo-400 rounded-t-md transition-all duration-700 shadow-lg"
                           style={{ height: `${(m.issued/maxIssued)*100}%` }} />
                    </div>
                    {/* Returned Column */}
                    <div className="w-1/3 max-w-[16px] bg-slate-800 rounded-t-md relative overflow-hidden h-full">
                      <div className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-md transition-all duration-700 shadow-lg"
                           style={{ height: `${(m.returned/maxIssued)*100}%` }} />
                    </div>
                    
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20 pointer-events-none">
                      <p className="text-[10px] font-bold"><span className="text-indigo-400">{m.issued} Issued</span> · <span className="text-emerald-400">{m.returned} Ret</span></p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Alerts — Takes 1/3 width */}
        <div className="card-glass p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Action Required
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer flex gap-3">
              <div className="p-2 rounded-full bg-amber-500/20 text-amber-400 h-fit"><BookMarked className="w-4 h-4" /></div>
              <div>
                <p className="text-sm text-white font-bold">15 Pending Reservations</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Users are waiting for books that have been recently returned.</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer flex gap-3">
              <div className="p-2 rounded-full bg-red-500/20 text-red-400 h-fit"><Ban className="w-4 h-4" /></div>
              <div>
                <p className="text-sm text-white font-bold">42 Suspended Accounts</p>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Accounts automatically suspended due to unpaid fines exceeding ₹500.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-bold">Database Backup</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">Due Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="card-glass p-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-white" /> Most Borrowed Categories
          </h3>
          <div className="space-y-4">
            {POPULAR_CATEGORIES.map((cat, idx) => {
              const max = Math.max(...POPULAR_CATEGORIES.map(c => c.count));
              const pct = (cat.count / max) * 100;
              return (
                <div key={cat.name} className="relative group">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                    <span className="group-hover:text-white transition-colors">{idx + 1}. {cat.name}</span>
                    <span className="text-slate-300">{cat.count} loans</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-400 to-slate-200 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-glass p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-red-500 tracking-wider flex items-center gap-2">
              <span className="text-red-500 animate-pulse text-base leading-none">●</span> Live Activity
            </h3>
            <button 
              onClick={() => setActiveTab('logs')}
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
                <div key={log.id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors relative">
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ logs }) {
  const [timeframe, setTimeframe] = useState('30 Days');
  const [activeDonut, setActiveDonut] = useState(null);

  // Timeframe Data scaling multiplier to simulate real API metrics fetching
  const tMult = timeframe === 'Last 7 Days' ? 0.25 : timeframe === '30 Days' ? 1 : 12;

  // Filter logs within timeframe
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    let limit = Infinity;
    if (timeframe === 'Last 7 Days') {
      limit = 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe === '30 Days') {
      limit = 30 * 24 * 60 * 60 * 1000;
    }
    return (logs || []).filter(l => {
      if (!l.timestamp) return true;
      return (now - l.timestamp) <= limit;
    });
  }, [logs, timeframe]);

  // Dynamic calculations from filtered logs
  const dynamicMetrics = useMemo(() => {
    const baseIssued = Math.floor(453 * tMult);
    const baseFines = Math.floor(11820 * tMult);
    const baseReturned = Math.floor(439 * tMult);

    let logIssues = 0;
    let logFines = 0;
    let logReturns = 0;

    filteredLogs.forEach(l => {
      const action = l.action || '';
      // Count issues
      if (action.includes('Issued book') || action.includes('Student borrowed book') || action.includes('borrowed book') || action.includes('Reversed return')) {
        logIssues += 1;
      } else {
        const match = action.match(/Issued (\d+) books/);
        if (match) {
          logIssues += parseInt(match[1], 10);
        }
      }

      // Count paid fines
      if (action.includes('paid fine') || action.includes('Verified payment') || (action.includes('payment of') && !action.includes('waived') && !action.includes('rate'))) {
        const match = action.match(/₹(\d+)/);
        if (match) {
          logFines += parseInt(match[1], 10);
        }
      }

      // Count returns
      if (action.includes('Returned book') || action.includes('Student returned book') || action.includes('returned book')) {
        logReturns += 1;
      }
    });

    const totalIssued = baseIssued + logIssues;
    const totalFines = baseFines + logFines;
    const totalReturned = baseReturned + logReturns;
    const returnRate = totalIssued > 0 ? Math.min(100, Math.round((totalReturned / totalIssued) * 100)) : 0;

    // Peak Usage Slot
    const counts = { 'Wed 2PM': 3, 'Tue 10AM': 2, 'Thu 4PM': 2 };
    filteredLogs.forEach(log => {
      if (log.timestamp) {
        const d = new Date(log.timestamp);
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        const slot = `${day} ${hour}${ampm}`;
        counts[slot] = (counts[slot] || 0) + 1;
      }
    });

    let peakUsage = 'Wed 2PM';
    let maxCount = 0;
    Object.entries(counts).forEach(([slot, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        peakUsage = slot;
      }
    });

    return {
      totalIssued,
      totalFines,
      returnRate,
      peakUsage
    };
  }, [filteredLogs, tMult]);

  // Dynamic Conic Gradient elements for Donut Chart
  const inventory = useMemo(() => {
    const raw = [
      { label: 'Available', val: Math.max(10, 65 - Math.floor(tMult * 3)), color: '#3b82f6', tw: 'blue' },
      { label: 'Issued',    val: Math.min(60, 28 + Math.floor(tMult * 2.5)), color: '#94a3b8', tw: 'slate' },
      { label: 'Overdue',   val: 7 + Math.floor(tMult * 0.5), color: '#f43f5e', tw: 'rose' }
    ];
    // Normalize to 100% exactly
    const total = raw.reduce((sum, item) => sum + item.val, 0);
    return raw.map(r => ({ ...r, val: Math.round((r.val / total) * 100) }));
  }, [tMult]);

  // Simulated Time-Series DB query
  const growthData = useMemo(() => {
    if (timeframe === 'Last 7 Days') {
      return [
        { label: 'Mon', active: 120, new: 18 }, { label: 'Tue', active: 155, new: 22 },
        { label: 'Wed', active: 135, new: 10 }, { label: 'Thu', active: 180, new: 30 },
        { label: 'Fri', active: 210, new: 45 }, { label: 'Sat', active: 260, new: 60 },
        { label: 'Sun', active: 190, new: 15 }
      ];
    }
    if (timeframe === '30 Days') {
      return [
        { label: 'Week 1', active: 460, new: 85 }, { label: 'Week 2', active: 540, new: 125 },
        { label: 'Week 3', active: 510, new: 65 }, { label: 'Week 4', active: 650, new: 160 },
      ];
    }
    return USER_GROWTH.map(m => ({ label: m.month, ...m }));
  }, [timeframe]);

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-16">
      
      {/* Hyper-Premium Header */}
      <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-white/10 via-slate-500/10 to-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
        <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Subtle background glow inside header */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-24 bg-slate-800/10 blur-[100px] pointer-events-none" />
          
          <div className="flex gap-4 items-center pl-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-slate-300 flex items-center justify-center shadow-lg border border-white/20">
              <Activity className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Analysis</h2>
            </div>
          </div>
          
          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
            {['Last 7 Days', '30 Days', 'All Time'].map(t => (
              <button key={t} onClick={() => setTimeframe(t)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  timeframe === t 
                  ? 'bg-slate-800 text-white shadow-lg border border-white/10 scale-100' 
                  : 'text-slate-500 hover:text-slate-300 scale-95 hover:scale-100'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Nano-Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Gross Revenue', value: `₹${dynamicMetrics.totalFines.toLocaleString()}`, trend: '+14.2%', icon: Zap,      c1: 'from-emerald-500/20', c2: 'to-emerald-900/5', color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Circulation',   value: dynamicMetrics.totalIssued.toLocaleString(),      trend: '+8.5%',  icon: Hash,     c1: 'from-blue-500/20',     c2: 'to-blue-900/5',    color: 'text-blue-400',    border: 'border-blue-500/20' },
          { label: 'Return Rate',   value: `${dynamicMetrics.returnRate}%`, trend: '-1.2%', icon: RotateCcw, c1: 'from-slate-500/20',   c2: 'to-slate-900/5',  color: 'text-slate-300',  border: 'border-slate-500/20' },
          { label: 'Peak Usage',    value: dynamicMetrics.peakUsage,                         trend: 'High',   icon: Activity, c1: 'from-rose-500/20',     c2: 'to-rose-900/5',    color: 'text-rose-400',    border: 'border-rose-500/20' }
        ].map((s, i) => (
          <div key={i} className={`relative group rounded-3xl bg-slate-900/40 border ${s.border} backdrop-blur-md p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-${s.color.split('-')[1]}-500/10 transition-all duration-500 overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.c1} ${s.c2} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${s.c1} opacity-30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-slate-950/50 backdrop-blur-md border border-white/5`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-950/50 backdrop-blur-md border border-white/5 ${s.color}`}>
                {s.trend}
              </span>
            </div>
            
            <div className="relative z-10 mt-5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className="text-3xl font-black text-white mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* The Hero Chart: User Growth Trends (Replaced SVG with clean Bar Chart) */}
        <div className="lg:col-span-2 relative p-[1px] rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent group">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="bg-slate-950/80 backdrop-blur-xl rounded-3xl p-7 h-full border border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">User Base Engagement</h3>
                <p className="text-xs text-slate-500 font-medium">Monthly active users versus new registrations.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"><div className="w-2.5 h-2.5 rounded bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" /><span className="text-[10px] font-bold text-slate-400 uppercase">Active Users</span></div>
                <div className="flex items-center gap-2 px-3 py-1 hover:bg-slate-800 rounded-lg transition-colors"><div className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" /><span className="text-[10px] font-bold text-slate-400 uppercase">New Signups</span></div>
              </div>
            </div>

            <div className="h-[280px] w-full relative flex mt-4">
              {/* Y Axis Grid Labels */}
              <div className="flex flex-col justify-between items-end pr-4 text-[10px] text-slate-500 font-bold opacity-60 pb-8 pt-1 shrink-0">
                 <span>800</span>
                 <span>500</span>
                 <span>200</span>
                 <span>0</span>
               </div>
               
               {/* Main Chart Area */}
               <div className="flex-1 relative flex items-end justify-around pl-2">
                 {/* Background Dashed Grid */}
                 <div className="absolute inset-x-0 top-2 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
                    {[0,1,2,3].map(i => <div key={i} className="border-t border-slate-500 border-dashed w-full" />)}
                 </div>
                 
                 {growthData.map(m => {
                    const maxVal = Math.max(...growthData.map(d => d.active)) * 1.3; // Dynamic Y-Axis scale
                    const activePct = (m.active / maxVal) * 100;
                    const newPct = (m.new / maxVal) * 100;
                    return (
                      <div key={m.label} className="flex flex-col items-center gap-3 relative z-10 w-full h-full group pt-2">
                         <div className="flex items-end justify-center w-full gap-2 flex-1 relative opacity-80 group-hover:opacity-100 transition-opacity">
                           
                           {/* Active Users Column */}
                           <div className="w-full max-w-[20px] bg-slate-800/80 rounded-t-xl relative overflow-hidden h-full border border-b-0 border-white/5">
                             <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl transition-all duration-700 shadow-lg group-hover:from-blue-500 group-hover:to-blue-300"
                                  style={{ height: `${activePct}%` }} />
                           </div>
                           
                           {/* New Signups Column */}
                           <div className="w-full max-w-[20px] bg-slate-800/80 rounded-t-xl relative overflow-hidden h-full border border-b-0 border-white/5">
                             <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-xl transition-all duration-700 shadow-lg group-hover:from-slate-500 group-hover:to-slate-300"
                                  style={{ height: `${newPct}%` }} />
                           </div>

                           {/* Interactive Tooltip Component */}
                           <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700/50 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl z-20 pointer-events-none flex gap-3 backdrop-blur-md">
                             <span className="text-[10px] font-black text-blue-400">{m.active.toLocaleString()} ACTIVE</span>
                             <span className="text-[10px] border-l border-white/10 pl-3 font-black text-indigo-400">+{m.new.toLocaleString()} NEW</span>
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

        {/* Global Inventory Status (Interactive SVG Donut) */}
        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col">
          <div>
             <h3 className="text-lg font-black text-white tracking-tight">Global Inventory</h3>
             <p className="text-xs text-slate-500 font-medium">Hover parts to view specific sector allocation.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center pt-6">
            <div className="relative w-52 h-52">
              {/* Interactive SVG Chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-2xl">
                {/* Background Track */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                
                {(() => {
                  const r = 40;
                  const c = 2 * Math.PI * r;
                  let accum = 0;
                  return inventory.map((item, idx) => {
                    const strokeDashoffset = c - (item.val / 100) * c;
                    const rotation = (accum / 100) * 360;
                    accum += item.val;
                    const isActive = activeDonut === idx;
                    
                    return (
                      <circle
                        key={item.label}
                        cx="50" cy="50" r={r}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={isActive ? "16" : "12"}
                        strokeDasharray={c}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${rotation} 50 50)`}
                        className={`transition-all duration-300 cursor-crosshair outline-none ${isActive ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] z-20 relative' : 'opacity-80'}`}
                        onMouseEnter={() => setActiveDonut(idx)}
                        onMouseLeave={() => setActiveDonut(null)}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Default State (Visible when nothing is hovered) */}
                <div className={`transition-all duration-300 flex flex-col items-center absolute ${activeDonut === null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                   <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase mb-0.5">Total Books</span>
                   <span className="text-3xl font-black text-white">42.5k</span>
                   <span className="text-[9px] text-emerald-400 font-bold mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Operational</span>
                </div>

                {/* Hover States */}
                {inventory.map((item, idx) => (
                  <div key={'center'+idx} className={`transition-all duration-300 flex flex-col items-center absolute w-full px-4 text-center ${activeDonut === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                     <span className="text-[10px] font-black tracking-widest uppercase mb-1 drop-shadow-md" style={{ color: item.color }}>{item.label}</span>
                     <span className="text-4xl font-black text-white drop-shadow-lg">{item.val}%</span>
                     <span className="text-[10px] text-slate-300 font-bold mt-1">{(42500 * (item.val/100)).toLocaleString()} Items</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-2">
              {inventory.map((item, idx) => (
                <div key={item.label} 
                     onMouseEnter={() => setActiveDonut(idx)}
                     onMouseLeave={() => setActiveDonut(null)}
                     className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${activeDonut === idx ? 'bg-slate-800/80 border-white/10 scale-105 shadow-xl' : 'bg-transparent border-transparent scale-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}30` }}>
                      <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                    </div>
                    <span className={`text-xs font-bold transition-colors ${activeDonut === idx ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black transition-colors ${activeDonut === idx ? 'text-white' : 'text-slate-500'}`}>{item.val}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Peak Traffic Heatmap (Replaces the uninformative GitHub grid) */}
        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800">
           <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-lg font-black text-white tracking-tight">Peak Traffic Heatmap</h3>
               <p className="text-xs text-slate-500 font-medium">Library footfall by Day and Time.</p>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Quiet</span>
                <div className="flex gap-1 border border-white/5 p-1 rounded-md bg-slate-900/50">
                  {['#1e293b', '#4f46e5', '#7c3aed', '#d946ef'].map(c => <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
                </div>
                <span className="text-[10px] font-bold text-slate-500">Busy</span>
             </div>
           </div>
           
           <div className="w-full flex gap-4 mt-2">
             {/* Y-Axis: Days */}
             <div className="flex flex-col justify-between text-[10px] font-bold text-slate-500 uppercase pb-6 pt-1">
               {['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <span key={d} className="h-6 flex items-center">{d}</span>)}
             </div>
             
             {/* The Matrix */}
             <div className="flex-1">
               <div className="grid grid-rows-6 gap-2">
                 {[
                   [30, 45, 80, 50, 95, 30],
                   [15, 50, 75, 45, 85, 25],
                   [40, 60, 90, 55, 110, 40],
                   [25, 55, 85, 48, 100, 35],
                   [35, 70, 110, 65, 140, 50],
                   [50, 105, 130, 90, 60, 20]
                 ].map((row, rIdx) => (
                   <div key={rIdx} className="grid grid-cols-6 gap-2">
                     {row.map((val, cIdx) => {
                       // Color logic based on volume
                       let bgClass = 'bg-slate-800';
                       if(val > 105) bgClass = 'bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.4)]';
                       else if(val > 75) bgClass = 'bg-violet-600';
                       else if(val > 45) bgClass = 'bg-indigo-600';

                       const day = ['Mon','Tue','Wed','Thu','Fri','Sat'][rIdx];
                       const time = ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'][cIdx];

                       return (
                         <div key={cIdx} className={`h-6 rounded-md relative group cursor-crosshair transition-all duration-300 hover:scale-110 ${bgClass}`}>
                           {/* Data Tooltip Overlay */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 bg-slate-950 border border-slate-700/50 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 pointer-events-none flex flex-col items-center min-w-[100px] backdrop-blur-md">
                             <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-950 border-b border-r border-slate-700/50 rotate-45" />
                             <span className="text-[10px] text-slate-400 font-bold uppercase relative z-10">{day}, {time}</span>
                             <span className="text-sm font-black text-white relative z-10">{val} <span className="text-[9px] text-slate-500 font-bold">Visitors</span></span>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ))}
               </div>
               
               {/* X-Axis: Times */}
               <div className="grid grid-cols-6 gap-2 mt-3">
                 {['9 AM', '11 AM', '1 PM', '3 PM', '5 PM', '7 PM'].map(t => (
                   <span key={t} className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-tight">{t}</span>
                 ))}
               </div>
             </div>
           </div>
        </div>

        {/* Dept Debt Stacked Bar */}
        <div className="card-glass p-7 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Dept. Liability Index</h3>
              <p className="text-xs text-slate-500 font-medium">Active loans vs overdue items mapped by department.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded shadow-[0_0_8px_rgba(99,102,241,0.5)]" /><span className="text-[10px] text-slate-400 font-bold">Good Standing</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500 rounded shadow-[0_0_8px_rgba(244,63,94,0.5)]" /><span className="text-[10px] text-slate-400 font-bold">Overdue / Debt</span></div>
            </div>
          </div>

          <div className="space-y-6">
            {DEPT_STATS.map((d, idx) => {
              const globalMax = Math.max(...DEPT_STATS.map(x => x.active + x.overdue));
              const activePct = (d.active / globalMax) * 100;
              const overduePct = (d.overdue / globalMax) * 100;

              return (
                <div key={d.dept} className="relative group">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                    <span className="group-hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-[10px] text-slate-600">0{idx+1}</span> {d.dept}
                    </span>
                    <span className="text-white font-black">{d.active + d.overdue} <span className="text-[10px] text-slate-600 font-medium ml-1">ITEMS</span></span>
                  </div>
                  
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-white/5 shadow-inner group-hover:scale-y-[1.2] transition-transform origin-left">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 border-r border-slate-900" style={{ width: `${activePct}%` }} />
                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400" style={{ width: `${overduePct}%` }} />
                  </div>
                  
                  {/* Floating tooltip */}
                  <div className="absolute right-0 -top-8 bg-slate-800 border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-2xl z-20 pointer-events-none flex gap-3 backdrop-blur-xl">
                    <span className="text-[10px] font-black text-indigo-400">{d.active} ACTIVE</span>
                    <span className="text-[10px] border-l border-white/10 pl-3 font-black text-rose-400">{d.overdue} OVERDUE</span>
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

// ─── Roles Tab ────────────────────────────────────────────────────────────────
function RolesTab({ librarians, setLibrarians, onNotify, addLog }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Librarian' });

  const roleColors = { 'Head Librarian': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', 'Librarian': 'text-blue-400 bg-blue-500/10 border-blue-500/30' };

  const handleAdd = (e) => {
    e.preventDefault();
    const newLib = { id: `L00${librarians.length + 1}`, name: form.name, email: form.email, role: form.role, status: 'Active' };
    setLibrarians([...librarians, newLib]);
    setShowAddModal(false);
    setForm({ name: '', email: '', role: 'Librarian' });
    if (onNotify) onNotify(`Librarian ${form.name} added successfully.`);
    if (addLog) addLog(`Added new librarian ${form.name} (${form.role})`, 'success', 'Admin');
  };

  const handleRemove = (id) => {
    const target = librarians.find(l => l.id === id);
    setLibrarians(librarians.filter(l => l.id !== id));
    if (onNotify) onNotify(`${target?.name} has been removed from the system.`);
    if (addLog) addLog(`Removed librarian ${target?.name} (${target?.role})`, 'warning', 'Admin');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Role Management</h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary"><UserPlus className="w-4 h-4" /> Add Librarian</button>
      </div>

      {/* System Roles Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_ROLES.map(r => (
          <div key={r.id} className={`card-glass p-4 border-t-2 border-${r.color}-500`}>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{r.name}</p>
            <p className={`text-2xl font-black text-${r.color}-400`}>{r.users}</p>
            <p className="text-xs text-slate-500 mt-1">{r.users === 1 ? 'user' : 'users'}</p>
          </div>
        ))}
      </div>

      {/* Librarians Table */}
      <div className="card-glass overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className="border-b border-white/10 bg-slate-800/50">
            {['Admin ID', 'Name', 'Email', 'Role', 'Status', 'Actions'].map(h =>
              <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
            )}
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {librarians.map(lib => (
              <tr key={lib.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-indigo-400 text-sm">{lib.id}</td>
                <td className="p-4 font-bold text-white text-sm">{lib.name}</td>
                <td className="p-4 text-slate-400 text-sm">{lib.email}</td>
                <td className="p-4">
                  <span className={`badge border text-xs ${roleColors[lib.role] || 'text-slate-400 bg-slate-500/10 border-slate-500/30'}`}>{lib.role}</span>
                </td>
                <td className="p-4">
                  <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{lib.status}</span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleRemove(lib.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <input required type="text" placeholder="e.g. Riya Kumar" className="input-field" onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input required type="email" placeholder="e.g. riya@library.edu" className="input-field" onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Assign Role</label>
                <GlassSelect
                  value={form.role}
                  onChange={v => setForm({...form, role: v})}
                  options={['Librarian', 'Head Librarian']}
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3">Add to System</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ settings, setSettings, onNotify, darkMode, setDarkMode, addLog }) {
  const [localSettings, setLocalSettings] = useState({ ...settings });

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();

    const fieldNames = {
      fineRate: 'Fine rate',
      maxBooksStudent: 'Max books for students',
      maxBooksFaculty: 'Max books for faculty',
      borrowDurationStudent: 'Borrow duration for students',
      borrowDurationFaculty: 'Borrow duration for faculty',
      globalMaxBooks: 'Global max books limit',
      reservationExpiry: 'Reservation expiry duration',
    };

    const changes = [];
    Object.keys(localSettings).forEach(key => {
      const prevVal = settings[key];
      const newVal = localSettings[key];
      if (String(prevVal) !== String(newVal)) {
        const fieldName = fieldNames[key] || key;
        let changeText = '';
        if (key === 'fineRate') {
          changeText = `Updated ${fieldName} from ₹${prevVal}/day to ₹${newVal}/day`;
        } else if (key.includes('Duration') || key.includes('Expiry')) {
          changeText = `Updated ${fieldName} from ${prevVal} days to ${newVal} days`;
        } else {
          changeText = `Updated ${fieldName} from ${prevVal} to ${newVal}`;
        }
        changes.push(changeText);
      }
    });

    if (changes.length > 0) {
      setSettings({ ...localSettings });
      changes.forEach(changeText => {
        if (addLog) addLog(changeText, 'info', 'Admin');
      });
      if (onNotify) onNotify(`Successfully updated ${changes.length} setting(s).`);
    } else {
      if (onNotify) onNotify('No settings were changed.', 'info');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">System Settings</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-4xl">
        {/* Fine Settings */}
        <div className="card-glass p-4 space-y-3 border-l-4 border-red-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" /> Fines & Penalties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Fine Per Day (₹)</label>
              <input type="number" min="1" value={localSettings.fineRate}
                onChange={e => setLocalSettings({...localSettings, fineRate: e.target.value})}
                className="input-field py-2" />
            </div>
          </div>
        </div>

        {/* Borrow Limits */}
        <div className="card-glass p-4 space-y-3 border-l-4 border-indigo-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-400" /> Borrow Limits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Max Books — Student</label>
              <input type="number" min="1" value={localSettings.maxBooksStudent}
                onChange={e => setLocalSettings({...localSettings, maxBooksStudent: e.target.value})}
                className="input-field py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Max Books — Faculty</label>
              <input type="number" min="1" value={localSettings.maxBooksFaculty}
                onChange={e => setLocalSettings({...localSettings, maxBooksFaculty: e.target.value})}
                className="input-field py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Borrow Duration — Student (Days)</label>
              <input type="number" min="1" value={localSettings.borrowDurationStudent}
                onChange={e => setLocalSettings({...localSettings, borrowDurationStudent: e.target.value})}
                className="input-field py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Borrow Duration — Faculty (Days)</label>
              <input type="number" min="1" value={localSettings.borrowDurationFaculty}
                onChange={e => setLocalSettings({...localSettings, borrowDurationFaculty: e.target.value})}
                className="input-field py-2" />
            </div>
          </div>
        </div>

        {/* System Config */}
        <div className="card-glass p-4 space-y-3 border-l-4 border-emerald-500">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> System Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Global Max Books</label>
              <input type="number" min="1" value={localSettings.globalMaxBooks || 20}
                onChange={e => setLocalSettings({...localSettings, globalMaxBooks: e.target.value})}
                className="input-field py-2" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1 uppercase tracking-widest">Reservation Expiry (Days)</label>
              <input type="number" min="1" value={localSettings.reservationExpiry || 7}
                onChange={e => setLocalSettings({...localSettings, reservationExpiry: e.target.value})}
                className="input-field py-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary py-3 px-8 text-base">
            <CheckCircle className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
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

// ─── Users Management Tab ────────────────────────────────────────────────────
function UsersManagementTab({ students, setStudents, faculty, setFaculty, onNotify, addLog }) {
  const [userType, setUserType]       = useState('students');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter]   = useState('All');
  const [selected, setSelected]       = useState(null);   // for detail drawer
  const [editTarget, setEditTarget]   = useState(null);   // for edit modal
  const [showAdd, setShowAdd]         = useState(false);
  const [addForm, setAddForm]         = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);

  const data     = userType === 'students' ? students : faculty;
  const setData  = userType === 'students' ? setStudents : setFaculty;

  // ── All departments across both lists for filter
  const allDepts = [...new Set(data.map(u => u.dept))];

  // ── Filtered list
  const filtered = data.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchDept   = deptFilter   === 'All' || u.dept   === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  // ── Stats
  const active    = data.filter(u => u.status === 'Active').length;
  const suspended = data.filter(u => u.status === 'Suspended').length;
  const withFines = data.filter(u => u.finesPending > 0).length;
  const totalFines= data.reduce((a, u) => a + u.finesPending, 0);

  // ── Actions
  const toggleStatus = (id) => {
    setData(data.map(u => {
      if (u.id !== id) return u;
      const next = u.status === 'Active' ? 'Suspended' : 'Active';
      if (onNotify) onNotify(`${u.name} status changed to ${next}.`);
      if (addLog) addLog(`Changed status of user ${u.name} (${u.id}) to ${next}`, next === 'Active' ? 'success' : 'warning', 'Admin');
      return { ...u, status: next };
    }));
    if (selected?.id === id) setSelected(s => ({ ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' }));
  };

  const deleteUser = (id) => {
    const u = data.find(x => x.id === id);
    if (u.booksIssued > 0) { 
      if (onNotify) onNotify('Cannot delete — user has active loans.', 'error');
      else alert('Cannot delete — user has active loans.'); 
      return; 
    }
    setConfirmDelete(u);
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const u = confirmDelete;
    setRecentlyDeleted({ ...u, type: userType });
    setData(data.filter(x => x.id !== u.id));
    if (selected?.id === u.id) setSelected(null);
    setConfirmDelete(null);
    if (onNotify) onNotify(`${u.name} removed from system.`);
    if (addLog) addLog(`Deleted user ${u.name} (${u.id})`, 'error', 'Admin');
  };

  const handleUndo = () => {
    if (!recentlyDeleted) return;
    const { type, ...userData } = recentlyDeleted;
    if (type === 'students') setStudents(prev => [...prev, userData]);
    else setFaculty(prev => [...prev, userData]);
    setRecentlyDeleted(null);
    if (onNotify) onNotify(`${userData.name} restored successfully.`);
    if (addLog) addLog(`Restored user ${userData.name} (${userData.id})`, 'success', 'Admin');
  };

  const waiveFine = (id) => {
    const u = data.find(x => x.id === id);
    setData(data.map(u => u.id === id ? { ...u, finesPending: 0 } : u));
    if (selected?.id === id) setSelected(s => ({ ...s, finesPending: 0 }));
    if (onNotify) onNotify('Pending fine waived successfully.');
    if (addLog) addLog(`Waived fine for user ${u?.name} (${u?.id})`, 'success', 'Admin');
  };

  const saveEdit = (e) => {
    e.preventDefault();
    setData(data.map(u => u.id === editTarget.id ? { ...editTarget } : u));
    if (selected?.id === editTarget.id) setSelected({ ...editTarget });
    setEditTarget(null);
    if (onNotify) onNotify('User details updated successfully.');
    if (addLog) addLog(`Updated details for user ${editTarget.name} (${editTarget.id})`, 'info', 'Admin');
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const prefix = userType === 'students' ? 'STU' : 'FAC';
    const newId  = `${prefix}${String(data.length + 1).padStart(3, '0')}`;
    const newUser = {
      id: newId, status: 'Active', booksIssued: 0, finesPending: 0, finesTotal: 0, loans: [],
      ...addForm,
    };
    setData([...data, newUser]);
    setShowAdd(false);
    setAddForm({});
    if (onNotify) onNotify(`${newUser.name} added successfully.`);
    if (addLog) addLog(`Registered new user ${newUser.name} (${newId})`, 'success', 'Admin');
  };

  const statusBadge = (s) => s === 'Active'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-red-500/10 border-red-500/30 text-red-400';

  // ── Field definitions for add/edit form
  const studentFields = [
    { key: 'name',  label: 'Full Name',   type: 'text',  ph: 'e.g. John Doe'         },
    { key: 'email', label: 'Email',       type: 'email', ph: 'student@college.edu'   },
    { key: 'phone', label: 'Phone',       type: 'text',  ph: '9876543210'            },
    { key: 'dept',  label: 'Department',  type: 'text',  ph: 'e.g. Computer Science' },
    { key: 'year',  label: 'Year',        type: 'text',  ph: 'e.g. 2nd Year'         },
    { key: 'joinDate', label: 'Join Date', type: 'date', ph: ''                      },
  ];
  const facultyFields = [
    { key: 'name',        label: 'Full Name',    type: 'text',  ph: 'e.g. Dr. Ramesh Kumar' },
    { key: 'email',       label: 'Email',        type: 'email', ph: 'faculty@college.edu'   },
    { key: 'phone',       label: 'Phone',        type: 'text',  ph: '9811223344'            },
    { key: 'dept',        label: 'Department',   type: 'text',  ph: 'e.g. Computer Science' },
    { key: 'designation', label: 'Designation',  type: 'text',  ph: 'e.g. Professor'        },
    { key: 'joinDate',    label: 'Join Date',    type: 'date',  ph: ''                      },
  ];
  const formFields = userType === 'students' ? studentFields : facultyFields;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title mb-0">User Management</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add {userType === 'students' ? 'Student' : 'Faculty'}
        </button>
      </div>

      {/* Student / Faculty Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setUserType('students'); setSelected(null); setSearch(''); setStatusFilter('All'); setDeptFilter('All'); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all
            ${userType === 'students' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <GraduationCap className="w-4 h-4" /> Students
        </button>
        <button onClick={() => { setUserType('faculty'); setSelected(null); setSearch(''); setStatusFilter('All'); setDeptFilter('All'); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all
            ${userType === 'faculty' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
          <Briefcase className="w-4 h-4" /> Faculty
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',          value: data.length, color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
          { label: 'Active',         value: active,      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Suspended',      value: suspended,   color: 'text-red-400',     bg: 'bg-red-500/10'     },
          { label: 'Fines Pending',  value: `₹${totalFines}`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className={`card-glass p-5 text-center border border-white/5 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card-glass p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-800/60 rounded-xl px-3 py-2 border border-white/5">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or email…"
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none flex-1" />
        </div>
        <GlassSelect
          value={statusFilter}
          onChange={v => setStatusFilter(v)}
          options={['All', 'Active', 'Suspended']}
          className="w-36"
        />
        <GlassSelect
          value={deptFilter}
          onChange={v => setDeptFilter(v)}
          options={['All', ...allDepts]}
          className="w-48"
        />
        <button onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All'); }}
          className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors">
          Reset
        </button>
        {recentlyDeleted && (
          <button onClick={handleUndo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 rounded-xl border border-indigo-500/30 transition-all animate-pulse-subtle">
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
        )}
      </div>

      {/* Main Layout: Table + Detail Drawer */}
      <div className="flex gap-5">
        {/* Table */}
        <div className={`card-glass overflow-x-auto transition-all duration-300 ${selected ? 'flex-1' : 'w-full'}`}>
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 bg-slate-800/50">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Dept</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">{userType === 'students' ? 'Year' : 'Designation'}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fines</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No records match your search.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}
                  onClick={() => setSelected(u)}
                  className={`hover:bg-white/5 transition-colors cursor-pointer ${
                    selected?.id === u.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''
                  }`}>
                  <td className="p-4 font-mono text-indigo-400 text-xs">{u.id}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-400 hidden md:table-cell">{u.dept}</td>
                  <td className="p-4 text-sm text-slate-400 hidden lg:table-cell">{userType === 'students' ? u.year : u.designation}</td>
                  <td className="p-4">
                    <span className={`badge border text-xs ${statusBadge(u.status)}`}>{u.status}</span>
                  </td>
                  <td className="p-4 text-sm font-bold">
                    {u.finesPending > 0
                      ? <span className="text-red-400">₹{u.finesPending}</span>
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditTarget({ ...u })} title="Edit"
                        className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => toggleStatus(u.id)} title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'Active'
                            ? 'text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500'
                            : 'text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500'
                        }`}>
                        {u.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} title="Delete"
                        className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className="w-80 shrink-0 card-glass p-5 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Profile</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 py-3 border-y border-white/10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${
                userType === 'students' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {selected.name.charAt(0)}
              </div>
              <p className="text-base font-bold text-white">{selected.name}</p>
              <span className={`badge border text-xs ${statusBadge(selected.status)}`}>{selected.status}</span>
            </div>

            {/* Info Grid */}
            <div className="space-y-2 text-sm">
              {[
                { icon: Hash,      label: 'ID',         value: selected.id          },
                { icon: Mail,      label: 'Email',      value: selected.email       },
                { icon: Phone,     label: 'Phone',      value: selected.phone       },
                { icon: Database,  label: 'Department', value: selected.dept        },
                ...(userType === 'students'
                  ? [{ icon: GraduationCap, label: 'Year', value: selected.year }]
                  : [{ icon: Briefcase, label: 'Designation', value: selected.designation }]
                ),
                { icon: Calendar, label: 'Joined', value: selected.joinDate },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <row.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{row.label}</p>
                    <p className="text-slate-200 font-semibold truncate">{row.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fines */}
            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fines</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending</span>
                <span className={selected.finesPending > 0 ? 'text-red-400 font-black' : 'text-slate-500'}>₹{selected.finesPending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Paid</span>
                <span className="text-emerald-400 font-bold">₹{selected.finesTotal}</span>
              </div>
              {selected.finesPending > 0 && (
                <button onClick={() => waiveFine(selected.id)}
                  className="w-full mt-2 py-1.5 text-xs font-bold rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition-colors">
                  Waive Pending Fine
                </button>
              )}
            </div>

            {/* Active Loans */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Loan History ({selected.loans.length})
              </p>
              {selected.loans.length === 0 && <p className="text-xs text-slate-600">No loans on record.</p>}
              <div className="space-y-2">
                {selected.loans.map((loan, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs border ${
                    loan.status === 'overdue' ? 'bg-red-500/10 border-red-500/20' :
                    loan.status === 'active'  ? 'bg-indigo-500/10 border-indigo-500/20' :
                    'bg-slate-800/50 border-white/5'
                  }`}>
                    <BookOpen className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">{loan.book}</p>
                      <p className={`font-semibold ${
                        loan.status === 'overdue' ? 'text-red-400' :
                        loan.status === 'active' ? 'text-indigo-400' : 'text-emerald-400'
                      }`}>{loan.status === 'returned' ? '✓ Returned' : `Due: ${loan.due}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <button onClick={() => setEditTarget({ ...selected })}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={() => toggleStatus(selected.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl border transition-colors ${
                  selected.status === 'Active'
                    ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}>
                {selected.status === 'Active' ? <><Ban className="w-4 h-4" /> Suspend Account</> : <><Unlock className="w-4 h-4" /> Activate Account</>}
              </button>
              <button onClick={() => deleteUser(selected.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" /> Remove User
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-5">
              Edit {userType === 'students' ? 'Student' : 'Faculty'}: {editTarget.name}
            </h3>
            <form onSubmit={saveEdit} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} required placeholder={f.ph} className="input-field"
                    value={editTarget[f.key] || ''}
                    onChange={e => setEditTarget({ ...editTarget, [f.key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                <GlassSelect
                  value={editTarget.status}
                  onChange={v => setEditTarget({ ...editTarget, status: v })}
                  options={['Active', 'Suspended']}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center py-3">
                  <CheckCircle className="w-4 h-4" /> Save Changes
                </button>
                <button type="button" onClick={() => setEditTarget(null)}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400">
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold text-white mb-5">
              Add New {userType === 'students' ? 'Student' : 'Faculty Member'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              {formFields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">{f.label}</label>
                  <input type={f.type} required placeholder={f.ph} className="input-field"
                    value={addForm[f.key] || ''}
                    onChange={e => setAddForm({ ...addForm, [f.key]: e.target.value })} />
                </div>
              ))}
              <button type="submit" className="btn-primary w-full justify-center py-3 mt-2">
                <UserPlus className="w-4 h-4" /> Add {userType === 'students' ? 'Student' : 'Faculty'}
              </button>
            </form>
          </div>
        </div>
      )}

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
                  onClick={handleConfirmDelete}
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

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ user, onNotify }) {
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [librarians, setLibrarians] = useState(MOCK_LIBRARIANS);
  const [students, setStudents]     = useState(MOCK_STUDENTS);
  const [faculty, setFaculty]       = useState(MOCK_FACULTY);
  const [darkMode, setDarkMode]     = useState(true);
  const [settings, setSettings]     = useState({
    fineRate: 10,
    maxBooksStudent: 5,
    maxBooksFaculty: 15,
    borrowDurationStudent: 14,
    borrowDurationFaculty: 30,
    globalMaxBooks: 20,
    reservationExpiry: 7,
  });

  const [logs, setLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_audit_logs');
      return stored ? JSON.parse(stored) : MOCK_LOGS.map((l, i) => ({ ...l, timestamp: Date.now() - (i * 3600 * 1000) }));
    } catch {
      return MOCK_LOGS.map((l, i) => ({ ...l, timestamp: Date.now() - (i * 3600 * 1000) }));
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

  useEffect(() => {
    window.addEventListener('storage', syncLogs);
    window.addEventListener('storage_updated', syncLogs);
    return () => {
      window.removeEventListener('storage', syncLogs);
      window.removeEventListener('storage_updated', syncLogs);
    };
  }, []);

  const addLog = (action, level = 'info', user = 'System') => {
    addAuditLog(action, level, user);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab librarians={librarians} darkMode={darkMode} logs={logs} setActiveTab={setActiveTab} />;
      case 'analytics': return <AnalyticsTab logs={logs} />;
      case 'users':     return <UsersManagementTab students={students} setStudents={setStudents} faculty={faculty} setFaculty={setFaculty} onNotify={onNotify} addLog={addLog} />;
      case 'roles':     return <RolesTab librarians={librarians} setLibrarians={setLibrarians} onNotify={onNotify} addLog={addLog} />;
      case 'settings':  return <SettingsTab settings={settings} setSettings={setSettings} onNotify={onNotify} darkMode={darkMode} setDarkMode={setDarkMode} addLog={addLog} />;
      case 'logs':      return <LogsTab logs={logs} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden page-enter transition-all duration-700 bg-slate-950 text-white">
        {/* Premium Glass Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/5 bg-slate-950/40 backdrop-blur-2xl overflow-y-auto custom-scrollbar shadow-2xl z-20">
        
        {/* Subtle glowing orb in the corner */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="fixed top-20 -left-10 w-40 h-40 bg-slate-800/10 blur-[80px] pointer-events-none" />

        <div className="p-5 relative z-10">
          <div className="mb-8 px-2 pt-3">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
              Admin Portal
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Control</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
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

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
