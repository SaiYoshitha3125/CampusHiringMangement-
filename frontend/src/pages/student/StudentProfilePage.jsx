import React, { useEffect, useState } from 'react';
import { studentsApi } from '../../api/students';
import { useAuth } from '../../context/AuthContext';
import SkillBadge from '../../components/SkillBadge';
import {
  User,
  GraduationCap,
  Award,
  Code,
  Link as LinkIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    roll_number: '',
    college_name: '',
    department: 'Computer Science',
    graduation_year: 2026,
    cgpa: '8.00',
    active_backlogs: 0,
    total_backlogs_history: 0,
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    technical_skills: [],
    projects: [],
    certifications: [],
  });

  const [skillInput, setSkillInput] = useState('');

  // New project / cert draft inputs
  const [newProject, setNewProject] = useState({ title: '', tech_stack: '', description: '', link: '' });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: 2025 });

  useEffect(() => {
    studentsApi.getProfile()
      .then((data) => {
        setFormData({
          first_name: data.user?.first_name || '',
          last_name: data.user?.last_name || '',
          phone: data.user?.phone || '',
          roll_number: data.roll_number || '',
          college_name: data.college_name || '',
          department: data.department || 'Computer Science',
          graduation_year: data.graduation_year || 2026,
          cgpa: data.cgpa || '8.00',
          active_backlogs: data.active_backlogs || 0,
          total_backlogs_history: data.total_backlogs_history || 0,
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          portfolio_url: data.portfolio_url || '',
          technical_skills: data.technical_skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
        });
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load profile details.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const skill = skillInput.trim();
    if (!formData.technical_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        technical_skills: [...prev.technical_skills, skill]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      technical_skills: prev.technical_skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    setNewProject({ title: '', tech_stack: '', description: '', link: '' });
  };

  const handleRemoveProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleAddCert = () => {
    if (!newCert.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
    setNewCert({ name: '', issuer: '', year: 2025 });
  };

  const handleRemoveCert = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await studentsApi.updateProfile(formData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please check your inputs.');
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
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Student Profile & Competencies</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your academic credentials, technical skills, and projects for campus eligibility.
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Contact Details */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <User className="w-4 h-4 text-indigo-600" /> Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Profile Summary</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Aspiring software engineer passionate about backend architectures and algorithms..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Academic & Placement Eligibility Criteria */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic & Eligibility Criteria
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / Student ID</label>
              <input
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Batch Year</label>
              <select
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA (Scale 10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                name="active_backlogs"
                value={formData.active_backlogs}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Backlogs History</label>
              <input
                type="number"
                min="0"
                name="total_backlogs_history"
                value={formData.total_backlogs_history}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills Tag Manager */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <Code className="w-4 h-4 text-indigo-600" /> Technical Skills & Competencies
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Python, React, PostgreSQL, Docker, Git..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.technical_skills.map((skill, index) => (
              <SkillBadge
                key={index}
                skill={skill}
                onRemove={handleRemoveSkill}
              />
            ))}
            {formData.technical_skills.length === 0 && (
              <p className="text-xs text-slate-400 italic">No technical skills added yet. Add skills or upload a resume to auto-populate.</p>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <Code className="w-4 h-4 text-indigo-600" /> Academic & Personal Projects
          </h3>

          <div className="space-y-3">
            {formData.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                  <p className="text-[11px] text-indigo-600 font-medium">{proj.tech_stack}</p>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add project draft form */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 space-y-3 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Add New Project</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Project Title (e.g. Distributed Key-Value Store)"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="Tech Stack (e.g. Python, gRPC, Docker)"
                value={newProject.tech_stack}
                onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Brief description of architecture and features..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium cursor-pointer"
            >
              + Add to Projects
            </button>
          </div>
        </div>

        {/* Certifications & Social Links */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
            <LinkIcon className="w-4 h-4 text-indigo-600" /> Links & Social Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Website</label>
              <input
                type="url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://myportfolio.dev"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
