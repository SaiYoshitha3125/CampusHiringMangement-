import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  User,
  PlusCircle,
  Users,
  Building,
  BarChart3,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Bell
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role, isStudent, isRecruiter, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { to: '/student/applications', icon: Layers, label: 'My Applications' },
    { to: '/student/resume', icon: FileText, label: 'Resume Manager' },
    { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'Job Postings' },
    { to: '/recruiter/jobs/new', icon: PlusCircle, label: 'Post New Job' },
    { to: '/recruiter/applicants', icon: Users, label: 'Applicant Pipeline' },
    { to: '/recruiter/company', icon: Building, label: 'Company Profile' },
    { to: '/recruiter/analytics', icon: BarChart3, label: 'Recruitment Analytics' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Campus Overview' },
    { to: '/admin/jobs', icon: ShieldCheck, label: 'Job Approvals' },
    { to: '/admin/students', icon: Users, label: 'Student Directory' },
    { to: '/admin/recruiters', icon: Building, label: 'Recruiter Verification' },
    { to: '/admin/cycles', icon: Layers, label: 'Recruitment Cycles' },
    { to: '/admin/reports', icon: FileSpreadsheet, label: 'Analytics & Reports' },
  ];

  let links = [];
  let roleTitle = '';

  if (isStudent) {
    links = studentLinks;
    roleTitle = 'Student Portal';
  } else if (isRecruiter) {
    links = recruiterLinks;
    roleTitle = 'Recruiter Portal';
  } else if (isAdmin) {
    links = adminLinks;
    roleTitle = 'Administration';
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 dark:border-slate-800/70 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="px-5 py-4 border-b border-slate-800/80 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 dark:text-indigo-500">
            {roleTitle}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="p-4 border-t border-slate-800/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-600 text-center">
          CampusHire v1.0 • Placement Season 2026
        </div>
      </aside>
    </>
  );
}
