import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { recruitersApi } from '../../api/recruiters';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../../components/SkillBadge';
import {
  Briefcase,
  ShieldCheck,
  Code,
  Save,
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';

const ALL_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil'
];

const ALL_YEARS = [2025, 2026, 2027, 2028];

export default function CreateEditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companies, setCompanies] = useState([]);

  // Form state
  const [jobData, setJobData] = useState({
    title: '',
    company_id: '',
    company_name: '',
    job_type: 'FULL_TIME',
    work_mode: 'ON_SITE',
    location: '',
    salary_min: '',
    salary_max: '',
    salary_display: '',
    description: '',
    responsibilities: '',
    application_deadline: '',
    required_skills: [],
    nice_to_have_skills: [],
    eligibility: {
      min_cgpa: '7.00',
      eligible_departments: ['Computer Science', 'Information Technology'],
      eligible_graduation_years: [2026],
      max_active_backlogs: 0,
      max_total_backlogs_history: 2,
      min_skill_match_percentage: 40,
    }
  });

  const [reqSkillInput, setReqSkillInput] = useState('');
  const [niceSkillInput, setNiceSkillInput] = useState('');

  // Set default deadline to 30 days in future if creating
  useEffect(() => {
    if (!isEditing && !jobData.application_deadline) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      defaultDate.setHours(23, 59, 0, 0);
      setJobData(prev => ({
        ...prev,
        application_deadline: defaultDate.toISOString().slice(0, 16)
      }));
    }
  }, [isEditing]);

  useEffect(() => {
    if (isAdmin) {
      recruitersApi.listCompanies()
        .then(data => {
          const list = Array.isArray(data) ? data : data.results || [];
          setCompanies(list);
          if (list.length > 0 && !jobData.company_id) {
            setJobData(prev => ({ ...prev, company_id: list[0].id }));
          }
        })
        .catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isEditing) {
      jobsApi.getJob(id)
        .then((data) => {
          setJobData({
            title: data.title || '',
            company_id: data.company?.id || '',
            company_name: data.company?.name || '',
            job_type: data.job_type || 'FULL_TIME',
            work_mode: data.work_mode || 'ON_SITE',
            location: data.location || '',
            salary_min: data.salary_min || '',
            salary_max: data.salary_max || '',
            salary_display: data.salary_display || '',
            description: data.description || '',
            responsibilities: data.responsibilities || '',
            application_deadline: data.application_deadline ? data.application_deadline.slice(0, 16) : '',
            required_skills: data.required_skills || [],
            nice_to_have_skills: data.nice_to_have_skills || [],
            eligibility: data.eligibility_criteria || {
              min_cgpa: '7.00',
              eligible_departments: ['Computer Science', 'Information Technology'],
              eligible_graduation_years: [2026],
              max_active_backlogs: 0,
              max_total_backlogs_history: 2,
              min_skill_match_percentage: 40,
            }
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [name]: value
      }
    }));
  };

  const toggleDepartment = (dept) => {
    setJobData(prev => {
      const current = prev.eligibility.eligible_departments || [];
      const updated = current.includes(dept)
        ? current.filter(d => d !== dept)
        : [...current, dept];
      return {
        ...prev,
        eligibility: { ...prev.eligibility, eligible_departments: updated }
      };
    });
  };

  const toggleYear = (yr) => {
    setJobData(prev => {
      const current = prev.eligibility.eligible_graduation_years || [];
      const updated = current.includes(yr)
        ? current.filter(y => y !== yr)
        : [...current, yr];
      return {
        ...prev,
        eligibility: { ...prev.eligibility, eligible_graduation_years: updated }
      };
    });
  };

  const addReqSkill = (e) => {
    e.preventDefault();
    if (!reqSkillInput.trim()) return;
    const s = reqSkillInput.trim();
    if (!jobData.required_skills.includes(s)) {
      setJobData(prev => ({ ...prev, required_skills: [...prev.required_skills, s] }));
    }
    setReqSkillInput('');
  };

  const removeReqSkill = (skill) => {
    setJobData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }));
  };

  const addNiceSkill = (e) => {
    e.preventDefault();
    if (!niceSkillInput.trim()) return;
    const s = niceSkillInput.trim();
    if (!jobData.nice_to_have_skills.includes(s)) {
      setJobData(prev => ({ ...prev, nice_to_have_skills: [...prev.nice_to_have_skills, s] }));
    }
    setNiceSkillInput('');
  };

  const removeNiceSkill = (skill) => {
    setJobData(prev => ({
      ...prev,
      nice_to_have_skills: prev.nice_to_have_skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { ...jobData };
      if (!payload.salary_min) delete payload.salary_min;
      if (!payload.salary_max) delete payload.salary_max;

      if (isEditing) {
        await jobsApi.updateJob(id, payload);
        setSuccess('Job updated successfully!');
      } else {
        await jobsApi.createJob(payload);
        setSuccess(
          isAdmin
            ? '🎉 Campus Drive Job created and published live to all student accounts!'
            : 'Job posting submitted for Placement Cell approval!'
        );
      }

      setTimeout(() => {
        navigate(isAdmin ? '/admin/jobs' : '/recruiter/jobs');
      }, 1300);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || err.response?.data?.error || JSON.stringify(err.response?.data);
      setError(detail || 'Failed to save job posting. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">
            {isEditing ? 'Edit Job Posting' : isAdmin ? 'Post New Campus Recruitment Drive' : 'Create New Job Opportunity'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? 'Create a campus job posting that is instantly published to all student accounts.'
              : 'Specify job requirements and configure automated candidate eligibility screening rules.'}
          </p>
        </div>
        <button
          onClick={() => navigate(isAdmin ? '/admin/jobs' : '/recruiter/jobs')}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin Company Selector */}
        {isAdmin && !isEditing && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Target Hiring Company
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Existing Registered Company
                </label>
                <select
                  value={jobData.company_id}
                  onChange={(e) => setJobData(prev => ({ ...prev, company_id: e.target.value, company_name: '' }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Or enter custom company name below --</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.industry || 'Tech'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Or Create / Specify Company Name
                </label>
                <input
                  type="text"
                  value={jobData.company_name}
                  onChange={(e) => setJobData(prev => ({ ...prev, company_name: e.target.value, company_id: '' }))}
                  placeholder="e.g. Google India, Microsoft, Campus Placement Cell"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Basic Job Details */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Position Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                name="title"
                required
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g. Associate Software Engineer (Backend)"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
              <select
                name="job_type"
                value={jobData.job_type}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="INTERN_TO_FTE">Intern to FTE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
              <select
                name="work_mode"
                value={jobData.work_mode}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ON_SITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Location</label>
              <input
                type="text"
                name="location"
                required
                value={jobData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore / Hyderabad / Campus"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Compensation / CTC Display</label>
              <input
                type="text"
                name="salary_display"
                value={jobData.salary_display}
                onChange={handleChange}
                placeholder="e.g. 14-18 LPA or ₹45,000/month"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Application Deadline</label>
            <input
              type="datetime-local"
              name="application_deadline"
              required
              value={jobData.application_deadline}
              onChange={handleChange}
              className="w-full sm:w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Description</label>
            <textarea
              name="description"
              rows={4}
              required
              value={jobData.description}
              onChange={handleChange}
              placeholder="Outline the mission of the role, day-to-day work, engineering team overview..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Responsibilities</label>
            <textarea
              name="responsibilities"
              rows={3}
              value={jobData.responsibilities}
              onChange={handleChange}
              placeholder="List core deliverables, code ownership, technical expectations..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Automated Eligibility Screening Rules */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Automated Eligibility Filters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimum CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="min_cgpa"
                value={jobData.eligibility.min_cgpa}
                onChange={handleEligibilityChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Active Backlogs</label>
              <input
                type="number"
                min="0"
                max="10"
                name="max_active_backlogs"
                value={jobData.eligibility.max_active_backlogs}
                onChange={handleEligibilityChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min Skill Match %</label>
              <input
                type="number"
                min="0"
                max="100"
                name="min_skill_match_percentage"
                value={jobData.eligibility.min_skill_match_percentage}
                onChange={handleEligibilityChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Eligible Engineering Departments</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPARTMENTS.map(dept => {
                const selected = jobData.eligibility.eligible_departments?.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Eligible Graduation Batches</label>
            <div className="flex flex-wrap gap-2">
              {ALL_YEARS.map(yr => {
                const selected = jobData.eligibility.eligible_graduation_years?.includes(yr);
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    Batch {yr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Required & Nice-to-Have Skills */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Technical Competencies
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mandatory Technical Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type skill & press Enter (e.g. Python, Django, PostgreSQL, Docker)..."
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addReqSkill(e); }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addReqSkill}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {jobData.required_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeReqSkill(skill)}
                    className="text-indigo-400 hover:text-indigo-700 dark:hover:text-white font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nice-to-Have Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Kubernetes, Redis, GraphQL..."
                value={niceSkillInput}
                onChange={(e) => setNiceSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addNiceSkill(e); }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={addNiceSkill}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {jobData.nice_to_have_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeNiceSkill(skill)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin/jobs' : '/recruiter/jobs')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving
                ? 'Publishing...'
                : isEditing
                ? 'Save Changes'
                : isAdmin
                ? 'Publish Job to All Students'
                : 'Submit Job for Approval'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
