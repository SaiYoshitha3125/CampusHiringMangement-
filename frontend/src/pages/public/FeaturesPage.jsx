import React from 'react';
import {
  ShieldCheck,
  FileSearch,
  Sparkles,
  Calendar,
  BarChart4,
  BellRing,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function FeaturesPage() {
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
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-outfit">
            Engineered for Placement Excellence
          </h1>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Every module in CampusHire is built to replace manual administrative friction with fast, reliable, explainable workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">{f.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
