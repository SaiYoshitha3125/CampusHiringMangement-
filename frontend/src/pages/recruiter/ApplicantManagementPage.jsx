import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import { interviewsApi } from '../../api/interviews';
import StatusBadge from '../../components/StatusBadge';
import SkillBadge from '../../components/SkillBadge';
import Modal from '../../components/Modal';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Sparkles,
  FileText,
  ExternalLink,
  Clock,
  ArrowUpDown,
  Send,
  Eye,
  Award
} from 'lucide-react';

export default function ApplicantManagementPage() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('job') || '';

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [inspectApp, setInspectApp] = useState(null);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [interviewData, setInterviewData] = useState({
    round_number: 1,
    round_name: 'Technical Round 1',
    mode: 'ONLINE',
    meeting_link: 'https://meet.google.com/new',
    venue: '',
    scheduled_at: '',
    duration_minutes: 45,
    interviewer_names: '',
    instructions: '',
  });

  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedJob) params.job__id = selectedJob;
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const [appsData, myJobs] = await Promise.all([
        applicationsApi.listApplications(params),
        jobsApi.getMyJobs(),
      ]);

      setApplicants(Array.isArray(appsData) ? appsData : appsData.results || []);
      setJobs(Array.isArray(myJobs) ? myJobs : myJobs.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [selectedJob, statusFilter]);

  const handleShortlist = async (appId) => {
    try {
      await applicationsApi.shortlist(appId, 'Candidate shortlisted based on profile and skill match.');
      setActionSuccess('Candidate successfully shortlisted!');
      fetchApplicants();
    } catch (err) {
      alert('Failed to shortlist candidate.');
    }
  };

  const handleAccept = async (appId, candidateName = 'Candidate') => {
    if (!window.confirm(`Are you sure you want to Accept ${candidateName}'s application for this placement drive?`)) return;
    try {
      await applicationsApi.acceptCandidate(appId, 'Candidate application accepted by corporate recruiter.');
      setActionSuccess(`Application accepted! ${candidateName} has been selected and will see the offer in their student dashboard.`);
      if (inspectApp?.id === appId) {
        setInspectApp(prev => ({ ...prev, status: 'SELECTED' }));
      }
      fetchApplicants();
    } catch (err) {
      alert('Failed to accept candidate application.');
    }
  };

  const handleSelectOffer = async (appId) => {
    if (!window.confirm('Are you sure you want to roll out an official placement selection offer to this candidate?')) return;
    try {
      await applicationsApi.updateStatus(appId, 'SELECTED', 'Candidate selected for campus placement offer.', 'Selection offer confirmed.');
      setActionSuccess('Placement offer confirmed for candidate!');
      fetchApplicants();
    } catch (err) {
      alert('Failed to select candidate.');
    }
  };

  const handleOpenReject = (app) => {
    setRejectingApp(app);
    setRejectionRemarks('Does not meet current team requirements.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingApp) return;
    try {
      await applicationsApi.rejectCandidate(rejectingApp.id, rejectionRemarks);
      setRejectingApp(null);
      setActionSuccess('Application updated to Rejected.');
      fetchApplicants();
    } catch (err) {
      alert('Failed to reject candidate.');
    }
  };

  const handleOpenSchedule = (app) => {
    setScheduleApp(app);
    // default to tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const dateStr = tomorrow.toISOString().slice(0, 16);

    setInterviewData({
      round_number: (app.interviews?.length || 0) + 1,
      round_name: `Technical Round ${(app.interviews?.length || 0) + 1}`,
      mode: 'ONLINE',
      meeting_link: 'https://meet.google.com/campushire-interview',
      venue: '',
      scheduled_at: dateStr,
      duration_minutes: 45,
      interviewer_names: '',
      instructions: 'Please be ready with your development environment and code editor.',
    });
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleApp) return;
    setActionLoading(true);

    try {
      await interviewsApi.scheduleInterview({
        application_id: scheduleApp.id,
        ...interviewData,
      });
      setScheduleApp(null);
      setActionSuccess('Interview scheduled and invitation dispatched to candidate!');
      fetchApplicants();
    } catch (err) {
      alert(err.response?.data?.scheduled_at || err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Applicant Pipeline & Screening</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review candidate qualifications, inspect explainable skill match scores, shortlist, and schedule interviews.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by name, roll number, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplicants()}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Job Postings</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={fetchApplicants}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Applicants List Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading applicants...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Applicants Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No candidates matched the selected filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-700/60 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Academic Specs</th>
                  <th className="py-3 px-4">Skill Match</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                    {/* Candidate */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {app.student?.user?.full_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {app.student?.roll_number} • {app.student?.user?.email}
                        </span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{app.job?.title}</span>
                      <span className="block text-[11px] text-slate-400">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Academic */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{app.student?.department}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        CGPA: <strong className="text-indigo-600 dark:text-indigo-400">{app.student?.cgpa}</strong> • Batch {app.student?.graduation_year}
                      </span>
                    </td>

                    {/* Skill Match */}
                    <td className="py-3 px-4">
                      {app.skill_match_score !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
                            {app.skill_match_score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    {/* Resume column */}
                    <td className="py-3 px-4">
                      {app.resume?.file_url || app.resume?.file ? (
                        <a
                          href={app.resume.file_url || `/media/${app.resume.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors"
                          title={`Open ${app.resume.file_name}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Resume</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No resume</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {/* Direct Accept / Offer */}
                      {app.status !== 'SELECTED' && app.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleAccept(app.id, app.student?.user?.full_name)}
                          className="px-3 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                          title="Accept and select this candidate"
                        >
                          Accept
                        </button>
                      )}

                      {/* Direct Reject */}
                      {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                        <button
                          onClick={() => handleOpenReject(app)}
                          className="px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          title="Reject application"
                        >
                          Reject
                        </button>
                      )}

                      {/* Shortlist */}
                      {app.status === 'APPLIED' && (
                        <button
                          onClick={() => handleShortlist(app.id)}
                          className="px-2 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          Shortlist
                        </button>
                      )}

                      {/* Schedule */}
                      {['SHORTLISTED', 'UNDER_REVIEW', 'APPLIED'].includes(app.status) && (
                        <button
                          onClick={() => handleOpenSchedule(app)}
                          className="px-2 py-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          Schedule
                        </button>
                      )}

                      <button
                        onClick={() => setInspectApp(app)}
                        className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        title="View Full Profile"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Profile Inspection Modal */}
      <Modal
        isOpen={Boolean(inspectApp)}
        onClose={() => setInspectApp(null)}
        title={`Candidate: ${inspectApp?.student?.user?.full_name}`}
        maxWidth="max-w-2xl"
      >
        {inspectApp && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[11px]">Roll Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{inspectApp.student?.roll_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{inspectApp.student?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CGPA</span>
                <span className="font-bold text-indigo-700">{inspectApp.student?.cgpa}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Backlogs</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{inspectApp.student?.active_backlogs ?? 0}</span>
              </div>
            </div>

            {/* Skill Match Breakdown */}
            {inspectApp.skill_match_details && (
              <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Skill Match Engine Assessment
                  </span>
                  <span className="font-bold text-indigo-700">{inspectApp.skill_match_score}%</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {inspectApp.skill_match_details.explanation}
                </p>

                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-emerald-700">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(inspectApp.skill_match_details.matched_skills || []).map((s, idx) => (
                      <SkillBadge key={idx} skill={s} status="matched" />
                    ))}
                  </div>
                </div>

                {(inspectApp.skill_match_details.missing_skills || []).length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-rose-700">Missing Required Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inspectApp.skill_match_details.missing_skills.map((s, idx) => (
                        <SkillBadge key={idx} skill={s} status="missing" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resume viewer link */}
            {inspectApp.resume && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{inspectApp.resume.file_name}</span>
                    <span className="text-[11px] text-slate-400">Extracted competencies via PyMuPDF</span>
                  </div>
                </div>
                {inspectApp.resume.file_url && (
                  <a
                    href={inspectApp.resume.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-indigo-600 font-semibold flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>Open PDF Resume</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Profile Bio & Projects */}
            {inspectApp.student?.bio && (
              <div>
                <h5 className="font-bold text-slate-800 mb-1">Candidate Bio</h5>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
                  {inspectApp.student.bio}
                </p>
              </div>
            )}

            {inspectApp.student?.projects?.length > 0 && (
              <div>
                <h5 className="font-bold text-slate-800 mb-1">Key Projects</h5>
                <div className="space-y-1.5">
                  {inspectApp.student.projects.map((p, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/60">
                      <span className="font-bold text-slate-900 dark:text-white">{p.title}</span>
                      <span className="text-[11px] text-indigo-600 block">{p.tech_stack}</span>
                      <p className="text-slate-600 mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Current Status: <StatusBadge status={inspectApp.status} size="sm" />
              </span>
              <div className="flex items-center gap-2">
                {inspectApp.status !== 'REJECTED' && inspectApp.status !== 'SELECTED' && (
                  <button
                    onClick={() => {
                      const appToReject = inspectApp;
                      setInspectApp(null);
                      handleOpenReject(appToReject);
                    }}
                    className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Reject Candidate
                  </button>
                )}
                {inspectApp.status !== 'SELECTED' && (
                  <button
                    onClick={() => handleAccept(inspectApp.id, inspectApp.student?.user?.full_name)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Accept Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={Boolean(scheduleApp)}
        onClose={() => setScheduleApp(null)}
        title={`Schedule Interview: ${scheduleApp?.student?.user?.full_name}`}
      >
        <form onSubmit={handleConfirmSchedule} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Round Name</label>
              <input
                type="text"
                required
                value={interviewData.round_name}
                onChange={(e) => setInterviewData({ ...interviewData, round_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Mode</label>
              <select
                value={interviewData.mode}
                onChange={(e) => setInterviewData({ ...interviewData, mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              >
                <option value="ONLINE">Online Video Conference</option>
                <option value="IN_PERSON">In-Person / On Campus</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                required
                value={interviewData.scheduled_at}
                onChange={(e) => setInterviewData({ ...interviewData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                required
                value={interviewData.duration_minutes}
                onChange={(e) => setInterviewData({ ...interviewData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          {interviewData.mode === 'ONLINE' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom / Webex)</label>
              <input
                type="url"
                required
                value={interviewData.meeting_link}
                onChange={(e) => setInterviewData({ ...interviewData, meeting_link: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Venue / Room</label>
              <input
                type="text"
                required
                value={interviewData.venue}
                onChange={(e) => setInterviewData({ ...interviewData, venue: e.target.value })}
                placeholder="e.g. Placement Cell Conference Room B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interviewer Name(s)</label>
            <input
              type="text"
              value={interviewData.interviewer_names}
              onChange={(e) => setInterviewData({ ...interviewData, interviewer_names: e.target.value })}
              placeholder="e.g. Lead Architect & Staff Recruiter"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Instructions for Candidate</label>
            <textarea
              rows={2}
              value={interviewData.instructions}
              onChange={(e) => setInterviewData({ ...interviewData, instructions: e.target.value })}
              placeholder="Topics covered, coding platforms to install..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setScheduleApp(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Candidate Modal */}
      <Modal
        isOpen={Boolean(rejectingApp)}
        onClose={() => setRejectingApp(null)}
        title="Reject Application"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to update <strong>{rejectingApp?.student?.user?.full_name}'s</strong> application to Rejected?
          </p>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rejection Remarks</label>
            <textarea
              rows={3}
              value={rejectionRemarks}
              onChange={(e) => setRejectionRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setRejectingApp(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
