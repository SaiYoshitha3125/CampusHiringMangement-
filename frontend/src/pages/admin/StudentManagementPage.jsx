import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/students';
import SkillBadge from '../../components/SkillBadge';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (searchTerm) params.search = searchTerm;

      const data = await studentsApi.listAllStudentsAdmin(params);
      setStudents(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDept]);

  const handleToggleEligibility = async (id, currentStatus) => {
    const action = currentStatus ? 'suspend placement eligibility for' : 'reinstate placement eligibility for';
    if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;

    try {
      await studentsApi.togglePlacementEligibility(id);
      setActionSuccess('Student placement eligibility updated.');
      fetchStudents();
    } catch (err) {
      alert('Failed to update eligibility.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Student Directory & Eligibility</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered student profiles, verify graduation batches, and manage campus drive clearance.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or institutional email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics</option>
            <option value="Electrical">Electrical</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading student directory...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-12 text-center text-slate-400 text-xs">
          No students found matching your criteria.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Candidate</th>
                  <th className="py-3 px-4">Department & Batch</th>
                  <th className="py-3 px-4">CGPA & Backlogs</th>
                  <th className="py-3 px-4">Competencies</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{st.user?.full_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {st.roll_number} • {st.user?.email}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{st.department}</span>
                      <span className="block text-[11px] text-slate-400">Class of {st.graduation_year}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-indigo-700">{st.cgpa} CGPA</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {st.active_backlogs === 0 ? 'No Active Backlogs' : `${st.active_backlogs} Active Backlog(s)`}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(st.technical_skills || []).slice(0, 3).map((s, idx) => (
                          <SkillBadge key={idx} skill={s} />
                        ))}
                        {(st.technical_skills || []).length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{st.technical_skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {st.is_placement_eligible ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleToggleEligibility(st.id, st.is_placement_eligible)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          st.is_placement_eligible
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {st.is_placement_eligible ? 'Suspend' : 'Clear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
