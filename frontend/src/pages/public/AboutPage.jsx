import React from 'react';
import { GraduationCap, ShieldCheck, Target, Award, Code2, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
            <GraduationCap className="w-4 h-4" /> About CampusHire
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-outfit">
            Revolutionizing University Placements through Intelligent Automation
          </h1>
          <p className="mt-4 text-slate-600 text-base leading-relaxed">
            CampusHire was architected to eliminate manual spreadsheets, opaque eligibility rejections, and disconnected recruitment tracking during university placement drives.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-outfit text-base">Our Mission</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              To connect graduating students directly with top-tier corporate employers while equipping university placement officers with real-time auditability and transparent compliance tools.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-outfit text-base">Integrity & Fairness</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Zero bias and complete algorithmic transparency. Every candidate receives a clear mathematical explanation of their skill-matching score and granular eligibility feedback.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 font-outfit text-base">Measurable Impact</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Drastically reduced recruitment cycle times from weeks to days, zero duplicate applications, and seamless tracking from initial application to offer rollout.
            </p>
          </div>
        </div>

        {/* Architecture Narrative */}
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-xs mb-16">
          <h2 className="text-xl font-bold font-outfit text-slate-900 mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            Engineering & Technology Architecture
          </h2>
          <div className="prose prose-sm text-slate-600 max-w-none space-y-3 leading-relaxed">
            <p>
              CampusHire is designed as a decoupled full-stack platform. The backend is built in <strong>Python & Django REST Framework</strong> with role-based JWT authentication, model-level validation, and database transactions that prevent race conditions in interview scheduling and duplicate applications.
            </p>
            <p>
              The frontend is crafted in <strong>React 19 with Vite</strong>, styled with a modern <strong>Tailwind CSS</strong> SaaS aesthetic, and powered by <strong>Recharts</strong> for responsive data visualizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
