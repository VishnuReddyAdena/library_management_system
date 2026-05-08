import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';

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

export default function OPAC() {
  const [query, setQuery] = useLocalStorage('library_opac_query', '');

  const mockBooks = [
    { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', status: 'Available', category: 'Technology' },
    { id: 2, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', status: 'Issued', category: 'Computer Science' },
    { id: 3, title: 'Clean Architecture', author: 'Robert C. Martin', status: 'Available', category: 'Software Engineering' },
    { id: 4, title: 'System Design Interview', author: 'Alex Xu', status: 'Available', category: 'Engineering' }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Discover Your Next Read</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Search across thousands of physical books, digital journals, and institutional resources available in our library.</p>
        
        <div className="flex bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
          <input 
            type="text" 
            className="flex-1 px-6 py-4 outline-none text-gray-700 bg-transparent text-lg" 
            placeholder="Search by title, author, or ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-semibold transition-colors flex items-center gap-2">
            <Search className="w-5 h-5"/>
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0 hidden md:block">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><Filter className="w-4 h-4"/> Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/> Available Right Now</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"/> Check-out Online</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Search Results</h2>
          {mockBooks.map(book => (
            <div key={book.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-6">
              <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 text-gray-400">
                 <BookOpen className="w-10 h-10"/>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-blue-600 hover:underline cursor-pointer">{book.title}</h3>
                    <p className="text-gray-600">by <span className="font-medium text-gray-900">{book.author}</span></p>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded mt-2">{book.category}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${book.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {book.status}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <button disabled={book.status !== 'Available'} className={`text-sm font-medium ${book.status === 'Available' ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}>
                    {book.status === 'Available' ? 'Place Hold / Request Delivery' : 'Join Waitlist'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
