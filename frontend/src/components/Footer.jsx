import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800 dark:border-slate-800/60 text-sm mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-outfit font-bold text-lg tracking-tight">CampusHire</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering university placement cells, corporate recruiters, and graduating engineers with automated eligibility and explainable matching.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" onClick={(e) => handleSectionClick(e, 'home')} className="hover:text-white transition-colors cursor-pointer">Home</a>
              </li>
              <li>
                <a href="#features" onClick={(e) => handleSectionClick(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Features</a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleSectionClick(e, 'about')} className="hover:text-white transition-colors cursor-pointer">About</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              </li>
            </ul>
          </div>

          {/* System info */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Platform Features</h4>
            <ul className="space-y-2 text-xs">
              <li>Automatic Eligibility Screening</li>
              <li>PyMuPDF Resume Parsing</li>
              <li>Explainable Skill Matching</li>
              <li>Interview Scheduling Suite</li>
              <li>Real-time Placement Analytics</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Placement Cell Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>placements@campushire.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>+91 (080) 2345-6789</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Campus Placement Bureau, Academic Block IV</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusHire System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">University Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
