import React, { useState } from 'react';
import { X, Building2, Briefcase, Calendar, FileText, MapPin, DollarSign, GraduationCap, Globe2, FileLock2, Trash2 } from 'lucide-react';
import { TrackerItem, JobStatus } from '../types';
import { formatFriendlyDate, isFollowUpOverdue } from '../utils/storage';
import { SalaryIndicator } from './SalaryIndicator';

interface TrackerDetailModalProps {
  item: TrackerItem | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TrackerItem>) => void;
  onDelete: (id: string) => void;
}

export const TrackerDetailModal: React.FC<TrackerDetailModalProps> = ({
  item,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!item) return null;

  const [notes, setNotes] = useState(item.notes || '');
  const [status, setStatus] = useState<JobStatus>(item.status);
  const [followUpDate, setFollowUpDate] = useState(item.followUpDate || '');
  const [pay, setPay] = useState(item.pay || item.extractedDetails?.pay || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdate(item.id, {
      notes,
      status,
      followUpDate,
      pay,
      extractedDetails: {
        ...item.extractedDetails,
        pay,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isOverdue = isFollowUpOverdue(followUpDate, status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                Opportunity Details
              </span>
              {isOverdue && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  OVERDUE
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {item.company} — {item.role}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700 flex-1">
          {/* Quick Edit Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Replied">Replied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Not interested">Not interested</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className={`w-full text-xs font-mono rounded border px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                  isOverdue
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reported Pay
              </label>
              <input
                type="text"
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                placeholder="e.g. $125k - $140k"
                className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Pay Range Visualization */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Relative Pay Level</span>
              <span className="text-[11px] text-slate-400">Position against new grad market benchmarks</span>
            </div>
            <SalaryIndicator salaryString={pay} />
          </div>

          {/* Extracted Details Breakdown (if available) */}
          {item.extractedDetails && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Extracted & Inferred Criteria
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'location', label: 'Location / Remote', val: item.extractedDetails.location },
                  { key: 'pay', label: 'Compensation', val: item.extractedDetails.pay },
                  { key: 'training', label: 'Training / Mentorship', val: item.extractedDetails.training },
                  { key: 'visaSponsorship', label: 'Visa Sponsorship', val: item.extractedDetails.visaSponsorship },
                  { key: 'commitmentTerms', label: 'Commitment Terms', val: item.extractedDetails.commitmentTerms, fullWidth: true },
                ].map(({ key, label, val, fullWidth }) => {
                  const isMissing = !val || val.toLowerCase() === 'not mentioned';
                  const source = item.fieldSources?.[key] || (item.inferredFields?.includes(key) ? 'Inferred' : 'From message');

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded bg-slate-50 border border-slate-200/80 ${
                        fullWidth ? 'col-span-1 sm:col-span-2' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-slate-400">{label}</span>
                        {!isMissing && (
                          <span
                            className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${
                              source === 'From posting'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : source === 'Inferred'
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}
                          >
                            {source}
                          </span>
                        )}
                      </div>
                      <span className={`font-medium ${isMissing ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                        {val || 'Not mentioned'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Personal Notes & Follow-up Agenda
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add interview notes, questions asked, recruiter contact info..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          {/* Discrepancies if any */}
          {item.conflicts && item.conflicts.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50/90 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                ⚠️ Message vs Posting Discrepancies ({item.conflicts.length})
              </span>
              <div className="space-y-2">
                {item.conflicts.map((c, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded border border-amber-200 text-xs">
                    <span className="font-semibold text-slate-800 capitalize block mb-1">{c.field}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-1">
                      <div className="p-1 rounded bg-sky-50 text-slate-700">
                        <strong className="text-sky-800 block">Message:</strong> {c.messageValue}
                      </div>
                      <div className="p-1 rounded bg-emerald-50 text-slate-700">
                        <strong className="text-emerald-800 block">Posting:</strong> {c.postingValue}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px]">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Recruiter Message Snippet (if available) */}
          {item.rawText && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Original Outreach Text
              </h4>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {item.rawText}
              </div>
            </div>
          )}

          {/* Job Posting Text Snippet (if available) */}
          {item.jobPostingText && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Linked Job Posting Details
              </h4>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {item.jobPostingText}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs"
            >
              {isSaved ? 'Changes Saved!' : 'Save Updates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
