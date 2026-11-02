import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentsApi } from '../../api/students';
import { applicationsApi } from '../../api/applications';
import { interviewsApi } from '../../api/interviews';
import { jobsApi } from '../../api/jobs';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import SkillBadge from '../../components/SkillBadge';
import ApplyJobModal from '../../components/ApplyJobModal';
import {
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  Video,
  MapPin,
  TrendingUp,
  Sparkles,
  Send,
  Eye
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profData, appsData, interData, jobsData] = await Promise.all([
        studentsApi.getProfile().catch(() => null),
        applicationsApi.listApplications().catch(() => ({ results: [] })),
        interviewsApi.getUpcomingInterviews().catch(() => []),
        jobsApi.listJobs().catch(() => ({ results: [] })),
      ]);

      setProfile(profData);
      const apps = appsData.results || appsData || [];
      setApplications(apps);
      setUpcomingInterviews(interData || []);

      const appliedSet = new Set(apps.map(a => a.job?.id || a.job));
      setAppliedJobIds(appliedSet);

      const jobs = jobsData.results || jobsData || [];
      setRecommendedJobs(jobs.slice(0, 4));
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds(prev => new Set([...prev, jobId]));
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedCount = applications.filter(a => a.status === 'SELECTED' || a.status === 'ACCEPTED').length;
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-indigo-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Batch {profile?.graduation_year || 2026} • {profile?.department || 'Engineering'}
              </span>
              {profile?.is_placement_eligible !== false ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Eligible for Campus Drives
                </span>
              ) : (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Placement Hold
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-outfit">
              Welcome back, {user?.first_name || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Track your campus job applications, monitor recruiter review status, and apply for open company placement opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/resume"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-950 dark:text-white font-semibold text-xs hover:bg-indigo-50 dark:hover:bg-slate-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Resume Manager</span>
            </Link>
            <Link
              to="/jobs"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs border border-indigo-400/40 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Placement Offer Alert if Selected */}
      {selectedCount > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">🎉 Congratulations on your Placement Offer!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                You have received {selectedCount} confirmed placement offer(s) from hiring partners. Review your application details below.
              </p>
            </div>
          </div>
          <Link
            to="/student/applications"
            className="text-xs font-semibold px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
          >
            View Offers
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Applied Jobs"
          value={applications.length}
          icon={Layers}
          color="blue"
          subtitle="Total submissions"
        />
        <MetricCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={TrendingUp}
          color="indigo"
          subtitle="Screened candidates"
        />
        <MetricCard
          title="Interviews"
          value={interviewCount}
          icon={Calendar}
          color="purple"
          subtitle="Rounds scheduled"
        />
        <MetricCard
          title="Placement Status"
          value={selectedCount > 0 ? 'Placed' : 'In Process'}
          icon={CheckCircle2}
          color={selectedCount > 0 ? 'emerald' : 'amber'}
          subtitle={selectedCount > 0 ? 'Offer secured' : `Current CGPA: ${profile?.cgpa || 'N/A'}`}
        />
      </div>

      {/* Two Column Grid: Upcoming Interviews & Applications Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Active Applications Snapshot & Open Campus Drives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications Pipeline */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">My Application Pipeline</h3>
              </div>
              <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">You haven't applied to any jobs yet.</p>
                <Link
                  to="/jobs"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Browse open campus jobs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.job?.title}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">• {app.job?.company?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                        {app.skill_match_score !== null && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            Skill Match: {app.skill_match_score}%
                          </span>
                        )}
                        {app.resume && (
                          <span className="text-slate-400">
                            • Resume: {app.resume.file_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status} size="sm" />
                      <Link
                        to="/student/applications"
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Campus Drives / Recommended Jobs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">Open Campus Drives</h3>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Explore All ({recommendedJobs.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active campus drives published yet. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {recommendedJobs.map((job) => {
                  const hasApplied = appliedJobIds.has(job.id) || job.has_applied;

                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {job.company?.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {job.job_type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">{job.title}</h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                          {job.salary_display || 'Competitive Package'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{job.location} ({job.work_mode})</span>
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>

                        {hasApplied ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedJobToApply(job)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Apply</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right col: Upcoming Interviews & Profile Snapshot */}
        <div className="space-y-6">
          {/* Upcoming Interviews Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">Upcoming Interviews</h3>
              </div>
              <Link to="/student/interviews" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Calendar
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No interviews scheduled currently.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">{item.round_name}</span>
                      <span className="text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        {item.mode}
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">{item.company_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>

                    {item.meeting_link && (
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors shadow-2xs"
                      >
                        <Video className="w-3 h-3" /> Join Video Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Profile Summary Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit mb-3">Profile Competencies</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Roll Number</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.roll_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Current CGPA</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{profile?.cgpa || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Primary Resume</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {profile?.primary_resume?.file_name || 'None uploaded'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Technical Skills ({profile?.technical_skills?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.technical_skills || []).slice(0, 6).map((skill, i) => (
                  <SkillBadge key={i} skill={skill} />
                ))}
                {(profile?.technical_skills?.length || 0) > 6 && (
                  <span className="text-xs text-slate-400 self-center">
                    +{profile.technical_skills.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/student/profile"
              className="mt-4 block w-full text-center py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-300 font-semibold text-xs rounded-lg transition-colors border border-slate-200/60 dark:border-slate-600"
            >
              Update Profile Details
            </Link>
          </div>
        </div>
      </div>

      {/* Apply Job Modal */}
      {selectedJobToApply && (
        <ApplyJobModal
          job={selectedJobToApply}
          isOpen={Boolean(selectedJobToApply)}
          onClose={() => setSelectedJobToApply(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
