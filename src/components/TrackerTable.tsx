import React, { useState, useMemo } from 'react';
import {
  Calendar,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle2,
  Filter,
  Check,
  Edit2,
  DollarSign,
} from 'lucide-react';
import { TrackerItem, JobStatus } from '../types';
import {
  isFollowUpOverdue,
  getTodayDateString,
  getDaysDiffFromToday,
  formatFriendlyDate,
  exportTrackerToCSV,
} from '../utils/storage';
import { SalaryIndicator } from './SalaryIndicator';
import { parseSalary, PayTier } from '../utils/salary';

interface TrackerTableProps {
  items: TrackerItem[];
  onUpdateItem: (id: string, updates: Partial<TrackerItem>) => void;
  onDeleteItem: (id: string) => void;
  onViewItemDetails: (item: TrackerItem) => void;
  onOpenAddManual: () => void;
}

const STATUS_OPTIONS: JobStatus[] = [
  'New',
  'Replied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Not interested',
];

export const TrackerTable: React.FC<TrackerTableProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onViewItemDetails,
  onOpenAddManual,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payFilter, setPayFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const todayStr = getTodayDateString();

  // Metric counts
  const overdueCount = useMemo(() => {
    return items.filter((item) => isFollowUpOverdue(item.followUpDate, item.status)).length;
  }, [items]);

  const interviewingCount = useMemo(() => {
    return items.filter((item) => item.status === 'Interviewing').length;
  }, [items]);

  const offerCount = useMemo(() => {
    return items.filter((item) => item.status === 'Offer').length;
  }, [items]);

  // Filtered & Sorted items (sorted strictly by followUpDate as required)
  const processedItems = useMemo(() => {
    let result = [...items];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.company.toLowerCase().includes(q) ||
          i.role.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          (i.pay && i.pay.toLowerCase().includes(q)) ||
          (i.extractedDetails?.pay && i.extractedDetails.pay.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        result = result.filter((i) => isFollowUpOverdue(i.followUpDate, i.status));
      } else {
        result = result.filter((i) => i.status === statusFilter);
      }
    }

    // Filter by pay level tier
    if (payFilter !== 'all') {
      result = result.filter((i) => {
        const parsed = parseSalary(i.pay || i.extractedDetails?.pay);
        return parsed.tier === payFilter;
      });
    }

    // Sort by follow-up date
    result.sort((a, b) => {
      // Empty dates go to the bottom
      if (!a.followUpDate && !b.followUpDate) return 0;
      if (!a.followUpDate) return 1;
      if (!b.followUpDate) return -1;

      const dateA = new Date(a.followUpDate).getTime();
      const dateB = new Date(b.followUpDate).getTime();

      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [items, searchQuery, statusFilter, sortDirection]);

  const handleStartEditNote = (item: TrackerItem) => {
    setEditingNoteId(item.id);
    setNoteDraft(item.notes || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateItem(id, { notes: noteDraft });
    setEditingNoteId(null);
  };

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'New':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Replied':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Interviewing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Offer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'Rejected':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Not interested':
        return 'bg-slate-100 text-slate-400 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <section id="tracker" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-12">
      {/* Tracker Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Opportunity & Follow-up Tracker</span>
            <span className="font-mono text-xs tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {items.length} total
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track recruiter outreach, deadlines, and follow-ups. Saved locally in your browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTrackerToCSV(items)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
            title="Export applications to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddManual}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500 block">Total Tracked</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {items.length}
          </span>
        </div>

        <div className={`p-3.5 rounded-lg border ${
          overdueCount > 0
            ? 'border-rose-300 bg-rose-50/60 text-rose-950'
            : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs ${overdueCount > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
              Overdue Follow-ups
            </span>
            {overdueCount > 0 && <AlertCircle className="w-4 h-4 text-rose-600" />}
          </div>
          <span className={`text-2xl font-bold font-mono tabular-nums ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {overdueCount}
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500 block">Active Interviews</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {interviewingCount}
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500 block">Offers</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {offerCount}
          </span>
        </div>
      </div>

      {/* Controls: Search, Status Filter, Sort Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, role, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses ({items.length})</option>
              <option value="overdue">⚠️ Overdue Only ({overdueCount})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Pay Level Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Pay Levels</option>
              <option value="top">Top Tier ($125k+)</option>
              <option value="high">High Tier ($95k–$125k)</option>
              <option value="competitive">Competitive ($65k–$95k)</option>
              <option value="modest">Entry / Modest (&lt;$65k)</option>
              <option value="undisclosed">Undisclosed</option>
            </select>
          </div>

          {/* Sort By Follow-up Date */}
          <button
            onClick={toggleSortDirection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Toggle sort direction by follow-up date"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort by Date:</span>
            <span className="font-semibold text-slate-900">
              {sortDirection === 'asc' ? 'Earliest First' : 'Latest First'}
            </span>
            <ArrowUpDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Overdue legend notice */}
      {overdueCount > 0 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>
              <strong>{overdueCount} opportunity follow-up{overdueCount > 1 ? 's are' : ' is'} overdue.</strong> Rows highlighted in red require immediate outreach or date rescheduling.
            </span>
          </div>
          {statusFilter !== 'overdue' && (
            <button
              onClick={() => setStatusFilter('overdue')}
              className="underline font-semibold hover:text-rose-950 shrink-0 text-xs ml-2"
            >
              Filter to Overdue
            </button>
          )}
        </div>
      )}

      {/* Applications View: Desktop Table (hidden on narrow screens) */}
      <div className="hidden lg:block border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
        <table className="w-full table-fixed text-left text-xs text-slate-700">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[11%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 truncate">Company</th>
              <th className="py-2.5 px-3 truncate">Role</th>
              <th className="py-2.5 px-2.5 truncate">Type</th>
              <th className="py-2.5 px-2.5">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Pay Range</span>
                </div>
              </th>
              <th className="py-2.5 px-2.5 truncate">Status</th>
              <th
                className="py-2.5 px-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={toggleSortDirection}
              >
                <div className="flex items-center gap-1">
                  <span className="truncate">Follow-up</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              </th>
              <th className="py-2.5 px-3 truncate">Notes</th>
              <th className="py-2.5 px-2.5 text-right sticky right-0 bg-slate-50 z-10 border-l border-slate-200/80 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-slate-400">
                  <div className="max-w-sm mx-auto px-4">
                    <Clock className="w-9 h-9 mx-auto text-slate-300 mb-2.5" />
                    {items.length === 0 ? (
                      <>
                        <p className="text-sm font-semibold text-slate-700">
                          No opportunities yet — analyze a message to get started.
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          Paste a recruiter message or job posting above, click "Analyze Message", then click "Save to Tracker". You can also add manual entries using the button above.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-700">
                          No matching opportunities found
                        </p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Try clearing your search query or adjusting your status and pay level filters.
                        </p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              processedItems.map((item) => {
                const overdue = isFollowUpOverdue(item.followUpDate, item.status);
                const daysDiff = getDaysDiffFromToday(item.followUpDate);
                const isTypeInferred =
                  item.inferredFields?.includes('employmentType') ||
                  item.extractedDetails?.inferredFields?.includes('employmentType') ||
                  item.analysis?.inferredFields?.includes('employmentType') ||
                  item.type?.toLowerCase().includes('(inferred)');
                const cleanType = (item.type || 'Direct hire').replace(/\s*\(inferred\)/i, '').replace(/^inferred:\s*/i, '');

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      overdue
                        ? 'bg-rose-50/90 border-l-4 border-l-rose-500 hover:bg-rose-100/70 text-rose-950 font-normal'
                        : 'hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    {/* Company */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        {overdue && (
                          <span
                            className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold rounded bg-rose-600 text-white shrink-0 tracking-wide"
                            title="Follow-up date has passed"
                          >
                            OVERDUE
                          </span>
                        )}
                        <span className="truncate" title={item.company}>
                          {item.company}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-3 text-slate-800 truncate" title={item.role}>
                      <span className="truncate block">{item.role}</span>
                    </td>

                    {/* Employment Type */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 truncate max-w-full">
                          {cleanType}
                        </span>
                        {isTypeInferred && (
                          <span
                            className="text-[9px] font-semibold px-1 py-0.2 rounded bg-violet-50 text-violet-700 border border-violet-200 tracking-tight shrink-0"
                            title="Inferred from company knowledge, not directly stated in message"
                          >
                            Inferred
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pay Range / Level */}
                    <td className="py-2.5 px-2.5 overflow-hidden">
                      <SalaryIndicator
                        salaryString={item.pay || item.extractedDetails?.pay}
                        onUpdateSalary={(newPay) =>
                          onUpdateItem(item.id, {
                            pay: newPay,
                            extractedDetails: {
                              ...item.extractedDetails,
                              pay: newPay,
                            },
                          })
                        }
                      />
                    </td>

                    {/* Status (Editable Dropdown) */}
                    <td className="py-2.5 px-2.5">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            status: e.target.value as JobStatus,
                          })
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded-md border w-full max-w-[110px] transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 truncate ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Follow-up Date (Editable Date Input) */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex flex-col gap-0.5">
                        <input
                          type="date"
                          value={item.followUpDate || ''}
                          onChange={(e) =>
                            onUpdateItem(item.id, {
                              followUpDate: e.target.value,
                            })
                          }
                          className={`text-xs font-mono px-1.5 py-0.5 rounded border w-full max-w-[125px] transition-colors focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                            overdue
                              ? 'bg-rose-100 border-rose-300 text-rose-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        />
                        {item.followUpDate && (
                          <div className="text-[10px] font-mono tabular-nums truncate">
                            {overdue ? (
                              <span className="text-rose-700 font-semibold truncate block">
                                ⚠️ {Math.abs(daysDiff)}d overdue
                              </span>
                            ) : daysDiff === 0 ? (
                              <span className="text-amber-700 font-semibold truncate block">
                                Due Today!
                              </span>
                            ) : (
                              <span className="text-slate-500 truncate block">
                                in {daysDiff}d ({formatFriendlyDate(item.followUpDate)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Notes (Editable, wraps to two lines) */}
                    <td className="py-2.5 px-3">
                      {editingNoteId === item.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(item.id);
                              if (e.key === 'Escape') setEditingNoteId(null);
                            }}
                            autoFocus
                            className="w-full text-xs p-1 border border-indigo-400 rounded bg-white focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleSaveNote(item.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded shrink-0"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditNote(item)}
                          className="group/note cursor-pointer hover:bg-slate-100/60 p-1 rounded -m-1 flex items-start justify-between gap-1"
                          title="Click to edit notes"
                        >
                          <p className="text-xs text-slate-700 line-clamp-2 leading-snug break-words">
                            {item.notes || (
                              <span className="text-slate-400 italic">No notes. Click to add.</span>
                            )}
                          </p>
                          <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/note:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Actions (Always visible, sticky right) */}
                    <td
                      className={`py-2.5 px-2 text-right sticky right-0 z-10 border-l border-slate-100 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)] ${
                        overdue
                          ? 'bg-rose-50/95 group-hover:bg-rose-100/90'
                          : 'bg-white group-hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => onViewItemDetails(item)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="View analysis details and original message"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete opportunity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Applications View: Stacked Cards (Narrow Screens) */}
      <div className="block lg:hidden space-y-3">
        {processedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border border-slate-200 rounded-lg p-6 bg-white shadow-2xs">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {items.length === 0
                ? 'No opportunities yet — analyze a message to get started.'
                : 'No matching opportunities found'}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {items.length === 0
                ? 'Paste a recruiter message or job posting above to add your first opportunity.'
                : 'Try adjusting your search query or filters.'}
            </p>
          </div>
        ) : (
          processedItems.map((item) => {
            const overdue = isFollowUpOverdue(item.followUpDate, item.status);
            const daysDiff = getDaysDiffFromToday(item.followUpDate);
            const isTypeInferred =
              item.inferredFields?.includes('employmentType') ||
              item.extractedDetails?.inferredFields?.includes('employmentType') ||
              item.analysis?.inferredFields?.includes('employmentType') ||
              item.type?.toLowerCase().includes('(inferred)');
            const cleanType = (item.type || 'Direct hire').replace(/\s*\(inferred\)/i, '').replace(/^inferred:\s*/i, '');

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  overdue
                    ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Header: Company, Role, Overdue badge, Actions */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 truncate" title={item.company}>
                        {item.company}
                      </h4>
                      {overdue && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-600 text-white tracking-wide">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5" title={item.role}>
                      {item.role}
                    </p>
                  </div>

                  {/* Actions (Always visible) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onViewItemDetails(item)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View analysis details and original message"
                      aria-label="View details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete opportunity"
                      aria-label="Delete opportunity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid: Type, Status, Pay */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-2.5 border-y border-slate-100 my-2.5">
                  {/* Type */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Type
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {cleanType}
                      </span>
                      {isTypeInferred && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200"
                          title="Inferred from company knowledge"
                        >
                          Inferred
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status (Editable) */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Status
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          status: e.target.value as JobStatus,
                        })
                      }
                      className={`text-xs font-semibold px-2 py-1 rounded-md border w-full sm:w-auto transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pay */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Pay Range
                    </span>
                    <SalaryIndicator
                      salaryString={item.pay || item.extractedDetails?.pay}
                      onUpdateSalary={(newPay) =>
                        onUpdateItem(item.id, {
                          pay: newPay,
                          extractedDetails: {
                            ...item.extractedDetails,
                            pay: newPay,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Follow-up Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Follow-up:</span>
                    <input
                      type="date"
                      value={item.followUpDate || ''}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          followUpDate: e.target.value,
                        })
                      }
                      className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                        overdue
                          ? 'bg-rose-100 border-rose-300 text-rose-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>
                  {item.followUpDate && (
                    <span className="text-[11px] font-mono tabular-nums">
                      {overdue ? (
                        <span className="text-rose-700 font-semibold">
                          ⚠️ {Math.abs(daysDiff)} {Math.abs(daysDiff) === 1 ? 'day' : 'days'} overdue
                        </span>
                      ) : daysDiff === 0 ? (
                        <span className="text-amber-700 font-semibold">Due Today!</span>
                      ) : (
                        <span className="text-slate-500">
                          in {daysDiff} days ({formatFriendlyDate(item.followUpDate)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Notes (Editable, wraps to two lines) */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Notes</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">(click to edit)</span>
                  </div>
                  {editingNoteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(item.id);
                          if (e.key === 'Escape') setEditingNoteId(null);
                        }}
                        autoFocus
                        className="w-full text-xs p-1.5 border border-indigo-400 rounded bg-white focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded shrink-0"
                        title="Save note"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleStartEditNote(item)}
                      className="group/note cursor-pointer hover:bg-slate-100/60 p-1.5 rounded -m-1.5 flex items-start justify-between gap-1"
                      title="Click to edit notes"
                    >
                      <p className="text-xs text-slate-700 line-clamp-2 leading-snug break-words">
                        {item.notes || <span className="text-slate-400 italic">No notes. Tap to add.</span>}
                      </p>
                      <Edit2 className="w-3 h-3 text-slate-300 opacity-0 group-hover/note:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
