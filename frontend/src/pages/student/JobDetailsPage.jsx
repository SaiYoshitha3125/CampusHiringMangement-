import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { applicationsApi } from '../../api/applications';
import { studentsApi } from '../../api/students';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../../components/SkillBadge';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ApplyJobModal from '../../components/ApplyJobModal';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  Send,
  ArrowLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStudent, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [skillMatch, setSkillMatch] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const jobData = await jobsApi.getJob(id);
        setJob(jobData);

        if (isAuthenticated && isStudent) {
          const [eligData, matchData, resData] = await Promise.all([
            jobsApi.checkEligibility(id).catch(() => null),
            jobsApi.checkSkillMatch(id).catch(() => null),
            studentsApi.listResumes().catch(() => []),
          ]);

          setEligibility(eligData);
          setSkillMatch(matchData);
          const resumeList = Array.isArray(resData) ? resData : resData.results || [];
          setResumes(resumeList);
          const primary = resumeList.find(r => r.is_primary) || resumeList[0];
          if (primary) setSelectedResumeId(primary.id);
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, isAuthenticated, isStudent]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      await applicationsApi.apply(id, selectedResumeId || null);
      setApplySuccess('Application submitted successfully!');
      setShowApplyModal(false);
      setTimeout(() => {
        navigate('/student/applications');
      }, 1200);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data?.reasons) {
        setApplyError(`Ineligible: ${data.reasons.join('; ')}`);
      } else {
        setApplyError(data?.detail || data?.job_id || 'Failed to submit application.');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Job posting not found</h2>
        <Link to="/jobs" className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">
          Return to Job Board
        </Link>
      </div>
    );
  }

  const isEligible = eligibility?.is_eligible;
  const hasApplied = job.has_applied || eligibility?.has_applied;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all jobs
        </Link>
      </div>

      {applySuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{applySuccess} Redirecting to your applications pipeline...</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center shrink-0 font-outfit">
              {job.company?.name ? job.company.name[0] : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {job.company?.name}
                </span>
                {job.company?.is_verified && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Verified Company
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit mt-1">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location} ({job.work_mode})
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {job.job_type.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Apply before {new Date(job.application_deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs text-slate-400 font-medium">Offered CTC / Compensation</span>
            <span className="text-2xl font-black font-outfit text-slate-900 text-emerald-600">
              {job.salary_display || 'Competitive Package'}
            </span>

            {/* Apply Action Button */}
            {isStudent && (
              <div className="mt-2">
                {hasApplied ? (
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Applied on {job.my_application_status ? `[${job.my_application_status}]` : 'Record'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    disabled={!isEligible}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                      isEligible
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-md'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEligible ? 'Submit Application' : 'Ineligible for Job'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Screening Breakdown & Skill Match Banner */}
        {isStudent && eligibility && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Automatic Eligibility Screening Box */}
            <div className={`p-4 rounded-xl border ${
              isEligible ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`} />
                  <h4 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                    Automatic Eligibility Screening
                  </h4>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isEligible ? 'Eligible to Apply' : 'Ineligible'}
                </span>
              </div>

              {/* Granular checks */}
              <div className="space-y-1.5 mt-3 text-xs">
                {eligibility.criteria_checks?.map((check, cIdx) => (
                  <div key={cIdx} className="flex items-center justify-between py-1 border-b border-slate-100/80">
                    <span className="text-slate-600 dark:text-slate-400">{check.name}</span>
                    <span className={`flex items-center gap-1 font-medium ${
                      check.passed ? 'text-emerald-700' : 'text-rose-700 font-semibold'
                    }`}>
                      {check.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{check.message || (check.passed ? 'Passed' : 'Failed')}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Reasons list if failed */}
              {!isEligible && eligibility.failure_reasons?.length > 0 && (
                <div className="mt-3 p-2.5 bg-rose-100/60 rounded-lg text-rose-800 text-[11px] space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Rejection Reasons:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {eligibility.failure_reasons.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Explainable Skill Matching Box */}
            {skillMatch && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 font-outfit uppercase tracking-wider">
                      Explainable Skill Match
                    </h4>
                  </div>
                  <span className="text-sm font-extrabold text-indigo-700 font-outfit">
                    {skillMatch.match_percentage !== null ? `${skillMatch.match_percentage}%` : 'Not available'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {skillMatch.explanation}
                </p>

                {/* Matched skills */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700">Matched Competencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skillMatch.matched_skills?.map((s, idx) => (
                        <SkillBadge key={idx} skill={s} status="matched" />
                      ))}
                      {(!skillMatch.matched_skills || skillMatch.matched_skills.length === 0) && (
                        <span className="text-slate-400 italic text-[11px]">No skill overlap detected</span>
                      )}
                    </div>
                  </div>

                  {skillMatch.missing_skills?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-rose-700">Missing Requirements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skillMatch.missing_skills?.map((s, idx) => (
                          <SkillBadge key={idx} skill={s} status="missing" />
                        ))}
                      </div>
                    </div>
                  )}

                  {skillMatch.suggested_skills?.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-700">Suggested to Learn:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skillMatch.suggested_skills?.map((s, idx) => (
                          <SkillBadge key={idx} skill={s} status="suggested" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content: Description, Responsibilities & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-outfit">About the Role</h3>
            <div className="prose prose-sm text-slate-600 max-w-none whitespace-pre-line leading-relaxed">
              {job.description}
            </div>

            {job.responsibilities && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <h4 className="text-sm font-bold text-slate-900 font-outfit mb-2">Key Responsibilities</h4>
                <div className="prose prose-sm text-slate-600 max-w-none whitespace-pre-line leading-relaxed">
                  {job.responsibilities}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: Criteria & Required Skills */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Required Technical Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {(job.required_skills || []).map((skill, sIdx) => (
                <SkillBadge key={sIdx} skill={skill} />
              ))}
            </div>

            {job.nice_to_have_skills?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nice to Have</h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.nice_to_have_skills.map((skill, sIdx) => (
                    <SkillBadge key={sIdx} skill={skill} status="suggested" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs text-xs space-y-2.5">
            <h4 className="font-bold text-slate-900 font-outfit mb-2">Eligibility Summary</h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400">Min CGPA</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{job.eligibility_criteria?.min_cgpa}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400">Allowed Backlogs</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{job.eligibility_criteria?.max_active_backlogs ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-400">Eligible Batches</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {job.eligibility_criteria?.eligible_graduation_years?.join(', ') || 'All Batches'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Eligible Departments</span>
              <span className="font-semibold text-slate-800 text-right">
                {job.eligibility_criteria?.eligible_departments?.join(', ') || 'All Departments'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Apply Modal with Resume Upload & Details Editing */}
      {showApplyModal && (
        <ApplyJobModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            navigate('/student/applications');
          }}
        />
      )}
    </div>
  );
}
