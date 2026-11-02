import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/students';
import SkillBadge from '../../components/SkillBadge';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.listResumes();
      setResumes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccess('');

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF documents (.pdf) are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await studentsApi.uploadResume(formData);
      setSuccess('Resume uploaded and parsed via PyMuPDF successfully!');
      setSelectedFile(null);
      await fetchResumes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Upload failed. Please ensure the PDF is valid.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await studentsApi.deleteResume(id);
      setSuccess('Resume removed.');
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete resume.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Resume Management & Skill Extraction</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your PDF resume. Our PyMuPDF parsing engine automatically extracts competencies and feeds the skill-matching engine.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 font-outfit mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-600" /> Upload or Replace PDF Resume
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <FileText className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {selectedFile ? selectedFile.name : 'Select PDF resume file from your computer'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 10 MB • Format: .pdf</p>

            <label className="mt-3 inline-block px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
              <span>{selectedFile ? 'Change File' : 'Browse Files'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Skills...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Process Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Resumes List */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 font-outfit pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Uploaded Resumes ({resumes.length})</span>
          <span className="text-[11px] font-normal text-slate-400">Primary resume will be submitted by default</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No resume uploaded yet. Upload your PDF resume above to enable automated skill matching.
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-xl border transition-all ${
                  res.is_primary
                    ? 'border-indigo-300 bg-indigo-50/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{res.file_name}</h4>
                        {res.is_primary && (
                          <span className="bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Active Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Uploaded {new Date(res.uploaded_at).toLocaleDateString()}
                        </span>
                        <span>• {(res.file_size_bytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.file_url && (
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>View PDF</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Extraction Result Section */}
                <div className="mt-3 pt-1">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Extracted Technical Competencies ({res.extracted_skills?.length || 0})</span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        res.extraction_status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : res.extraction_status === 'UNREADABLE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {res.extraction_status === 'SUCCESS' ? 'Extracted via PyMuPDF' : res.extraction_status}
                    </span>
                  </div>

                  {res.extraction_notes && (
                    <p className="text-[11px] text-slate-500 mb-2 italic">
                      {res.extraction_notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {(res.extracted_skills || []).map((skill, sIdx) => (
                      <SkillBadge key={sIdx} skill={skill} />
                    ))}
                    {(res.extracted_skills || []).length === 0 && (
                      <p className="text-[11px] text-slate-400">
                        No normalized skills detected from this document text.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
