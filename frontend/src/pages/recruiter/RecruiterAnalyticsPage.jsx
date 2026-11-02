import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analytics';
import MetricCard from '../../components/MetricCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export default function RecruiterAnalyticsPage() {
  const [funnel, setFunnel] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getFunnel().catch(() => []),
      analyticsApi.getOverview().catch(() => null),
    ])
      .then(([funnelData, overviewData]) => {
        setFunnel(Array.isArray(funnelData) ? funnelData : []);
        setOverview(overviewData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const recStats = overview?.recruiter_stats || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Recruitment Pipeline Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics evaluating your candidate pipeline conversion and campus hiring funnel.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Candidates"
          value={recStats.my_total_applicants || 0}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Shortlisted"
          value={recStats.my_shortlisted || 0}
          icon={TrendingUp}
          color="indigo"
        />
        <MetricCard
          title="Interviews Set"
          value={recStats.my_scheduled_interviews || 0}
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="Offers Released"
          value={recStats.my_selected || 0}
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Funnel Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-outfit">Applicant Conversion Funnel</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Stage progression from Application to Final Selection</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {funnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
