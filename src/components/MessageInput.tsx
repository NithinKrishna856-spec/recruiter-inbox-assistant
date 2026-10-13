import React from 'react';
import { Sparkles, Trash2, ArrowRight, ShieldAlert, FileText, Info } from 'lucide-react';

interface MessageInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  jobPostingText: string;
  setJobPostingText: (text: string) => void;
  onAnalyze: () => void;
  onLoadSample?: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const messageReferencesJobPosting = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  // Check for URLs
  if (/https?:\/\/[^\s]+|www\.[^\s]+/i.test(text)) return true;
  // Check for link or posting references
  return (
    lower.includes('job link') ||
    lower.includes('the link') ||
    lower.includes('link below') ||
    lower.includes('link here') ||
    lower.includes('link above') ||
    lower.includes('link:') ||
    lower.includes('linked posting') ||
    lower.includes('job posting') ||
    lower.includes('job post') ||
    lower.includes('the posting') ||
    lower.includes('this posting') ||
    lower.includes('see posting') ||
    lower.includes('attached posting') ||
    lower.includes('full posting') ||
    lower.includes('job description') ||
    lower.includes('role description') ||
    lower.includes('apply here') ||
    lower.includes('apply via') ||
    lower.includes('apply at') ||
    lower.includes('apply on') ||
    lower.includes('career page') ||
    lower.includes('careers page') ||
    lower.includes('career portal') ||
    lower.includes('careers portal') ||
    lower.includes('application link') ||
    lower.includes('link to apply') ||
    lower.includes('check out the posting') ||
    lower.includes('check out the role here')
  );
};

export const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  setInputText,
  jobPostingText,
  setJobPostingText,
  onAnalyze,
  onLoadSample,
  isLoading,
  errorMessage,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && inputText.trim().length > 0) {
        onAnalyze();
      }
    }
  };

  const hasPostingReference =
    inputText.trim().length > 0 &&
    !jobPostingText.trim() &&
    messageReferencesJobPosting(inputText);

  return (
    <section id="analyze" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Paste Recruiter Outreach or Job Posting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Paste an email, LinkedIn InMail, or message to extract key terms, identify items to clarify, and draft replies.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {inputText.length === 0 && jobPostingText.length === 0 && onLoadSample && (
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-2.5 rounded-md hover:bg-indigo-50 border border-indigo-200/60 font-medium"
              title="Load an example recruiter message to test the app"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load sample</span>
            </button>
          )}
          {(inputText.length > 0 || jobPostingText.length > 0) && (
            <button
              onClick={() => {
                setInputText('');
                setJobPostingText('');
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Text Area: Recruiter Message */}
      <div className="relative mb-4">
        <label htmlFor="message-input-textarea" className="text-xs font-semibold text-slate-700 block mb-1">
          Recruiter Message / Outreach
        </label>
        <textarea
          id="message-input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste recruiter email, LinkedIn InMail, or message here... (e.g. 'Hi Alex, we have an exciting entry-level software role...')"
          rows={6}
          disabled={isLoading}
          className="w-full p-3.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-sans leading-relaxed resize-y"
        />
        <div className="flex items-center justify-between text-xs text-slate-400 mt-1 px-0.5">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">Ctrl+Enter</kbd> to analyze</span>
          <span className="tabular-nums font-mono">
            {inputText.length} chars · {inputText.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      </div>

      {/* Tip Banner if message references job link and posting is empty */}
      {hasPostingReference && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs mb-4 animate-in fade-in slide-in-from-top-1">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-950">Tip: </span>
            <span>This message references a job posting. Paste its details for a more accurate analysis.</span>
          </div>
        </div>
      )}

      {/* Secondary Optional Text Area: Job Posting Details */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <label htmlFor="job-posting-textarea" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Job posting details (optional)</span>
          </label>
          {jobPostingText.length > 0 && (
            <button
              onClick={() => setJobPostingText('')}
              disabled={isLoading}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors py-0.5 px-1.5 rounded hover:bg-slate-100"
            >
              Clear posting
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Paste the job description from the linked posting for a more complete analysis.
        </p>
        <div className="relative">
          <textarea
            id="job-posting-textarea"
            value={jobPostingText}
            onChange={(e) => setJobPostingText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste linked job description, qualifications, compensation range, or benefits from the job URL..."
            rows={4}
            disabled={isLoading}
            className="w-full p-3 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-sans leading-relaxed resize-y"
          />
          {jobPostingText.length > 0 && (
            <div className="text-right text-[11px] text-slate-400 mt-1 font-mono">
              {jobPostingText.length} chars · {jobPostingText.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Analysis Notice: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          onClick={onAnalyze}
          disabled={isLoading || inputText.trim().length === 0}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-xs transition-all ${
            isLoading || inputText.trim().length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-sm active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing terms...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Message</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </section>
  );
};
