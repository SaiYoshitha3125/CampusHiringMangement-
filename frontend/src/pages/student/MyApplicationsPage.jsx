import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../../api/applications';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import {
  Layers,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  Video,
  Info,
  ChevronRight
} from 'lucide-react';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.listApplications();
      setApplications(Array.isArray(res) ? res : res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be reversed.')) return;
    try {
      setWithdrawingId(id);
      await applicationsApi.withdraw(id);
      setActionMessage('Application withdrawn successfully.');
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const openHistoryModal = (app) => {
    setSelectedApp(app);
    setHistoryModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">My Application Tracking System</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your recruitment journey across all company campus drives with complete timestamped status audits.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-indigo-600 font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore eligible opportunities on the campus job board and submit your profile.
          </p>
          <Link
            to="/jobs"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Browse Available Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const canWithdraw = ['APPLIED', 'UNDER_REVIEW'].includes(app.status);
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {app.job?.company?.name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{app.job?.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      <span>• Location: {app.job?.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Score & Notes Snapshot */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 dark:bg-slate-700/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Skill Match Percentage</span>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      {app.skill_match_score !== null ? `${app.skill_match_score}% Match` : 'Not Available'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Submitted Resume</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {app.resume?.file_name || 'Primary Profile Data'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Recruiter Remarks</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                      {app.recruiter_notes || 'Under review by talent acquisition team.'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => openHistoryModal(app)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View Status Timeline History ({app.status_history?.length || 1})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium cursor-pointer transition-colors"
                      >
                        {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                    <Link
                      to={`/jobs/${app.job?.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                    >
                      Job Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status History Timeline Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Application History: ${selectedApp?.job?.title}`}
      >
        <div className="space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
            {selectedApp?.status_history?.map((step, idx) => (
              <div key={step.id || idx} className="relative">
                <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {step.to_status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {step.remarks && (
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
                      {step.remarks}
                    </p>
                  )}
                  {step.changed_by_name && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Updated by: {step.changed_by_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
