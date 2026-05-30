import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const userDataString = localStorage.getItem('user_data');
  
  if (!token || !userDataString) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userDataString);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 page-enter">
            <div className="card-glass border-red-500/30 bg-red-500/5 p-10 text-center max-w-md w-full">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                403 Forbidden
            </h1>
            <p className="text-slate-400 mb-6">Your role ({user.role}) does not have permission to view this directory.</p>
            <Link to="/" className="btn-primary py-2.5 inline-flex justify-center w-full">Return to Safety</Link>
          </div>
        </div>
      );
    }
    return children;
  } catch (err) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
}
