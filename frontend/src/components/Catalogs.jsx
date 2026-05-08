import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, ChevronDown, X, Star, Users, Clock } from 'lucide-react';

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

const MOCK_BOOKS = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', status: 'Available', category: 'Technology', language: 'English', edition: '20th Anniversary', rating: 4.8, copies: 3 },
  { id: 2, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', status: 'Issued', category: 'Computer Science', language: 'English', edition: '4th', rating: 4.7, copies: 2 },
  { id: 3, title: 'Clean Architecture', author: 'Robert C. Martin', isbn: '9780134494166', status: 'Available', category: 'Software Engineering', language: 'English', edition: '1st', rating: 4.6, copies: 5 },
  { id: 4, title: 'System Design Interview', author: 'Alex Xu', isbn: '9798664653403', status: 'Available', category: 'Engineering', language: 'English', edition: 'Vol 2', rating: 4.9, copies: 1 },
  { id: 5, title: 'Deep Learning', author: 'Ian Goodfellow', isbn: '9780262035613', status: 'Issued', category: 'Artificial Intelligence', language: 'English', edition: '1st', rating: 4.5, copies: 2 },
  { id: 6, title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '9780078022159', status: 'Available', category: 'Databases', language: 'English', edition: '7th', rating: 4.4, copies: 4 },
  { id: 7, title: 'The Design of Everyday Things', author: 'Don Norman', isbn: '9780465050659', status: 'Available', category: 'Design', language: 'English', edition: 'Revised', rating: 4.7, copies: 3 },
  { id: 8, title: 'You Don\'t Know JS', author: 'Kyle Simpson', isbn: '9781491904244', status: 'Reserved', category: 'Technology', language: 'English', edition: '2nd', rating: 4.6, copies: 2 },
];

const CATEGORIES = ['All', 'Technology', 'Computer Science', 'Software Engineering', 'Engineering', 'Artificial Intelligence', 'Databases', 'Design'];
const LANGUAGES  = ['All', 'English', 'Hindi', 'French'];

const statusConfig = {
  'Available': { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  'Issued':    { cls: 'bg-red-500/15 text-red-400 border-red-500/30',             dot: 'bg-red-400'     },
  'Reserved':  { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400'   },
};

function BookCard({ book, onPlaceHold }) {
  const cfg = statusConfig[book.status] || statusConfig['Available'];
  return (
    <div className="card-glass p-6 hover:bg-white/8 transition-all group flex gap-5">
      {/* Cover placeholder */}
      <div className="w-20 h-28 flex-shrink-0 bg-gradient-to-br from-indigo-600/40 to-purple-600/40 rounded-xl flex items-center justify-center border border-white/10">
        <BookOpen className="w-8 h-8 text-indigo-300 opacity-70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-base leading-snug mb-0.5 group-hover:text-indigo-300 transition-colors truncate">{book.title}</h3>
            <p className="text-slate-400 text-sm truncate">by <span className="text-slate-300">{book.author}</span></p>
          </div>
          <span className={`badge border ${cfg.cls} flex-shrink-0 flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {book.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="bg-indigo-500/10 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/20">{book.category}</span>
          <span className="bg-white/5 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-white/10">ISBN: {book.isbn}</span>
          <span className="bg-white/5 text-slate-400 text-xs px-2 py-0.5 rounded-full border border-white/10">Ed. {book.edition}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{book.rating}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{book.copies} copies</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />14-day loan</span>
          </div>
          <button
            onClick={() => onPlaceHold(book)}
            disabled={book.status === 'Issued'}
            className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 hover:border-indigo-600 disabled:hover:bg-indigo-600/20 disabled:hover:text-indigo-300"
          >
            {book.status === 'Available' ? 'Place Hold' : book.status === 'Reserved' ? 'Join Waitlist' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Catalogs({ user, onNotify }) {
  const [query, setQuery]           = useLocalStorage('library_catalogs_query', '');
  const [category, setCategory]     = useState('All');
  const [language, setLanguage]     = useState('All');
  const [availability, setAvail]    = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults]        = useState(MOCK_BOOKS);

  useEffect(() => {
    let list = MOCK_BOOKS;
    if (query.trim())      list = list.filter(b => b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase()) || b.isbn.includes(query));
    if (category !== 'All') list = list.filter(b => b.category === category);
    if (language !== 'All') list = list.filter(b => b.language === language);
    if (availability !== 'All') list = list.filter(b => b.status === availability);
    setResults(list);
  }, [query, category, language, availability]);

  const clearFilters = () => { setQuery(''); setCategory('All'); setLanguage('All'); setAvail('All'); };

  const handlePlaceHold = (book) => {
    if (!user) {
      if (onNotify) onNotify("Please Sign In to place a hold or reserve this book.", 'error');
      return;
    }
    if (onNotify) onNotify(`Hold placed for "${book.title}"`);
  };

  const hasFilters = query || category !== 'All' || language !== 'All' || availability !== 'All';

  return (
    <div className="page-enter max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Library <span className="gradient-text">Catalog</span></h1>
        <p className="text-slate-300">Search and browse across our entire collection</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            className="input-field pl-12 py-4 text-base"
            placeholder="Search by title, author, or ISBN…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-5 py-3 card-glass hover:bg-white/8 rounded-xl font-medium text-slate-200 transition-all"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-4 py-3 text-slate-300 hover:text-white transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card-glass p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
            <select className="input-field py-2.5" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Language</label>
            <select className="input-field py-2.5" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l} className="bg-slate-900 text-white">{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Availability</label>
            <select className="input-field py-2.5" value={availability} onChange={e => setAvail(e.target.value)}>
              {['All', 'Available', 'Issued', 'Reserved'].map(a => <option key={a} value={a} className="bg-slate-900 text-white">{a}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-slate-400 mb-5">{results.length} {results.length === 1 ? 'result' : 'results'} found</p>

      {/* Book Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {results.map(book => <BookCard key={book.id} book={book} onPlaceHold={handlePlaceHold} />)}
        </div>
      ) : (
        <div className="text-center py-24">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No books match your search</p>
          <button onClick={clearFilters} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">Clear filters</button>
        </div>
      )}
    </div>
  );
}
