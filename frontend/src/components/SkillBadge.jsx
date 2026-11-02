import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function SkillBadge({ skill, status = 'neutral', onRemove }) {
  let styles = 'bg-slate-100 text-slate-800 border-slate-200';
  let icon = null;

  if (status === 'matched') {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    icon = <Check className="w-3 h-3 text-emerald-600" />;
  } else if (status === 'missing') {
    styles = 'bg-rose-50 text-rose-800 border-rose-200';
    icon = <X className="w-3 h-3 text-rose-500" />;
  } else if (status === 'suggested') {
    styles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    icon = <Sparkles className="w-3 h-3 text-indigo-500" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${styles}`}>
      {icon}
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill)}
          className="ml-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
