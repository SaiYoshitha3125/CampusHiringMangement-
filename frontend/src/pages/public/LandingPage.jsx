import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  FileText,
  Users,
  Building,
  ArrowRight,
  Sparkles,
  FileSearch,
  Calendar,
  BarChart4,
  BellRing,
  Target,
  Award,
  Code2
} from 'lucide-react';
import { analyticsApi } from '../../api/analytics';

export default function LandingPage() {
  const [stats, setStats] = useState({
    total_students: 5,
    verified_companies: 5,
    active_jobs: 5,
    placement_percentage: 66.7,
    highest_package: 2800000,
  });

  useEffect(() => {
    analyticsApi.getOverview()
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: ShieldCheck,
      color: 'indigo',
      title: 'Automated Student Eligibility Screening',
      desc: 'Eliminates unqualified applications automatically before they reach recruiter queues. Validates CGPA, branch/department, graduation batch, backlog thresholds, and deadlines server-side with transparent feedback.'
    },
    {
      icon: FileSearch,
      color: 'emerald',
      title: 'PyMuPDF High-Fidelity Resume Parsing',
      desc: 'Extracts plain text and technical keywords from student PDF resumes safely on the backend. Handles scanned documents gracefully and identifies competencies across programming languages, frameworks, and databases.'
    },
    {
      icon: Sparkles,
      color: 'purple',
      title: 'Explainable Skill-Matching Engine',
      desc: 'Computes exact match percentages between candidate profiles and job requirements using a normalized taxonomy. Displays matched skills, missing prerequisites, suggested courses, and human-readable score explanations.'
    },
    {
      icon: Calendar,
      color: 'blue',
      title: 'Interview Scheduling & Calendar',
      desc: 'Recruiters can schedule technical or HR rounds with customizable meeting links, venues, and instructions. Automatically transitions application states to Interview Scheduled and syncs to student calendars.'
    },
    {
      icon: BarChart4,
      color: 'amber',
      title: 'Real-Time Placement Analytics',
      desc: 'Placement directors monitor campus placement percentages, department-wise placement distributions, average and peak salary packages, and company hiring funnels aggregated directly from live database tables.'
    },
    {
      icon: BellRing,
      color: 'rose',
      title: 'Multi-Role In-App Notifications',
      desc: 'Instant notifications for application submissions, status updates, interview schedules, recruiter verification, and job approvals with unread counters and direct action links.'
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-200">

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION (#home)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-transparent to-transparent dark:from-indigo-950/30 dark:via-transparent dark:to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Next-Generation Campus Placement Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit text-slate-900 dark:text-white leading-tight">
              Connecting Students, Recruiters & Placement Cells on <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 dark:from-indigo-400 dark:via-indigo-500 dark:to-violet-500 bg-clip-text text-transparent">One Smart Platform</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              CampusHire automates student eligibility screening, extracts resume competencies via PyMuPDF, provides explainable skill-matching percentages, and streamlines campus hiring pipelines.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 dark:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Explore Features</span>
              </a>
            </div>
          </div>

          {/* Real Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-outfit">{stats.total_students}+</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Registered Engineers</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit">{stats.verified_companies}+</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Verified Companies</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-outfit">{stats.active_jobs}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live Job Postings</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-outfit">{stats.placement_percentage}%</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ROLE WORKFLOWS SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-slate-800/50 border-y border-slate-200/80 dark:border-slate-700/40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-slate-900 dark:text-white">
              Purpose-Built for Every Recruitment Stakeholder
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Seamlessly collaborative portals for students, corporate hiring partners, and academic placement cells.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Students</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Build your profile, upload PDF resumes, check automatic eligibility across jobs, and track interview invitations in real time.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Explainable skill match percentage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Transparent failure reasons if ineligible</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Application timeline & interview calendar</span>
                </li>
              </ul>
            </div>

            {/* Recruiter */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Recruiters</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Publish job postings, configure strict CGPA/department filters, inspect candidates, schedule interviews, and roll out offers.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Configurable eligibility rules per posting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Fast applicant shortlisting & review</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Built-in interview scheduler & meeting links</span>
                </li>
              </ul>
            </div>

            {/* Placement Admin */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">Placement Administration</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Verify companies, approve postings before they go live, monitor department-wise hiring rates, and export CSV placement audits.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Job approval workflow & recruiter vetting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Interactive hiring funnel analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Audit-compliant CSV placement exports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES SECTION (#features)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-200 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
              Engineered for Placement Excellence
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Every module in CampusHire is built to replace manual administrative friction with fast, reliable, explainable workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">{f.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TECHNOLOGY HIGHLIGHTS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-slate-800/50 border-y border-slate-200/80 dark:border-slate-700/40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-slate-900 dark:text-white">
              Built on Modern Enterprise Engineering
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Engineered with Django REST Framework, SimpleJWT security, PyMuPDF parsing, and React Vite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Deterministic Skill Matching</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transparent math formula comparing normalized profile + extracted skills against job requirements.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">PyMuPDF Resume Parsing</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Reliable text extraction from uploaded PDF resumes with graceful handling of scanned or unreadable files.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Backend Eligibility Guard</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero client-side-only trust. CGPA, department, graduation year, and backlog rules are enforced by Django ORM.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Real Placement Analytics</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Live database aggregation tracking unique students placed, salary distributions, and hiring funnels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ABOUT SECTION (#about)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-200 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
              <GraduationCap className="w-4 h-4" /> About CampusHire
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-outfit">
              Revolutionizing University Placements through Intelligent Automation
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              CampusHire was architected to eliminate manual spreadsheets, opaque eligibility rejections, and disconnected recruitment tracking during university placement drives.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white font-outfit text-base">Our Mission</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                To connect graduating students directly with top-tier corporate employers while equipping university placement officers with real-time auditability and transparent compliance tools.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white font-outfit text-base">Integrity & Fairness</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero bias and complete algorithmic transparency. Every candidate receives a clear mathematical explanation of their skill-matching score and granular eligibility feedback.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white font-outfit text-base">Measurable Impact</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Drastically reduced recruitment cycle times from weeks to days, zero duplicate applications, and seamless tracking from initial application to offer rollout.
              </p>
            </div>
          </div>

          {/* Architecture */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-8 shadow-xs">
            <h3 className="text-xl font-bold font-outfit text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Engineering & Technology Architecture
            </h3>
            <div className="prose prose-sm text-slate-600 dark:text-slate-400 max-w-none space-y-3 leading-relaxed">
              <p>
                CampusHire is designed as a decoupled full-stack platform. The backend is built in <strong className="text-slate-800 dark:text-slate-200">Python & Django REST Framework</strong> with role-based JWT authentication, model-level validation, and database transactions that prevent race conditions in interview scheduling and duplicate applications.
              </p>
              <p>
                The frontend is crafted in <strong className="text-slate-800 dark:text-slate-200">React 19 with Vite</strong>, styled with a modern <strong className="text-slate-800 dark:text-slate-200">Tailwind CSS</strong> SaaS aesthetic, and powered by <strong className="text-slate-800 dark:text-slate-200">Recharts</strong> for responsive data visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA / CONTACT SECTION (#contact)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold font-outfit">Ready to Streamline Your Campus Placements?</h2>
          <p className="mt-3 text-sm text-indigo-200 max-w-xl mx-auto">
            Experience the complete, functional CampusHire system with preloaded demonstration accounts and live recruitment data.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 shadow-md transition-all"
            >
              Sign In to Demo
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 border border-indigo-400 transition-all"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
