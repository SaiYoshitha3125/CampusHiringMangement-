import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recruitersApi } from '../../api/recruiters';
import { jobsApi } from '../../api/jobs';
import { applicationsApi } from '../../api/applications';
import { interviewsApi } from '../../api/interviews';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import {
  Building,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [compData, myJobs, appsData, interData] = await Promise.all([
          recruitersApi.getMyCompany().catch(() => null),
          jobsApi.getMyJobs().catch(() => []),
          applicationsApi.listApplications().catch(() => ({ results: [] })),
          interviewsApi.getUpcomingInterviews().catch(() => []),
        ]);

        setCompany(compData);
        setJobs(Array.isArray(myJobs) ? myJobs : myJobs.results || []);
        setApplicants(Array.isArray(appsData) ? appsData : appsData.results || []);
        setUpcomingInterviews(interData || []);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.status === 'APPROVED');
  const shortlistedCount = applicants.filter(a => a.status === 'SHORTLISTED').length;
  const selectedCount = applicants.filter(a => a.status === 'SELECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Company Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {company?.industry || 'Corporate Partner'}
              </span>
              {company?.is_verified ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Placement Cell Verified
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Awaiting University Verification
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-outfit">
              {company?.name || 'Recruiter Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Welcome back, {user?.first_name}! Manage job postings, review qualified candidates, and coordinate campus technical interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/jobs/new"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Job</span>
            </Link>
            <Link
              to="/recruiter/company"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Company Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Postings"
          value={activeJobs.length}
          icon={Briefcase}
          color="indigo"
          subtitle={`${jobs.length} total created`}
        />
        <MetricCard
          title="Total Applicants"
          value={applicants.length}
          icon={Users}
          color="blue"
          subtitle="Screened candidates"
        />
        <MetricCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={CheckCircle2}
          color="purple"
          subtitle="Ready for interview"
        />
        <MetricCard
          title="Selected Hires"
          value={selectedCount}
          icon={ShieldCheck}
          color="emerald"
          subtitle="Offers confirmed"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Applicants Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm font-outfit">Recent Candidate Pipeline</h3>
            </div>
            <Link to="/recruiter/applicants" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Manage All Applicants <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {applicants.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No applications received yet. Qualified candidates will appear here as they apply.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applicants.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {app.student?.user?.full_name} ({app.student?.roll_number})
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Applied for <strong className="text-slate-700 dark:text-slate-300">{app.job?.title}</strong> • {app.student?.department} • CGPA: {app.student?.cgpa}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.skill_match_score !== null && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                        {app.skill_match_score}% Match
                      </span>
                    )}
                    <StatusBadge status={app.status} size="sm" />
                    <Link
                      to="/recruiter/applicants"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col: Upcoming Scheduled Interviews */}
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm font-outfit">Scheduled Interviews</h3>
            </div>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No pending interviews scheduled for your postings.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((item) => (
                <div key={item.id} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{item.candidate_name}</span>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      {item.round_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{item.job_title}</p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
