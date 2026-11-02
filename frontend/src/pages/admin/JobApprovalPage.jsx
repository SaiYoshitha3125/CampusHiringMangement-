import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import StatusBadge from '../../components/StatusBadge';
import SkillBadge from '../../components/SkillBadge';
import Modal from '../../components/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Briefcase,
  Clock,
  MapPin,
  AlertTriangle,
  Plus
} from 'lucide-react';

export default function JobApprovalPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingJob, setRejectingJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.listJobs();
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

  const handleApprove = async (id, title) => {
    try {
      await jobsApi.approveJob(id);
      setActionSuccess(`Job posting '${title}' approved and published live to students!`);
      fetchJobs();
    } catch (err) {
      alert('Failed to approve job.');
    }
  };

  const handleOpenReject = (job) => {
    setRejectingJob(job);
    setRejectReason('Eligibility requirements or compensation details require adjustment.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingJob) return;
    try {
      await jobsApi.rejectJob(rejectingJob.id, rejectReason);
      setRejectingJob(null);
      setActionSuccess(`Job posting '${rejectingJob.title}' rejected.`);
      fetchJobs();
    } catch (err) {
      alert('Failed to reject job.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Campus Job Drives & Approvals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review corporate job postings, vet compensation standards, and add new campus drives published directly to all student accounts.
          </p>
        </div>

        <Link
          to="/admin/jobs/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Campus Job</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center text-slate-400 text-xs">
          No job postings on record.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {job.company?.name}
                    </span>
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>{job.job_type.replace('_', ' ')}</span>
                    <span>• {job.location} ({job.work_mode})</span>
                    <span>• Package: <strong className="text-emerald-700">{job.salary_display || 'Competitive'}</strong></span>
                    <span>• Recruiter: {job.recruiter?.full_name} ({job.recruiter?.email})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(job.id, job.title)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {job.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleOpenReject(job)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Eligibility Criteria Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Min CGPA</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{job.eligibility_criteria?.min_cgpa}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Eligible Branches</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {job.eligibility_criteria?.eligible_departments?.join(', ') || 'All Branches'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Max Backlogs</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{job.eligibility_criteria?.max_active_backlogs ?? 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deadline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {job.rejection_reason && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                  Rejection Reason: {job.rejection_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingJob)}
        onClose={() => setRejectingJob(null)}
        title={`Reject Job Posting: ${rejectingJob?.title}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Please provide clear feedback to <strong>{rejectingJob?.company?.name}</strong> regarding why this posting cannot be published.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Feedback / Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectingJob(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
