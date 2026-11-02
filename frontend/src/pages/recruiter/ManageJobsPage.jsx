import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import StatusBadge from '../../components/StatusBadge';
import {
  Briefcase,
  PlusCircle,
  Users,
  Clock,
  Edit,
  PowerOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getMyJobs();
      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCloseJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to close the job posting '${title}'? Candidates will no longer be able to apply.`)) return;
    try {
      await jobsApi.closeJob(id);
      setActionMsg(`Job '${title}' has been closed.`);
      await fetchJobs();
    } catch (err) {
      alert('Failed to close job.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Manage Job Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review status, applicant volume, and manage open hiring cycles.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Job Postings Created Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Start hiring by creating your first campus job opportunity.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <StatusBadge status={job.status} size="sm" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                  <span>{job.job_type.replace('_', ' ')}</span>
                  <span>• {job.location} ({job.work_mode})</span>
                  <span>• {job.salary_display || 'Competitive Package'}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                  </span>
                </div>

                {job.rejection_reason && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg mt-2 border border-rose-100">
                    Admin feedback: {job.rejection_reason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={`/recruiter/applicants?job=${job.id}`}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{job.applications_count || 0} Applicants</span>
                </Link>

                <Link
                  to={`/recruiter/jobs/${job.id}/edit`}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </Link>

                {job.status === 'APPROVED' && (
                  <button
                    onClick={() => handleCloseJob(job.id, job.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Close Job"
                  >
                    <PowerOff className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
