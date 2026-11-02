import React, { useEffect, useState } from 'react';
import { interviewsApi } from '../../api/interviews';
import StatusBadge from '../../components/StatusBadge';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function InterviewSchedulePage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewsApi.listInterviews()
      .then((data) => {
        setInterviews(Array.isArray(data) ? data : data.results || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Interview Schedule & Calendar</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review upcoming technical rounds, managerial interviews, and campus recruitment meeting credentials.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading interview schedule...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Interviews Scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">
            When a recruiter shortlists your profile for technical evaluation, details will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                item.is_upcoming ? 'border-indigo-300 ring-2 ring-indigo-50' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {item.company_name}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.job_title}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-outfit mt-0.5">
                    {item.round_name} (Round {item.round_number})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {item.mode === 'ONLINE' ? 'Online Video' : 'In-Person / On Campus'}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Scheduled Date & Time</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Duration</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {item.duration_minutes} Minutes
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Interviewers</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                    {item.interviewer_names || 'Panel Assigned'}
                  </span>
                </div>
              </div>

              {/* Instructions & Links */}
              {item.instructions && (
                <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-slate-700 border border-indigo-100 mb-4">
                  <span className="font-semibold text-indigo-900 block mb-1">Instructions for Candidate:</span>
                  <p>{item.instructions}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  {item.venue && (
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue: {item.venue}
                    </span>
                  )}
                </div>

                {item.meeting_link && (
                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Meeting</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
