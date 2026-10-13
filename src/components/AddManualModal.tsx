import React, { useState } from 'react';
import { X, Plus, Building2, Briefcase, Calendar } from 'lucide-react';
import { TrackerItem, JobStatus } from '../types';
import { addDaysToDateString, getTodayDateString } from '../utils/storage';

interface AddManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<TrackerItem, 'id' | 'createdAt'>) => void;
}

export const AddManualModal: React.FC<AddManualModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  if (!isOpen) return null;

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('Direct hire');
  const [status, setStatus] = useState<JobStatus>('New');
  const [followUpDate, setFollowUpDate] = useState(
    addDaysToDateString(getTodayDateString(), 3)
  );
  const [pay, setPay] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    onAdd({
      company: company.trim(),
      role: role.trim(),
      type,
      status,
      followUpDate,
      pay: pay.trim() || 'Not mentioned',
      notes: notes.trim(),
      extractedDetails: {
        pay: pay.trim() || 'Not mentioned',
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Add Opportunity to Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Manually add a job posting or application without message analysis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Palantir"
                className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Associate Software Engineer"
                className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Direct hire">Direct hire</option>
                <option value="Staffing / Consulting">Staffing / Consulting</option>
                <option value="Contract">Contract</option>
                <option value="Contract-to-hire">Contract-to-hire</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reported Pay / Salary (Optional)
            </label>
            <input
              type="text"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="e.g. $125,000 - $140,000 or $45/hr"
              className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral name, job link, salary expectations, tech stack..."
              className="w-full text-xs p-2 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-2xs"
            >
              Add to Tracker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
