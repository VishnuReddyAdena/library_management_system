import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, Users, BarChart3, ArrowRight,
  BookMarked, Shield, Clock, Zap, Star, LayoutDashboard
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Smart Catalog Search',
    desc: 'Discover books by title, author, ISBN, or category instantly with intelligent full-text search.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: BookMarked,
    title: 'Issue & Return',
    desc: 'Streamlined circulation with real-time validation, quotas, and automatic fine calculation.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Member Management',
    desc: 'Full membership lifecycle — onboarding, renewal reminders, and digital membership cards.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Real-time dashboards with circulation analytics, overdue alerts, and procurement insights.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Secure JWT authentication with granular RBAC for Admin, Librarian, and Member roles.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Zap,
    title: 'Automated Fine Engine',
    desc: 'Linear overdue fine calculation (Total = Days × Rate) with manual waiver capabilities.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

const stats = [
  { value: '50,000+', label: 'Books Catalogued' },
  { value: '12,000+', label: 'Active Members' },
  { value: '98.9%', label: 'Uptime SLA' },
  { value: '< 50ms', label: 'Search Response' },
];

const testimonials = [
  { name: 'Dr. Sarah Mehta', role: 'Head Librarian, IIT Delhi', text: 'LibraryOS transformed our entire circulation process. What used to take 30 minutes now happens in seconds.', rating: 5 },
  { name: 'James O\'Brien', role: 'Library Director, Oxford', text: 'The overdue fine automation alone saved us 20 staff-hours per week. Exceptional system.', rating: 5 },
  { name: 'Priya Nair', role: 'Student Member', text: 'The OPAC is beautiful. I can find any book in seconds and see real-time availability.', rating: 5 },
];

export default function Home({ user }) {
  const isLoggedIn = !!user;
  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-24 px-6">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] orb pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] orb orb-delay pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            Modern Library Management System
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-none text-white">
            Your Library,{' '}
            <span className="gradient-text">Reimagined</span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            A next-generation platform for cataloging, circulation, and member management.
            Built for modern institutions that demand speed, security, and simplicity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/catalogs" className="btn-primary text-base px-8 py-4 rounded-2xl">
              <BookOpen className="w-5 h-5" />
              Explore Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            {isLoggedIn ? (
              <Link to="/dashboard" className="text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold transition-all text-base flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/auth?mode=signup"
                  id="hero-signup-btn"
                  className="btn-primary text-base px-7 py-4 rounded-2xl"
                >
                  Sign Up Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/auth"
                  id="hero-signin-btn"
                  className="text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-7 py-4 rounded-2xl font-semibold transition-all text-base"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="card-glass p-5 text-center">
                <p className="text-3xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything a Modern Library Needs</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Purpose-built modules covering every workflow from cataloging to procurement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-glass p-7 hover:bg-white/8 transition-all group">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${f.bg}`}>
                  <f.icon className={`w-7 h-7 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-12 text-center">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">Ready to Modernize Your Library?</h2>
              <p className="text-indigo-200 mb-8">Join thousands of institutions that trust LibraryOS for their daily operations.</p>
              <div className="flex gap-4 justify-center">
                {isLoggedIn ? (
                  <Link to="/dashboard" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/auth?mode=signup" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2">
                      Sign Up Free <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/auth" className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all">
                      Sign In
                    </Link>
                  </>
                )}
                <Link to="/pricing" className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Librarians Worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-glass p-7">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
