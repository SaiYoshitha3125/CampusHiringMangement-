import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import SkillBadge from '../../components/SkillBadge';
import ApplyJobModal from '../../components/ApplyJobModal';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowRight,
  Send,
  Eye,
  Sparkles
} from 'lucide-react';

export default function BrowseJobsPage() {
  const { isStudent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');

  // Application modal state
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (jobTypeFilter) params.job_type = jobTypeFilter;
      if (workModeFilter) params.work_mode = workModeFilter;
      if (searchTerm) params.search = searchTerm;

      const [jobsData, appsData] = await Promise.all([
        jobsApi.listJobs(params),
        isStudent ? applicationsApi.listApplications().catch(() => ({ results: [] })) : Promise.resolve({ results: [] })
      ]);

      const jobsList = Array.isArray(jobsData) ? jobsData : jobsData.results || [];
      const appsList = Array.isArray(appsData) ? appsData : appsData.results || [];
      
      const appliedSet = new Set(appsList.map(a => a.job?.id || a.job));
      setAppliedJobIds(appliedSet);
      setJobs(jobsList);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobTypeFilter, workModeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds(prev => new Set([...prev, jobId]));
    fetchJobs();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Campus Recruitment Job Board</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse verified job postings, view eligibility criteria, and submit applications directly with your resume.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, skills (e.g. Python, React)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="INTERN_TO_FTE">Intern to FTE</option>
            </select>

            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Work Modes</option>
              <option value="ON_SITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading campus job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Job Postings Match Your Search</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords or clearing your filters to see all available corporate campus opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id) || job.has_applied;

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 dark:border-indigo-800">
                        {job.company?.name ? job.company.name[0] : 'C'}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {job.company?.name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {hasApplied ? (
                      <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Applied
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                        {job.job_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">Package / CTC</span>
                      <p className="font-bold text-slate-900 dark:text-white font-outfit text-sm">
                        {job.salary_display || 'Competitive Salary'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Location & Mode</span>
                      <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location} ({job.work_mode})</span>
                      </p>
                    </div>
                  </div>

                  {/* Eligibility Summary Pill */}
                  {job.eligibility_criteria && (
                    <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700/40 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                      <span>Min CGPA: <strong>{job.eligibility_criteria.min_cgpa}</strong></span>
                      <span>Branches: <strong>{job.eligibility_criteria.eligible_departments?.length ? job.eligibility_criteria.eligible_departments.join(', ') : 'All Branches'}</strong></span>
                    </div>
                  )}

                  {/* Required Skills Badges */}
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {(job.required_skills || []).slice(0, 4).map((skill, sIdx) => (
                        <SkillBadge key={sIdx} skill={skill} />
                      ))}
                      {(job.required_skills || []).length > 4 && (
                        <span className="text-[11px] text-slate-400 self-center">
                          +{job.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer with Apply Jobs Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    {isStudent && (
                      hasApplied ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedJobToApply(job)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply Now</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
