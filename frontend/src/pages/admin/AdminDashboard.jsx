import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/analytics';
import MetricCard from '../../components/MetricCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Users,
  Building,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getDepartments(),
      analyticsApi.getFunnel(),
      analyticsApi.getTrends(),
    ])
      .then(([ov, dept, fn, tr]) => {
        setOverview(ov);
        setDepartments(dept || []);
        setFunnel(fn || []);
        setTrends(tr || []);
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

  const formatLPA = (val) => {
    if (!val) return '0 LPA';
    return `${(val / 100000).toFixed(1)} LPA`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Placement Cell Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time university placement metrics, company approvals, and departmental hiring audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/jobs/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Audit & CSV Exports</span>
          </Link>
        </div>
      </div>

      {/* Real Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Placement Rate"
          value={`${overview?.placement_percentage || 0}%`}
          subtitle={`${overview?.placed_students_count || 0} of ${overview?.eligible_students || 0} students placed`}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Registered Students"
          value={overview?.total_students || 0}
          subtitle={`${overview?.eligible_students || 0} eligible candidates`}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Participating Companies"
          value={overview?.total_companies || 0}
          subtitle={`${overview?.verified_companies || 0} verified corporate partners`}
          icon={Building}
          color="indigo"
        />
        <MetricCard
          title="Peak Package"
          value={formatLPA(overview?.highest_package)}
          subtitle={`Avg: ${formatLPA(overview?.average_package)}`}
          icon={Award}
          color="amber"
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/jobs"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pending Job Approvals</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Vet corporate job descriptions</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/recruiters"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Recruiter Verification</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Approve company accounts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/students"
          className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Directory</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage placement eligibility</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Placement Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 font-outfit">Department-Wise Placement Rates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Placed vs Total Registered Candidates per Department</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="total_students" name="Registered" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed_students" name="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recruitment Trends Over Time */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 font-outfit">Monthly Recruitment Velocity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Applications submitted and selections rolled out</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="applications" name="Applications" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="selections" name="Selections" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
