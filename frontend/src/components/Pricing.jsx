import React, { useState } from 'react';
import { Check, Zap, Shield, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    key:      'basic',
    name:     'Student',
    price:    '₹299',
    period:   '/ year',
    tagline:  'Perfect for undergraduate students',
    color:    'border-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/5',
    badge:    null,
    features: [
      '5 books simultaneously',
      '14-day loan period',
      'OPAC catalog access',
      'Digital membership card',
      'Email renewal reminders',
      'Online holds & reservations',
    ],
    cta: 'Get Student Plan',
    ctaCls: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
  },
  {
    key:      'pro',
    name:     'Faculty',
    price:    '₹799',
    period:   '/ year',
    tagline:  'For faculty and researchers',
    color:    'border-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/5',
    badge:    'Most Popular',
    features: [
      '15 books simultaneously',
      '30-day loan period',
      'Priority reservations',
      'Inter-library loan access',
      'QR code membership card',
      'SMS + Email notifications',
      'Fine waiver (1×/year)',
    ],
    cta: 'Get Faculty Plan',
    ctaCls: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
  },
  {
    key:      'premium',
    name:     'Institutional',
    price:    'Custom',
    period:   '',
    tagline:  'For universities and enterprises',
    color:    'border-white/10 hover:border-white/30 hover:shadow-xl hover:shadow-white/5',
    badge:    null,
    features: [
      'Unlimited users',
      'Unlimited loan period',
      'Custom RBAC roles',
      'API access for integrations',
      'Dedicated account manager',
      'SLA 99.9% uptime guarantee',
      'Custom analytics reports',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    ctaCls: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
  },
];

const FAQ = [
  { q: "Can I upgrade my plan mid-year?", a: "Yes, you can upgrade anytime. We'll pro-rate the difference for the remaining period." },
  { q: "What happens when I exceed my book quota?", a: "You'll be notified and asked to return a book before borrowing a new one. No automatic charges apply." },
  { q: "Are late fines included in the plan price?", a: "No. Fines are calculated separately at ₹1.50 per day per overdue book. Faculty plans include one annual waiver." },
  { q: "Is there a free trial?", a: "Yes! All new members get a 30-day free trial with Student plan features." },
];

export default function Pricing({ onGetStarted }) {
  const [billingAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="page-enter max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-slate-300 text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Choose Your <span className="gradient-text">Membership</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Annual memberships that grow with you. Start free, upgrade anytime.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`card-glass p-8 flex flex-col border relative ${plan.color} transition-all hover:-translate-y-1`}
          >
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap shadow-lg">
                  <Star className="w-3 h-3 fill-white" />{plan.badge}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p className="text-slate-400 text-sm mt-1">{plan.tagline}</p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400 ml-1">{plan.period}</span>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/auth"
              className={`w-full text-center font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${plan.ctaCls}`}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Free Trial Banner */}
      <div className="card-glass p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-20 border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">30-Day Free Trial</h3>
            <p className="text-slate-400 text-sm">No payment required. No credit card needed. Cancel anytime.</p>
          </div>
        </div>
        <Link to="/auth" className="btn-primary flex-shrink-0 py-3 px-7">
          Start Free Trial <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className={`card-glass overflow-hidden transition-all ${openFaq === i ? 'border-indigo-500/30' : ''}`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-white pr-4">{item.q}</span>
                <span className={`text-indigo-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
