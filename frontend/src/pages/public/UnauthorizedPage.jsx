import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UnauthorizedPage() {
  const { isStudent, isRecruiter, isAdmin } = useAuth();

  const getHomeLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isStudent) return '/student/dashboard';
    return '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Access Restricted</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
          You do not have the required permissions or role privileges to view this section of CampusHire.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={getHomeLink()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-xs shadow-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
