import React from 'react';
import { Sparkles, ArrowRight, X, FileSearch, ShieldCheck, MailCheck, CalendarClock, HelpCircle } from 'lucide-react';

interface WelcomeBannerProps {
  onDismiss: () => void;
  onLoadSample: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss, onLoadSample }) => {
  return (
    <div className="bg-linear-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 sm:p-7 mb-8 shadow-sm relative overflow-hidden border border-indigo-700/50">
      {/* Background Decorative Accent */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        title="Dismiss welcome guide"
        aria-label="Dismiss welcome guide"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="max-w-3xl mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>Welcome to Recruiter Inbox Assistant</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          Make sense of recruiter outreach before you reply
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Entry-level software roles often come with unstated pay, agency placements, or commitment clauses.
          This tool analyzes recruiter emails, LinkedIn InMails, and job descriptions side-by-side to extract verified terms, spot discrepancies, and draft professional replies.
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-2">
            <FileSearch className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white mb-1">Dual-Input Analysis</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Combine the recruiter's message and the linked job posting for complete term extraction.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white mb-1">Source Attribution</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Every fact is labeled (From message, From posting, Inferred), and any contradictions are flagged.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 mb-2">
            <MailCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white mb-1">Custom Draft Replies</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Generate email-ready replies in Standard, Direct, or Casual tones with clarifying questions built in.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300 mb-2">
            <CalendarClock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold text-white mb-1">Follow-up Tracker</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Save opportunities, schedule follow-up dates, take notes, and track your active application pipeline.
          </p>
        </div>
      </div>

      {/* Where to Start & Action Bar */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-indigo-200">
          <HelpCircle className="w-4 h-4 text-indigo-300 shrink-0" />
          <span>
            <strong>Where to start:</strong> Paste a recruiter's email in the box below, or test with a sample message.
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            onClick={onLoadSample}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
          >
            Try with sample
          </button>
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-xs transition-colors"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
