import React, { useState, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen,
  Edit3, Camera, ShieldCheck, Clock, BookMarked,
  Pencil, Check, X, ChevronDown, Save
} from 'lucide-react';

const BORROWED_BOOKS = [
  { title: 'The Pragmatic Programmer', dueDate: '2025-04-15', status: 'Active',   cover: '🖥️' },
  { title: 'Clean Architecture',       dueDate: '2025-03-20', status: 'Returned', cover: '🏗️' },
  { title: 'System Design Interview',  dueDate: '2025-02-10', status: 'Returned', cover: '⚙️' },
];

// ─── Location data ────────────────────────────────────────────────────────────
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore'];

const STATES_BY_COUNTRY = {
  India: ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi (NCT)'],
  'United States': ['California','Texas','New York','Florida','Illinois','Pennsylvania','Ohio','Georgia','Michigan','North Carolina'],
  'United Kingdom': ['England','Scotland','Wales','Northern Ireland'],
  Canada: ['Ontario','Quebec','British Columbia','Alberta','Manitoba','Saskatchewan','Nova Scotia'],
  Australia: ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania'],
  Germany: ['Bavaria','Berlin','Hamburg','Hesse','Lower Saxony','North Rhine-Westphalia','Saxony'],
  France: ['Île-de-France','Auvergne-Rhône-Alpes','Occitanie','Grand Est','Nouvelle-Aquitaine'],
  Singapore: ['Central Region','East Region','North Region','North-East Region','West Region'],
};

const DISTRICTS_BY_STATE = {
  'Delhi (NCT)': ['Central Delhi','East Delhi','New Delhi','North Delhi','South Delhi','West Delhi'],
  Maharashtra: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Solapur','Kolhapur','Thane'],
  Karnataka: ['Bengaluru Urban','Mysuru','Mangaluru','Hubli-Dharwad','Belagavi','Kalaburagi'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Tirunelveli','Vellore'],
  'Uttar Pradesh': ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Meerut','Noida'],
  'West Bengal': ['Kolkata','Howrah','North 24 Parganas','South 24 Parganas','Darjeeling'],
  Kerala: ['Thiruvananthapuram','Kochi','Kozhikode','Thrissur','Kollam','Kannur'],
  'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Tirupati','Guntur','Kurnool','Nellore'],
  Telangana: ['Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam'],
  Gujarat: ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar'],
};

const FALLBACK_DISTRICTS = ['District 1','District 2','District 3','District 4','District 5'];

// ─── Reusable select ──────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, disabled, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="input-field pl-4 pr-10 py-2.5 text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(o => <option key={o} value={o} className="bg-slate-900 text-white">{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Email Field with inline edit toggle ──────────────────────────────────────
function EmailField({ value, onChange, editMode }) {
  const [emailLocked, setEmailLocked] = useState(true);

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        <Mail className="w-3.5 h-3.5" />Email
      </label>
      {editMode ? (
        <div className="relative">
          <input
            type="email"
            value={value}
            onChange={e => onChange(e.target.value)}
            readOnly={emailLocked}
            className={`input-field pl-4 pr-10 py-2.5 text-sm transition-all ${emailLocked ? 'opacity-70 cursor-default' : 'ring-2 ring-indigo-500'}`}
            placeholder="your@email.com"
          />
          <button
            type="button"
            onClick={() => setEmailLocked(!emailLocked)}
            title={emailLocked ? 'Edit email' : 'Lock email'}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${emailLocked ? 'text-slate-500 hover:text-indigo-400' : 'text-indigo-400 hover:text-emerald-400'}`}
          >
            {emailLocked ? <Pencil className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl">{value}</p>
      )}
    </div>
  );
}

// ─── Location Dropdown ────────────────────────────────────────────────────────
function LocationSection({ loc, setLoc, editMode }) {
  const states   = STATES_BY_COUNTRY[loc.country] || [];
  const districts = DISTRICTS_BY_STATE[loc.state]  || (loc.state ? FALLBACK_DISTRICTS : []);

  const setField = (key, val) => setLoc(prev => {
    const next = { ...prev, [key]: val };
    if (key === 'country') { next.state = ''; next.district = ''; }
    if (key === 'state')   { next.district = ''; }
    return next;
  });

  if (!editMode) {
    const parts = [loc.address, loc.village, loc.district, loc.state, loc.country, loc.pincode].filter(Boolean);
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <MapPin className="w-3.5 h-3.5" />Location
        </label>
        <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl min-h-[42px]">
          {parts.length ? parts.join(', ') : <span className="text-slate-500">Not set</span>}
        </p>
      </div>
    );
  }

  return (
    <div className="sm:col-span-2 space-y-4 border border-white/10 rounded-xl p-4 bg-white/3">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" />Location Details
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Country"
          value={loc.country}
          onChange={v => setField('country', v)}
          options={COUNTRIES}
          placeholder="Select Country"
        />
        <SelectField
          label="State / Province"
          value={loc.state}
          onChange={v => setField('state', v)}
          options={states}
          disabled={!loc.country}
          placeholder="Select State"
        />
        <SelectField
          label="District"
          value={loc.district}
          onChange={v => setField('district', v)}
          options={districts}
          disabled={!loc.state}
          placeholder="Select District"
        />
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">City / Village</label>
          <input
            type="text"
            value={loc.village}
            onChange={e => setField('village', e.target.value)}
            className="input-field py-2.5 text-sm"
            placeholder="Enter city or village"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Pincode / ZIP</label>
          <input
            type="text"
            value={loc.pincode}
            onChange={e => setField('pincode', e.target.value)}
            maxLength={10}
            className="input-field py-2.5 text-sm"
            placeholder="e.g. 110001"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Street Address</label>
          <input
            type="text"
            value={loc.address}
            onChange={e => setField('address', e.target.value)}
            className="input-field py-2.5 text-sm"
            placeholder="House/Flat, Street name…"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Component ───────────────────────────────────────────────────
export default function Profile({ user, onAvatarChange }) {
  const loginEmail = user?.email || 'john.doe@library.edu';
  const getFallbackName = () => {
    if (user?.name) return user.name;
    if (user?.email) {
      const part = user.email.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return 'User';
  };
  const loginName = getFallbackName();
  const loginRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Student';
  const emailPrefix = user?.email ? `${user.email}_` : '';

  // Avatar — stored as base64 so it survives page reload
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(emailPrefix + 'lms_avatar') || null);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    // Convert to base64 for persistent storage
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setAvatarUrl(base64);
      localStorage.setItem(emailPrefix + 'lms_avatar', base64);
      if (onAvatarChange) onAvatarChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const [editMode, setEditMode] = useState(false);
  const [saved,    setSaved]    = useState(false);

  // ── Helper: load from localStorage, fallback to default ──
  const ls = (key, def) => { try { return localStorage.getItem(emailPrefix + key) || def; } catch { return def; } };
  const lsJson = (key, def) => { try { const v = localStorage.getItem(emailPrefix + key); return v ? JSON.parse(v) : def; } catch { return def; } };

  const DEFAULT_LOC = { country: '', state: '', district: '', village: '', pincode: '', address: '' };

  const [name,  setName]  = useState(() => ls('lms_p_name',  loginName));
  const [email, setEmail] = useState(() => ls('lms_p_email', loginEmail));
  const [phone, setPhone] = useState(() => ls('lms_p_phone', '+91 98765 43210'));
  const [loc,   setLoc]   = useState(() => lsJson('lms_p_loc', DEFAULT_LOC));

  const [role, setRole]   = useState(() => ls('lms_p_role', loginRole));

  // Committed (displayed) values
  const [displayName,  setDisplayName]  = useState(() => ls('lms_p_name',  loginName));
  const [displayEmail, setDisplayEmail] = useState(() => ls('lms_p_email', loginEmail));
  const [displayPhone, setDisplayPhone] = useState(() => ls('lms_p_phone', '+91 98765 43210'));
  const [displayLoc,   setDisplayLoc]   = useState(() => lsJson('lms_p_loc', DEFAULT_LOC));
  const [displayRole,  setDisplayRole]  = useState(() => ls('lms_p_role', loginRole));

  const memberSince = '2024-01-15';
  const memberId    = 'M001';

  const handleSave = () => {
    setDisplayName(name);
    setDisplayEmail(email);
    setDisplayPhone(phone);
    setDisplayLoc({ ...loc });
    setDisplayRole(role);
    // Persist to localStorage
    localStorage.setItem(emailPrefix + 'lms_p_name',  name);
    localStorage.setItem(emailPrefix + 'lms_p_email', email);
    localStorage.setItem(emailPrefix + 'lms_p_phone', phone);
    localStorage.setItem(emailPrefix + 'lms_p_loc',   JSON.stringify(loc));
    localStorage.setItem(emailPrefix + 'lms_p_role',  role);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    // Revert form to last saved state
    setName(displayName);
    setEmail(displayEmail);
    setPhone(displayPhone);
    setRole(displayRole);
    setLoc({ ...displayLoc });
    setEditMode(false);
  };

  const locationDisplay = [displayLoc.address, displayLoc.village, displayLoc.district, displayLoc.state, displayLoc.country, displayLoc.pincode]
    .filter(Boolean).join(', ');

  return (
    <div className="page-enter max-w-5xl mx-auto px-6 py-12">

      {/* Success Banner */}
      {saved && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl text-sm font-medium">
          <Check className="w-4 h-4 flex-shrink-0" />Profile saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: profile card ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card-glass p-7 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-lg shadow-white/5 border-2 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-slate-300 flex items-center justify-center text-3xl font-bold text-slate-950 mx-auto shadow-lg shadow-white/5">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={handleAvatarClick}
                title="Change profile picture"
                className="absolute -bottom-2 -right-2 bg-slate-800 border border-white/20 p-1.5 rounded-lg hover:bg-indigo-600 hover:border-indigo-500 transition-all group"
              >
                <Camera className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <p className="text-slate-300 text-sm mt-0.5">{displayEmail}</p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="badge bg-white/5 text-slate-300 border border-white/10 text-sm px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />{displayRole}
              </span>
            </div>

            <div className="mt-5 pt-5 border-t border-white/10 space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <User className="w-4 h-4 text-slate-400" />
                <span>ID: <span className="text-slate-300 font-mono">{memberId}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Member since {memberSince}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Expires: <span className="text-amber-400">2026-01-15</span></span>
              </div>
              {locationDisplay && (
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs leading-relaxed">{locationDisplay}</span>
                </div>
              )}
            </div>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="mt-6 w-full btn-primary justify-center py-3"
              >
                <Edit3 className="w-4 h-4" />Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 border border-white/20 text-slate-300 rounded-xl hover:bg-white/5 transition-all font-semibold"
              >
                <X className="w-4 h-4" />Cancel
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="card-glass p-5 grid grid-cols-3 gap-3 text-center">
            {[
              { value: '3',  label: 'Borrowed' },
              { value: '14', label: 'Total'    },
              { value: '0',  label: 'Overdue'  },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: details + history ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Details */}
          {editMode && (
            <div className="card-glass p-7">
              <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-white" />Personal Details
              </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5" />Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field pl-4 py-2.5 text-sm"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl">{displayName}</p>
                )}
              </div>

              {/* Email with inline pencil */}
              <EmailField value={email} onChange={setEmail} editMode={editMode} />

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5" />Phone
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field pl-4 py-2.5 text-sm"
                    placeholder="+91 XXXXX XXXXX"
                  />
                ) : (
                  <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl">{displayPhone}</p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />Account Type
                </label>
                {editMode ? (
                  <div className="relative">
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="input-field pl-4 pr-10 py-2.5 text-sm appearance-none"
                    >
                      <option value="Student" className="bg-slate-900">Student</option>
                      <option value="Faculty" className="bg-slate-900">Faculty</option>
                      <option value="Librarian" className="bg-slate-900">Librarian</option>
                      <option value="Admin" className="bg-slate-900">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl">{displayRole}</p>
                )}
              </div>

              {/* Location — view mode only (full location editor is below) */}
              {!editMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />Location
                  </label>
                  <p className="text-slate-200 text-sm py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl">
                    {locationDisplay || <span className="text-slate-500">Not set</span>}
                  </p>
                </div>
              )}

              {/* Location dropdown section (edit mode spans full width) */}
              {editMode && (
                <LocationSection loc={loc} setLoc={setLoc} editMode={editMode} />
              )}
            </div>

            {/* Save button */}
            {editMode && (
              <button
                onClick={handleSave}
                className="mt-6 btn-primary py-3 px-8 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
              >
                <Save className="w-4 h-4" />Save Changes
              </button>
            )}
          </div>
          )}

          {/* Borrowing History */}
          <div className="card-glass p-7">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />Borrowing History
            </h3>
            <div className="space-y-3">
              {BORROWED_BOOKS.map((b, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-colors">
                  <div className="w-12 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-xl border border-white/5 flex-shrink-0">
                    {b.cover}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{b.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: {b.dueDate}
                    </p>
                  </div>
                  <span className={`badge border flex-shrink-0 ${
                    b.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/10 text-slate-400 border-white/10'
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Renewal */}
          <div className="card-glass p-6 flex items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-white">Membership Renewal</h4>
              <p className="text-slate-300 text-sm mt-0.5">
                Your membership expires on <span className="text-amber-400 font-medium">January 15, 2026</span>. Renew now to continue borrowing.
              </p>
            </div>
            <button className="btn-primary flex-shrink-0">Renew Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
