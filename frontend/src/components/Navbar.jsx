import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import {
  GraduationCap,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Building,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, showSidebarToggle = false }) {
  const { user, isAuthenticated, logout, isStudent, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (isAdmin)    return '/admin/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isStudent)  return '/student/dashboard';
    return '/';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (isRecruiter) {
      return (
        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Building className="w-3 h-3" /> Recruiter
        </span>
      );
    }
    if (isStudent) {
      return (
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <GraduationCap className="w-3 h-3" /> Student
        </span>
      );
    }
    return null;
  };

  /** Scroll to section on same page, or navigate to / then scroll */
  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      // Already on home — just scroll
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate home, then scroll after render
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const publicNavLinks = [
    { label: 'Home',     sectionId: 'home' },
    { label: 'Features', sectionId: 'features' },
    { label: 'About',    sectionId: 'about' },
    { label: 'Contact',  sectionId: 'contact' },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* ── Left: Logo & sidebar toggle ── */}
          <div className="flex items-center gap-3">
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={isAuthenticated ? getDashboardPath() : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Campus<span className="text-indigo-600 dark:text-indigo-400">Hire</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider -mt-1 hidden sm:block">
                  Smart Placement Portal
                </span>
              </div>
            </Link>

            {/* Public nav links — Desktop */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6 ml-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                {publicNavLinks.map(link => (
                  <a
                    key={link.sectionId}
                    href={`#${link.sectionId}`}
                    onClick={(e) => handleSectionClick(e, link.sectionId)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Theme toggle + auth controls ── */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle — always visible */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-700">
                      {user?.first_name ? user.first_name[0] : 'U'}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                        {user?.full_name || user?.email}
                      </span>
                      <div className="mt-0.5">{getRoleBadge()}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to={getDashboardPath()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          My Dashboard
                        </Link>

                        {isStudent && (
                          <Link
                            to="/student/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            Student Profile
                          </Link>
                        )}

                        {isRecruiter && (
                          <Link
                            to="/recruiter/company"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <Building className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            Company Profile
                          </Link>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left cursor-pointer transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Mobile hamburger for public nav */}
                <button
                  className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="hidden md:flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile menu for public (unauthenticated) ── */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/60 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {publicNavLinks.map(link => (
              <a
                key={link.sectionId}
                href={`#${link.sectionId}`}
                onClick={(e) => handleSectionClick(e, link.sectionId)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-center transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
