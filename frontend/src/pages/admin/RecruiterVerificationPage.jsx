import React, { useEffect, useState } from 'react';
import { recruitersApi } from '../../api/recruiters';
import StatusBadge from '../../components/StatusBadge';
import {
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  AlertCircle
} from 'lucide-react';

export default function RecruiterVerificationPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await recruitersApi.listCompanies();
      setCompanies(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerify = async (id, companyName) => {
    try {
      await recruitersApi.verifyCompany(id);
      setActionSuccess(`Company '${companyName}' and its recruiter accounts verified successfully!`);
      fetchCompanies();
    } catch (err) {
      alert('Verification failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Recruiter & Company Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review corporate employer registrations, verify domains, and authorize campus recruitment drives.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading company records...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center text-slate-400 text-xs">
          No company records registered.
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {comp.name ? comp.name[0] : 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{comp.name}</h3>
                    {comp.is_verified ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Partner
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Verification Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-2">
                    {comp.description || 'Corporate recruitment partner.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span>Industry: <strong className="text-slate-600 dark:text-slate-400">{comp.industry}</strong></span>
                    {comp.location && <span>• Location: <strong className="text-slate-600 dark:text-slate-400">{comp.location}</strong></span>}
                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {!comp.is_verified ? (
                  <button
                    onClick={() => handleVerify(comp.id, comp.name)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Authorize</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Authorized
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
