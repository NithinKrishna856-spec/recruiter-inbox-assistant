import React from 'react';
import { Mail, Sparkles, CheckSquare, BookOpen } from 'lucide-react';

export type AppView = 'analyze' | 'tracker' | 'guide';

interface NavbarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  trackerCount: number;
  overdueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  trackerCount,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div
          onClick={() => onViewChange('analyze')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            Recruiter Inbox Assistant
          </span>
        </div>

        {/* View Switcher Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-lg">
          {/* 1. Analyze Tab */}
          <button
            onClick={() => onViewChange('analyze')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeView === 'analyze'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Analyze recruiter outreach or job postings"
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeView === 'analyze' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Analyze</span>
          </button>

          {/* 2. Tracker Tab */}
          <button
            onClick={() => onViewChange('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeView === 'tracker'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="View saved opportunities and follow-ups"
          >
            <CheckSquare className={`w-3.5 h-3.5 ${activeView === 'tracker' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Tracker</span>
            <span
              className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded-full ${
                activeView === 'tracker'
                  ? 'bg-indigo-100 text-indigo-800 font-semibold'
                  : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {trackerCount}
            </span>
            {overdueCount > 0 && (
              <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {overdueCount}
              </span>
            )}
          </button>

          {/* 3. Guide Tab */}
          <button
            onClick={() => onViewChange('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              activeView === 'guide'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Read career safety guidelines for new grads"
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeView === 'guide' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
