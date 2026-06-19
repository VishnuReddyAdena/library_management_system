import React, { useState } from 'react';
import {
  Mail, Lock, User, AlertCircle, ArrowRight,
  CheckCircle, Eye, EyeOff, Sparkles,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GlassSelect from './GlassSelect';
import authService from '../services/authService';
import logoImg from '../logo.png';

// ─── Local user store (fallback when backend is unavailable) ─────────────────
const LOCAL_USERS_KEY = 'lms_registered_users';

function getLocalUsers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveLocalUser(user) {
  const users = getLocalUsers();
  // Replace if email already exists
  const idx = users.findIndex(u => u.email === user.email);
  if (idx !== -1) users[idx] = user;
  else users.push(user);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function findLocalUser(email, password, role) {
  return getLocalUsers().find(
    u => u.email === email && u.password === password && u.role === role
  );
}

// ─── Sign-Up Form ─────────────────────────────────────────────────────────────
function SignUpForm({ onSwitch, onNotify, isAdminPortal, isLibrarianPortal }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState(isAdminPortal ? 'admin' : (isLibrarianPortal ? 'librarian' : 'student'));
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!name || name.trim() === '') e.name = 'Name is required.';
    if (!email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) e.email = 'Email must be in the format ******@gmail.com.';
    if (!password || password.length < 8) e.password = 'Min. 8 characters required.';
    if (password !== confirm) e.confirm = 'Passwords do not match.';
    if (!role) e.role = 'Please select a role.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    // Check duplicate email in local store
    const existing = getLocalUsers().find(u => u.email === email);
    if (existing) {
      setGlobalError('An account with this email already exists. Please sign in.');
      return;
    }

    // Check duplicate name in local store
    const existingName = getLocalUsers().find(u => u.name && u.name.toLowerCase() === name.toLowerCase());
    if (existingName) {
      setGlobalError('use another name .not available!');
      return;
    }

    setLoading(true);
    try {
      // Try backend first — if it works, great
      const res = await authService.post('/api/auth/register/', { email, password, role, name });
      if (res.data && !res.data.success) {
        setGlobalError(res.data.message || 'Registration failed.');
        setLoading(false);
        return;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setGlobalError(err.response.data.message);
        setLoading(false);
        return;
      } else {
        setGlobalError(err.message === 'Network Error' || err.code === 'ECONNABORTED'
          ? 'Unable to connect to the backend server. Please check if the server is running and accessible.'
          : `Connection error: ${err.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    }

    // Always save locally so sign-in works immediately
    saveLocalUser({ email, password, role, name });

    if (onNotify) onNotify('Account created successfully! Please sign in.');
    setLoading(false);
    setSuccess(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-5 text-center">
        {/* Animated ring + checkmark */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
            <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            Account Created Successfully!
          </h3>
          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Welcome to LibraryOS!
            Your <span className="capitalize text-slate-300">{role}</span> account is ready.
          </p>
        </div>

        <div className="w-full px-2 pt-2 space-y-3">
          <button
            onClick={onSwitch}
            className="w-full btn-primary justify-center py-3.5 text-base"
          >
            Go to Sign In <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-slate-500 text-xs">
            Use your email and password to log in
          </p>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3.5 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-200">{globalError}</p>
        </div>
      )}
      {/* Role selection only on public portal */}
      {!isAdminPortal && !isLibrarianPortal && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Portal Role
          </label>
          <GlassSelect
            value={role}
            onChange={setRole}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Faculty', value: 'faculty' },
            ]}
          />
          {errors.role && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.role}</p>}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`input-field !pl-10 ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Your Name"
            autoComplete="name"
          />
        </div>
        {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`input-field !pl-10 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@college.edu"
            autoComplete="new-email"
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`input-field !pl-10 !pr-10 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className={`input-field !pl-10 ${errors.confirm ? 'border-red-500' : ''}`}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>
        {errors.confirm && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirm}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
          </svg>
        ) : (
          <>Create Account <ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      <p className="text-center text-slate-400 text-sm pt-1">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors inline-flex items-center gap-1"
        >
          Login <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </p>
    </form>
  );
}

// ─── Sign-In Form ─────────────────────────────────────────────────────────────
function SignInForm({ onSwitch, onNotify, onAuthSuccess, isAdminPortal, isLibrarianPortal }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(isAdminPortal ? 'admin' : (isLibrarianPortal ? 'librarian' : 'student'));
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  const validate = () => {
    const e = {};
    if (!email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) e.email = 'Email must be in the format ******@gmail.com.';
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!role) e.role = 'Role must be selected.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loginWithLocalUser = (localUser) => {
    const userData = { name: localUser.name, email: localUser.email, role: localUser.role };
    // Create a mock JWT payload
    const fakeAccess = btoa(JSON.stringify({ ...userData, exp: Date.now() + 86400000 }));
    // sessionStorage is tab-scoped — each tab keeps its own session
    sessionStorage.setItem('access_token', fakeAccess);
    sessionStorage.setItem('user_data', JSON.stringify(userData));
    if (onAuthSuccess) onAuthSuccess(userData);
    if (onNotify) onNotify(`Welcome back, ${userData.name || userData.email.split('@')[0]}!`);

    if (userData.role === 'admin') navigate('/admin-port');
    else if (userData.role === 'librarian') navigate('/librarian-port');
    else if (userData.role === 'faculty') navigate('/dashboard/faculty');
    else navigate('/dashboard/student');
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);

    try {
      // Try backend - pass role to distinguish
      const res = await authService.post('/api/auth/login/', { email, password, role });
      if (res.data.success) {
        const { access, user } = res.data;
        // sessionStorage is tab-scoped — each tab keeps its own session
        sessionStorage.setItem('access_token', access);
        sessionStorage.setItem('user_data', JSON.stringify(user));
        if (onAuthSuccess) onAuthSuccess(user);
        if (onNotify) onNotify(`Welcome back, ${user.name || user.email.split('@')[0]}!`);

        if (user.role === 'admin') navigate('/admin-port');
        else if (user.role === 'librarian') navigate('/librarian-port');
        else if (user.role === 'faculty') navigate('/dashboard/faculty');
        else navigate('/dashboard/student');
        return;
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          setGlobalError(data.message || 'Validation failed.');
          if (data.errors) setErrors(data.errors);
          setLoading(false);
          return;
        } else if (status === 401 || status === 403) {
          // Invalid credentials or role mismatch etc
          setGlobalError(data.message || 'Invalid credentials.');
          setLoading(false);
          return;
        } else if (status === 429) {
          setGlobalError('Too many attempts. Please wait 15 minutes.');
          setLoading(false);
          return;
        } else if (status === 503) {
          setGlobalError(data.message || 'Database connection error.');
          setLoading(false);
          return;
        }
      } else {
        setGlobalError(err.message === 'Network Error' || err.code === 'ECONNABORTED'
          ? 'Unable to connect to the backend server. Please check if the server is running and accessible.'
          : `Connection error: ${err.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    }

    // Fallback: check locally registered users
    const users = getLocalUsers();
    const localUser = users.find(u => u.email === email && u.password === password);
    if (localUser) {
      loginWithLocalUser(localUser);
    } else {
      setGlobalError('Invalid credentials. Please check your email and password.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {globalError && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3.5 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-200">{globalError}</p>
        </div>
      )}

      {/* Email */}
      ...
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`input-field !pl-10 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@library.edu"
            autoComplete="new-email"
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`input-field !pl-10 !pr-10 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
          </svg>
        ) : (
          <>Secure Sign In <ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      {!isAdminPortal && (
        <p className="text-center text-slate-400 text-sm pt-1">
          New here?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors inline-flex items-center gap-1"
          >
            Create account <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </p>
      )}
    </form>
  );
}

// ─── Auth Page Shell ──────────────────────────────────────────────────────────
export default function Auth({ onNotify, onAuthSuccess, isAdminPortal = false, isLibrarianPortal = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(
    (isAdminPortal || isLibrarianPortal) ? 'login' : (searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  );

  const switchTo = (m) => {
    setMode(m);
    setSearchParams(m === 'signup' ? { mode: 'signup' } : {});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[150px] orb pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/15 blur-[130px] orb orb-delay pointer-events-none" />

      <div className="w-full max-w-md relative z-10 page-enter">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-xl" />
            <img
              src={logoImg}
              alt="LibraryOS"
              className="relative w-20 h-20 object-contain drop-shadow-[0_0_18px_rgba(99,102,241,0.7)] hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isAdminPortal ? 'Admin Portal Access' : (isLibrarianPortal ? 'Librarian Portal Access' : (mode === 'signup' ? 'Create Account' : 'Welcome Back'))}
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-sm mx-auto">
            {isAdminPortal
              ? 'Authorized personnel only. Please verify your credentials.'
              : (isLibrarianPortal
                ? 'Library Operations Control Center. Authorized access only.'
                : (mode === 'signup'
                  ? 'Join LibraryOS and access your institutional library.'
                  : 'Securely sign in to access your workspace.'))}
          </p>
        </div>

        <div className="card-glass p-8">
          {/* Mode toggle pills */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5 mb-6">
            {[
              { key: 'signup', label: 'Sign Up' },
              { key: 'login', label: 'Sign In' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTo(key)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${mode === key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'signup' ? (
            <SignUpForm onSwitch={() => switchTo('login')} onNotify={onNotify} isAdminPortal={isAdminPortal} isLibrarianPortal={isLibrarianPortal} />
          ) : (
            <SignInForm
              onSwitch={() => switchTo('signup')}
              onNotify={onNotify}
              onAuthSuccess={onAuthSuccess}
              isAdminPortal={isAdminPortal}
              isLibrarianPortal={isLibrarianPortal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
