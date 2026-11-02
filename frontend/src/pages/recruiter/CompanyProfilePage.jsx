import React, { useEffect, useState } from 'react';
import { recruitersApi } from '../../api/recruiters';
import { Building, Globe, MapPin, Save, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    description: '',
    website: '',
    industry: 'Technology',
    location: '',
    is_verified: false,
    verified_at: null,
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    recruitersApi.getMyCompany()
      .then((data) => setCompany(data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load company profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await recruitersApi.updateMyCompany(company);
      setCompany(updated);
      setSuccess('Company profile saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Could not update company profile.');
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Corporate Partner Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your organization's campus recruitment presence, verified employer status, and details visible to students.
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

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Verification Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          company.is_verified ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-5 h-5 ${company.is_verified ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <p className="text-xs font-bold">
                {company.is_verified ? 'Verified Campus Recruitment Partner' : 'Verification Under Review'}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {company.is_verified
                  ? `Verified by University Placement Bureau on ${new Date(company.verified_at).toLocaleDateString()}`
                  : 'Placement Cell will review and verify your corporate domain before publishing job postings.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
            <input
              type="text"
              name="name"
              required
              value={company.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
            <input
              type="text"
              name="industry"
              value={company.industry}
              onChange={handleChange}
              placeholder="e.g. Technology, FinTech, Automotive"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Website</label>
            <input
              type="url"
              name="website"
              value={company.website}
              onChange={handleChange}
              placeholder="https://company.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hiring Office / Location</label>
            <input
              type="text"
              name="location"
              value={company.location}
              onChange={handleChange}
              placeholder="Bangalore / Hyderabad / Remote"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">About Company & Work Culture</label>
          <textarea
            name="description"
            rows={4}
            value={company.description}
            onChange={handleChange}
            placeholder="Describe your organization, mission, and career growth for university hires..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Company Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
