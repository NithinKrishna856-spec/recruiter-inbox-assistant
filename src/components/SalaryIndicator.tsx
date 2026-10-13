import React, { useState } from 'react';
import { parseSalary, PayTier } from '../utils/salary';
import { DollarSign, Edit2, Check, X } from 'lucide-react';

interface SalaryIndicatorProps {
  salaryString?: string | null;
  onUpdateSalary?: (newSalary: string) => void;
  compact?: boolean;
}

export const SalaryIndicator: React.FC<SalaryIndicatorProps> = ({
  salaryString,
  onUpdateSalary,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(salaryString || '');

  const parsed = parseSalary(salaryString);

  const handleSave = () => {
    if (onUpdateSalary) {
      onUpdateSalary(editVal.trim() || 'Not mentioned');
    }
    setIsEditing(false);
  };

  const getTierColor = (tier: PayTier) => {
    switch (tier) {
      case 'top':
        return {
          bar: 'bg-emerald-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        };
      case 'high':
        return {
          bar: 'bg-indigo-500',
          text: 'text-indigo-700',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
        };
      case 'competitive':
        return {
          bar: 'bg-sky-500',
          text: 'text-sky-700',
          bg: 'bg-sky-50',
          border: 'border-sky-200',
        };
      case 'modest':
        return {
          bar: 'bg-amber-500',
          text: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
        };
      case 'undisclosed':
      default:
        return {
          bar: 'bg-slate-300',
          text: 'text-slate-400',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
        };
    }
  };

  const colors = getTierColor(parsed.tier);

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          placeholder="e.g. $110k, $40/hr"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
          className="text-xs p-1 border border-indigo-400 rounded bg-white w-28 focus:outline-hidden"
        />
        <button
          onClick={handleSave}
          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
          title="Save pay"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (parsed.tier === 'undisclosed') {
    return (
      <div
        className="group/pay flex items-center gap-1.5 cursor-pointer"
        onClick={() => {
          if (onUpdateSalary) {
            setEditVal('');
            setIsEditing(true);
          }
        }}
        title="Compensation not mentioned. Click to add known pay."
      >
        <div className="w-14 h-1.5 bg-slate-100 rounded-full border border-dashed border-slate-300" />
        <span className="text-[11px] text-slate-400 italic">Undisclosed</span>
        {onUpdateSalary && (
          <Edit2 className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/pay:opacity-100 transition-opacity" />
        )}
      </div>
    );
  }

  return (
    <div
      className="group/pay flex flex-col gap-1 cursor-pointer"
      onClick={() => {
        if (onUpdateSalary) {
          setEditVal(salaryString || '');
          setIsEditing(true);
        }
      }}
      title={`Reported: ${parsed.raw}\nTier: ${parsed.tierLabel}\nClick to edit pay`}
    >
      {/* Top line: Formatted amount + Tier Badge */}
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-semibold tabular-nums text-slate-800">
          {parsed.formattedDisplay}
        </span>
        {onUpdateSalary && (
          <Edit2 className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/pay:opacity-100 transition-opacity shrink-0" />
        )}
      </div>

      {/* Visual Bar representation of relative salary */}
      <div className="flex items-center gap-2">
        {/* Track */}
        <div className="relative w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          {/* Subtle benchmark markers */}
          <div className="absolute left-[20%] top-0 bottom-0 w-px bg-slate-200/80" title="$65k" />
          <div className="absolute left-[45%] top-0 bottom-0 w-px bg-slate-200/80" title="$95k" />
          <div className="absolute left-[70%] top-0 bottom-0 w-px bg-slate-200/80" title="$125k" />

          {/* Active Range Bar */}
          <div
            className={`absolute h-full rounded-full transition-all duration-300 ${colors.bar}`}
            style={{
              left: `${parsed.barStartPercent}%`,
              width: `${parsed.barWidthPercent}%`,
            }}
          />
        </div>

        {/* Quiet Tier Category Label */}
        <span
          className={`text-[10px] font-medium leading-none px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {parsed.tier === 'top' && 'Top Tier'}
          {parsed.tier === 'high' && 'High Tier'}
          {parsed.tier === 'competitive' && 'Competitive'}
          {parsed.tier === 'modest' && 'Entry / Modest'}
        </span>
      </div>
    </div>
  );
};
