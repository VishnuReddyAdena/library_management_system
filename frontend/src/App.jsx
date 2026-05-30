import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Home      from './components/Home';
import Catalogs  from './components/Catalogs';
import Profile   from './components/Profile';
import Pricing   from './components/Pricing';
import Auth      from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard   from './components/AdminDashboard';
import LibrarianDashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import { BookOpen, UserCircle, LogOut, Menu, X, AlertCircle, ShieldAlert } from 'lucide-react';

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/',          label: 'Home'      },
  { to: '/catalogs',  label: 'Catalogs'  },
  { to: '/pricing',   label: 'Pricing'   },
];

function Navbar({ user, onLogout }) {
  const location   = useLocation();
  const [open, setOpen] = useState(false);
  const isAuth = !!user;

  // hide navbar on full-screen auth page
  if (location.pathname === '/auth') return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-white to-slate-300 rounded-lg flex items-center justify-center shadow-md">
            <BookOpen className="w-4.5 h-4.5 text-slate-950 w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Library<span className="text-slate-300">OS</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={active ? 'nav-link-active' : 'nav-link'}
              >
                {l.label}
              </Link>
            );
          })}
          {isAuth && (
            <Link to="/dashboard" className={location.pathname.includes('dashboard') || location.pathname.includes('-port') ? 'nav-link-active' : 'nav-link'}>
              Dashboard
            </Link>
          )}
          {isAuth && (
            <Link to="/profile" className={location.pathname === '/profile' ? 'nav-link-active' : 'nav-link'}>
              Profile
            </Link>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuth ? (
            <Link to="/auth" id="nav-signin-btn" className="btn-primary py-2">
              <UserCircle className="w-4 h-4" />Sign In
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                title="View Profile"
                className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md hover:scale-105 hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-slate-950 transition-all cursor-pointer flex-shrink-0"
              >
                {isAuth && user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile right side: avatar (if logged in) + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {isAuth && (
            <Link
              to="/profile"
              className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md flex-shrink-0"
            >
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : (user?.name?.charAt(0) || 'U')
              }
            </Link>
          )}
          <button
            className="p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-6 py-4 space-y-1">

          {/* Mobile profile row */}
          {isAuth && (
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 py-3 mb-2 border-b border-white/10"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-300 flex items-center justify-center font-bold text-slate-950 flex-shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : (user?.name?.charAt(0) || 'U')
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400">{user?.email || ''}</p>
              </div>
            </Link>
          )}

          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm font-medium rounded-xl mb-1 border ${location.pathname === l.to ? 'text-white bg-white/10 backdrop-blur-xl border-white/10 shadow-lg relative' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'} transition-all`}
            >
              {l.label}
              {location.pathname === l.to && <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />}
            </Link>
          ))}
          {isAuth && (
            <Link to="/dashboard" onClick={() => setOpen(false)} className={`block px-4 py-2.5 text-sm font-medium rounded-xl mb-1 border ${location.pathname.includes('dashboard') || location.pathname.includes('-port') ? 'text-white bg-white/10 backdrop-blur-xl border-white/10 shadow-lg relative' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'} transition-all`}>
              Dashboard
              {(location.pathname.includes('dashboard') || location.pathname.includes('-port')) && <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />}
            </Link>
          )}
          {!isAuth
            ? <Link to="/auth" onClick={() => setOpen(false)} className="block btn-primary justify-center mt-3 py-2.5">Sign In</Link>
            : <button onClick={() => { onLogout(); setOpen(false); }} className="block w-full text-left text-red-400 py-2.5 text-sm font-medium">Sign Out</button>
          }
        </div>
      )}
    </header>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onHide }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onHide, 3500);
    return () => clearTimeout(t);
  }, [message, onHide]);

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
      <div className={`${isError ? 'bg-red-600/90 shadow-red-500/30 border-red-400/30' : 'bg-emerald-600/90 shadow-emerald-500/30 border-emerald-400/30'} backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2.5 animate-bounce-once border`}>
        {isError ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {message}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ user }) {
  const location = useLocation();
  if (location.pathname === '/auth') return null;

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-white" />
          <span className="font-bold text-white text-base tracking-tight">LibraryOS</span>
        </Link>
        
        <p className="text-sm text-slate-500">
          &copy; 2025 LibraryOS. All rights reserved.
        </p>

        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/catalogs" className="hover:text-white transition-colors">Catalog</Link>
          {!user && <Link to="/auth" className="hover:text-white transition-colors">Sign In</Link>}
        </div>
      </div>
    </footer>
  );
}

// ─── Unauthorized Access Page ───────────────────────────────────────────────────
function UnauthorizedAccess({ portalName, onLogout }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[calc(100vh-64px)] bg-slate-950">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Unauthorized Access</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        You must be signed in with a {portalName} account to view the {portalName} Portal. Please sign out and log in with the correct credentials.
      </p>
      <button onClick={onLogout} className="btn-primary px-6 py-3">
        Sign Out
      </button>
    </div>
  );
}

// ─── Unified Role Dashboard removed in favor of ProtectedRoute wrappers ───

// ─── App ──────────────────────────────────────────────────────────────────────
function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      // Primary source: user_data written by Auth.jsx after JWT login
      const jwtData = localStorage.getItem('user_data');
      if (jwtData) {
        const u = JSON.parse(jwtData);
        const avatar = localStorage.getItem(u.email + '_lms_avatar');
        return avatar ? { ...u, avatar } : u;
      }
      // Fallback: legacy lms_user key
      const stored = localStorage.getItem('lms_user');
      if (!stored) return null;
      const u = JSON.parse(stored);
      const avatar = localStorage.getItem(u.email + '_lms_avatar');
      return avatar ? { ...u, avatar } : u;
    } catch { return null; }
  });
  const [toast, setToastState] = useState({ message: '', type: 'success' });
  const setToast = (message, type = 'success') => setToastState({ message, type });
  const navigate = useNavigate();

  const handleAuthSuccess = (userData) => {
    // userData is the user object from the JWT login response
    if (!userData) return;
    const avatar = localStorage.getItem(userData.email + '_lms_avatar');
    const newUser = avatar ? { ...userData, avatar } : { ...userData };

    // Keep lms_user in sync so legacy components still work
    const { avatar: _a, ...userWithoutAvatar } = newUser;
    try { localStorage.setItem('lms_user', JSON.stringify(userWithoutAvatar)); } catch { /* quota */ }
    if (newUser.name)  localStorage.setItem(newUser.email + '_lms_p_name',  newUser.name);
    if (newUser.email) localStorage.setItem(newUser.email + '_lms_p_email', newUser.email);
    if (newUser.role)  localStorage.setItem(newUser.email + '_lms_p_role',  newUser.role);

    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear all auth storage — both JWT and legacy keys
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('lms_user');
    setToast('You have been signed out.');
    navigate('/');
  };

  const handleAvatarChange = (url) => {
    setUser(prev => prev ? { ...prev, avatar: url } : prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home user={user} />} />
          <Route path="/catalogs"  element={<Catalogs user={user} onNotify={setToast} />} />

          {/* Admin Portal (System Control) */}
          <Route path="/admin-port" element={
            user ? (
              user.role === 'admin' ? 
                <AdminDashboard user={user} onNotify={setToast} /> : 
                <UnauthorizedAccess portalName="Administrator" onLogout={handleLogout} />
            ) : (
              <Auth isAdminPortal={true} onAuthSuccess={handleAuthSuccess} onNotify={setToast} />
            )
          } />

          {/* Librarian Portal (Library Operations) */}
          <Route path="/librarian-port" element={
            user ? (
              user.role === 'librarian' ? 
                <LibrarianDashboard user={user} onNotify={setToast} /> : 
                <UnauthorizedAccess portalName="Librarian" onLogout={handleLogout} />
            ) : (
              <Auth isLibrarianPortal={true} onAuthSuccess={handleAuthSuccess} onNotify={setToast} />
            )
          } />

          <Route path="/dashboard/faculty" element={<ProtectedRoute allowedRoles={['admin', 'librarian', 'faculty']}><LibrarianDashboard user={user} onNotify={setToast} /></ProtectedRoute>} />
          <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['admin', 'librarian', 'faculty', 'student']}><StudentDashboard user={user} onNotify={setToast} /></ProtectedRoute>} />

          {/* /dashboard — smart redirect to role-specific dashboard */}
          <Route path="/dashboard" element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin-port" replace /> :
              user.role === 'librarian' ? <Navigate to="/librarian-port" replace /> :
              user.role === 'faculty' ? <Navigate to="/dashboard/faculty" replace /> :
              <Navigate to="/dashboard/student" replace />
            ) : <Navigate to="/auth" replace />
          } />

          <Route path="/profile"   element={<ProtectedRoute><Profile user={user} onAvatarChange={handleAvatarChange} /></ProtectedRoute>} />
          <Route path="/pricing"   element={<Pricing />} />
          <Route path="/auth"      element={<Auth onAuthSuccess={handleAuthSuccess} onNotify={setToast} />} />
          
          {/* Catch-all 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center p-12 text-center page-enter">
              <h1 className="text-5xl font-bold text-slate-300 mb-4">404</h1>
              <p className="text-slate-400 text-lg">Page not found at: {window.location.pathname}</p>
              <Link to="/" className="mt-8 btn-primary px-6 py-2">Return Home</Link>
            </div>
          } />
        </Routes>
      </main>

      <Footer user={user} />

      <Toast message={toast.message} type={toast.type} onHide={() => setToastState({ message: '', type: 'success' })} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
