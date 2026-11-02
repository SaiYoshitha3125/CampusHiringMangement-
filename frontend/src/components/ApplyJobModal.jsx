import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsApi } from '../api/students';
import { applicationsApi } from '../api/applications';
import { jobsApi } from '../api/jobs';
import Modal from './Modal';
import SkillBadge from './SkillBadge';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  Sparkles,
  Send,
  Loader2,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';

export default function ApplyJobModal({ job, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [skillMatch, setSkillMatch] = useState(null);

  // Editable student details
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    cgpa: '',
    graduationYear: '',
    statement: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !job) return;

    setErrorMsg('');
    setSuccessMsg('');
    setNewResumeFile(null);
    setLoading(true);

    const initData = async () => {
      try {
        const [profData, resumeData, eligData, matchData] = await Promise.all([
          studentsApi.getProfile().catch(() => null),
          studentsApi.listResumes().catch(() => []),
          jobsApi.checkEligibility(job.id).catch(() => null),
          jobsApi.checkSkillMatch(job.id).catch(() => null),
        ]);

        setProfile(profData);
        const resumeList = Array.isArray(resumeData) ? resumeData : resumeData.results || [];
        setResumes(resumeList);

        const primaryResume = resumeList.find(r => r.is_primary) || resumeList[0];
        if (primaryResume) {
          setSelectedResumeId(primaryResume.id);
        }

        setEligibility(eligData);
        setSkillMatch(matchData);

        setFormData({
          fullName: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          email: user?.email || '',
          phone: user?.phone || '',
          department: profData?.department || 'Computer Science',
          cgpa: profData?.cgpa ? String(profData.cgpa) : '8.00',
          graduationYear: profData?.graduation_year ? String(profData.graduation_year) : '2026',
          statement: ''
        });
      } catch (err) {
        console.error('Error preparing apply modal:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isOpen, job, user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF resume file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    setErrorMsg('');
    setNewResumeFile(file);
    setSelectedResumeId('NEW');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedResumeId && !newResumeFile) {
      setErrorMsg('Please select an existing resume or upload a new PDF resume.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Update student profile details if modified
      const profilePayload = {
        department: formData.department,
        cgpa: parseFloat(formData.cgpa) || 8.0,
        graduation_year: parseInt(formData.graduationYear, 10) || 2026,
      };
      await studentsApi.updateProfile(profilePayload).catch((err) => {
        console.warn('Profile sync non-fatal warning:', err);
      });

      // 2. Upload new resume if attached
      let finalResumeId = selectedResumeId;
      if (newResumeFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', newResumeFile);
        const uploaded = await studentsApi.uploadResume(uploadFormData);
        finalResumeId = uploaded?.resume?.id || uploaded?.id;
      }

      // 3. Submit Job Application
      await applicationsApi.apply(job.id, finalResumeId === 'NEW' ? null : finalResumeId);

      setSuccessMsg('🎉 Application submitted successfully!');

      setTimeout(() => {
        if (onSuccess) onSuccess(job.id);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Application failed:', err);
      const data = err.response?.data;
      if (data?.reasons) {
        setErrorMsg(`Ineligible: ${data.reasons.join('; ')}`);
      } else if (data?.job_id) {
        setErrorMsg(Array.isArray(data.job_id) ? data.job_id.join(' ') : data.job_id);
      } else if (data?.detail) {
        setErrorMsg(data.detail);
      } else {
        setErrorMsg('Failed to submit application. Please check your information and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Preparing application profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Company & Role Summary */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {job.company?.name ? job.company.name[0] : 'C'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                  {job.title}
                </h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                  {job.company?.name} • {job.location} ({job.work_mode})
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Package / CTC</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-outfit">
                {job.salary_display || 'Competitive Package'}
              </span>
            </div>
          </div>

          {/* Skill Match Snippet */}
          {skillMatch && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Calculated Skill Match:
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60">
                  {skillMatch.match_percentage}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {skillMatch.matched_skills?.length || 0} skills matched
              </span>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Student Details Grid */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Applicant Information</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.fullName}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  placeholder="e.g. 8.50"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Graduation Year (Batch)
                </label>
                <input
                  type="number"
                  required
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  placeholder="e.g. 2026"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload / Selection Section */}
          <div className="pt-2">
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Resume Attachment (PDF)</span>
            </h5>

            {/* Existing Resumes */}
            {resumes.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select an existing verified resume from your profile:
                </p>
                <div className="space-y-1.5">
                  {resumes.map((res) => (
                    <label
                      key={res.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedResumeId === res.id && !newResumeFile
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="resumeOption"
                          checked={selectedResumeId === res.id && !newResumeFile}
                          onChange={() => {
                            setSelectedResumeId(res.id);
                            setNewResumeFile(null);
                          }}
                          className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-xs block">{res.file_name}</span>
                          <span className="text-[10px] text-slate-400">
                            Uploaded {new Date(res.uploaded_at).toLocaleDateString()}
                            {res.is_primary && ' • Primary Resume'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Resume */}
            <div className="mt-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                {resumes.length > 0 ? 'Or upload a different PDF resume for this job:' : 'Upload your PDF resume to apply:'}
              </p>
              <label
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  newResumeFile
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {newResumeFile ? (
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Selected: {newResumeFile.name} ({(newResumeFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Click to browse or drop your PDF resume here
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Max file size: 10MB (PDF format only)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Statement of interest (optional) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Note to Recruiter (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              placeholder="Highlight relevant projects, interest in the company, or specific role competencies..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!selectedResumeId && !newResumeFile)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
