import React from 'react';

const STATUS_CONFIGS = {
  // Application statuses
  APPLIED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Applied' },
  UNDER_REVIEW: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Under Review' },
  SHORTLISTED: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Shortlisted' },
  INTERVIEW_SCHEDULED: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Interview Scheduled' },
  SELECTED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Selected / Placed' },
  REJECTED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' },
  WITHDRAWN: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Withdrawn' },

  // Job Posting statuses
  DRAFT: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Draft' },
  PENDING_APPROVAL: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Approval' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved & Live' },
  CLOSED: { bg: 'bg-slate-100 text-slate-600 border-slate-300', label: 'Closed' },

  // Verification & general
  VERIFIED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Verified' },
  PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active' },
  INACTIVE: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Inactive' },
};

export default function StatusBadge({ status, text, size = 'md' }) {
  const config = STATUS_CONFIGS[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: status || 'Unknown' };
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${config.bg} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {text || config.label}
    </span>
  );
}
