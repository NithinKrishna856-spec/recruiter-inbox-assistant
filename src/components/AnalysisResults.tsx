import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  MapPin,
  FileText,
  DollarSign,
  GraduationCap,
  Globe2,
  FileLock2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  BookmarkPlus,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ExtractedAnalysis, FlaggedConcern, JobStatus, FieldSource } from '../types';
import { addDaysToDateString, getTodayDateString } from '../utils/storage';

interface AnalysisResultsProps {
  analysis: ExtractedAnalysis;
  rawText: string;
  onSaveToTracker: (item: {
    company: string;
    role: string;
    type: string;
    status: JobStatus;
    followUpDate: string;
    notes: string;
    analysis: ExtractedAnalysis;
    rawText: string;
  }) => void;
  isSavedToTracker: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  rawText,
  onSaveToTracker,
  isSavedToTracker,
}) => {
  const [selectedTone, setSelectedTone] = useState<'standard' | 'direct' | 'casual'>('standard');
  const [draftText, setDraftText] = useState<string>(analysis.draftReplies.standard || '');
  const [copiedReply, setCopiedReply] = useState<boolean>(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  // Tracker saving modal/state
  const [followUpDate, setFollowUpDate] = useState<string>(addDaysToDateString(getTodayDateString(), 3));
  const [trackerStatus, setTrackerStatus] = useState<JobStatus>('New');
  const [customNotes, setCustomNotes] = useState<string>(
    analysis.flaggedConcerns.length > 0
      ? `Key questions: ${analysis.flaggedConcerns.map((c) => c.flag).join('; ')}`
      : 'Clean initial outreach. Follow up regarding next steps.'
  );

  const handleToneChange = (tone: 'standard' | 'direct' | 'casual') => {
    setSelectedTone(tone);
    setDraftText(analysis.draftReplies[tone] || '');
  };

  const handleCopyReply = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopiedReply(true);
      setTimeout(() => setCopiedReply(false), 2000);
    } catch (err) {
      console.error('Failed to copy reply text:', err);
    }
  };

  const handleCopyQuestion = async (question: string, index: number) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedQuestionIndex(index);
      setTimeout(() => setCopiedQuestionIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy question:', err);
    }
  };

  const handleAppendQuestionToDraft = (question: string) => {
    setDraftText((prev) => {
      const signOffMatch = prev.match(/(\n\n(?:Best regards|Best|Thanks|Sincerely|Warm regards|Cheers),?\s*\n(?:\[Your Name\]|[^\n]+))$/i);
      if (signOffMatch && signOffMatch.index !== undefined) {
        const bodyBeforeSignoff = prev.slice(0, signOffMatch.index).trimEnd();
        const signoff = signOffMatch[1];
        return `${bodyBeforeSignoff}\n\nAdditionally: ${question}${signoff}`;
      }
      return `${prev}\n\nAdditionally: ${question}`;
    });
  };

  const handleSave = () => {
    onSaveToTracker({
      company: analysis.company === 'Not mentioned' ? 'Unspecified Company' : analysis.company,
      role: analysis.roleTitle === 'Not mentioned' ? 'Software Engineer' : analysis.roleTitle,
      type: analysis.employmentType,
      status: trackerStatus,
      followUpDate,
      notes: customNotes,
      analysis,
      rawText,
    });
  };

  const isFieldMissing = (val: string | undefined): boolean => {
    if (!val) return true;
    return val.trim().toLowerCase() === 'not mentioned';
  };

  const isFieldInferred = (fieldName: string, val: string | undefined): boolean => {
    if (!val || isFieldMissing(val)) return false;
    if (analysis.inferredFields && Array.isArray(analysis.inferredFields) && analysis.inferredFields.includes(fieldName)) {
      return true;
    }
    if (val.toLowerCase().includes('(inferred)') || val.toLowerCase().startsWith('inferred:')) {
      return true;
    }
    return false;
  };

  const getFieldSource = (fieldName: string, val?: string): FieldSource => {
    if (analysis.fieldSources && analysis.fieldSources[fieldName]) {
      return analysis.fieldSources[fieldName];
    }
    if (isFieldInferred(fieldName, val)) {
      return 'Inferred';
    }
    return 'From message';
  };

  const renderSourceBadge = (source: FieldSource) => {
    switch (source) {
      case 'From posting':
        return (
          <span
            className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0"
            title="Extracted from the linked job posting details"
          >
            From posting
          </span>
        );
      case 'Inferred':
        return (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 shrink-0"
            title="Inferred based on company or industry knowledge"
          >
            <Sparkles className="w-2.5 h-2.5 text-violet-500" />
            <span>Inferred</span>
          </span>
        );
      case 'From message':
      default:
        return (
          <span
            className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0"
            title="Extracted from the recruiter outreach message"
          >
            From message
          </span>
        );
    }
  };

  // Render a field value, highlighting "Not mentioned" specifically or showing source tag
  const renderFieldValue = (fieldName: string, val: string | undefined, isWarning?: boolean) => {
    if (isFieldMissing(val)) {
      return (
        <span className="text-slate-400 italic font-normal text-xs sm:text-sm">
          Not mentioned
        </span>
      );
    }

    const cleanVal = val ? val.replace(/\s*\(inferred\)/i, '').replace(/^inferred:\s*/i, '').trim() : '';
    const source = getFieldSource(fieldName, val);

    return (
      <div className="flex flex-col gap-1">
        <span className={`text-xs sm:text-sm leading-relaxed ${isWarning ? 'text-amber-900 font-semibold' : 'text-slate-900 font-medium'}`}>
          {cleanVal}
        </span>
        <div className="flex items-center gap-1.5 pt-0.5">
          {renderSourceBadge(source)}
        </div>
      </div>
    );
  };

  const hasCommitmentClause =
    analysis.commitmentTerms.toLowerCase().includes('fee') ||
    analysis.commitmentTerms.toLowerCase().includes('damage') ||
    analysis.commitmentTerms.toLowerCase().includes('penalty') ||
    analysis.commitmentTerms.toLowerCase().includes('2-year') ||
    analysis.commitmentTerms.toLowerCase().includes('2 year');

  const isUnpaidTraining =
    analysis.training.toLowerCase().includes('unpaid') ||
    analysis.training.toLowerCase().includes('stipend only') ||
    analysis.training.toLowerCase().includes('without pay');

  return (
    <div className="space-y-6 sm:space-y-8 mb-12">
      {/* Discrepancy Conflict Banner between Message & Posting */}
      {analysis.conflicts && analysis.conflicts.length > 0 && (
        <div className="bg-amber-50/95 border border-amber-300 rounded-xl p-5 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-800">
                  Discrepancy Detected
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  {analysis.conflicts.length} Difference{analysis.conflicts.length > 1 ? 's' : ''} Between Message & Posting
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Recruiter Message and Job Posting Don't Match
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                Key terms differ between the recruiter's message and the published job description. Review these differences to ensure mutual clarity on compensation, role title, and working terms before responding:
              </p>

              <div className="space-y-3">
                {analysis.conflicts.map((conflict, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-900 capitalize">
                        {conflict.field.replace(/([A-Z])/g, ' $1')} Discrepancy
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        Requires Clarification
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 text-xs">
                      <div className="p-2.5 rounded bg-sky-50/70 border border-sky-100">
                        <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
                          From Recruiter Message
                        </span>
                        <span className="font-semibold text-slate-900">{conflict.messageValue}</span>
                      </div>
                      <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                          From Job Posting
                        </span>
                        <span className="font-semibold text-slate-900">{conflict.postingValue}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs mb-2">
                      <strong className="text-slate-700">Point to clarify: </strong>
                      {conflict.explanation}
                    </p>

                    {conflict.suggestedQuestion && (
                      <div className="bg-amber-50/60 p-2 rounded border border-amber-100 text-xs text-slate-800 flex items-start gap-1.5">
                        <span className="font-semibold text-amber-800 shrink-0">Ask Recruiter:</span>
                        <span className="italic">"{conflict.suggestedQuestion}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Link Reference Tip */}
      {analysis.referencesJobLinkWithoutPosting && (
        <div className="bg-sky-50/90 border border-sky-200 rounded-xl p-4 shadow-2xs flex items-start gap-3 text-xs text-sky-900 animate-in fade-in">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-sky-950">Tip: </span>
            <span>This message references a job posting. Paste its details for a more accurate analysis.</span>
          </div>
        </div>
      )}

      {/* 1. Header Overview & Risk Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
                Extraction Report
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                {analysis.employmentType}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {analysis.company !== 'Not mentioned' ? analysis.company : 'Unknown Company'}
              <span className="text-slate-400 font-normal"> — </span>
              {analysis.roleTitle !== 'Not mentioned' ? analysis.roleTitle : 'Software Engineer'}
            </h2>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {analysis.riskLevel === 'Caution' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Caution: Specific Terms to Clarify</span>
              </div>
            )}
            {analysis.riskLevel === 'Moderate' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                <Info className="w-4 h-4 text-slate-500" />
                <span>Notice: Terms to Clarify</span>
              </div>
            )}
            {analysis.riskLevel === 'Standard' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Standard & Transparent Terms</span>
              </div>
            )}
          </div>
        </div>

        {analysis.summary && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700">Summary: </span>
            {analysis.summary}
          </p>
        )}

        {/* Core Extracted Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Company */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Company</span>
            </div>
            <div className="text-sm">
              {renderFieldValue('company', analysis.company)}
            </div>
          </div>

          {/* Role Title */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Role Title</span>
            </div>
            <div className="text-sm">
              {renderFieldValue('roleTitle', analysis.roleTitle)}
            </div>
          </div>

          {/* Location / Remote */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location / Remote</span>
            </div>
            <div className="text-sm">
              {renderFieldValue('location', analysis.location)}
            </div>
          </div>

          {/* Employment Type */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Employment Type</span>
            </div>
            <div className="text-sm">
              {renderFieldValue('employmentType', analysis.employmentType, analysis.employmentType.includes('Staffing'))}
            </div>
          </div>

          {/* Pay Info */}
          <div className={`p-3.5 rounded-lg border ${
            isFieldMissing(analysis.pay)
              ? 'border-amber-200 bg-amber-50/30'
              : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Compensation / Pay</span>
              </div>
              {isFieldMissing(analysis.pay) && (
                <span className="text-[10px] text-amber-700 font-medium">Flagged</span>
              )}
            </div>
            <div className="text-sm">
              {renderFieldValue('pay', analysis.pay)}
            </div>
          </div>

          {/* Training Info */}
          <div className={`p-3.5 rounded-lg border ${
            isUnpaidTraining
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Training / Mentorship</span>
              </div>
              {isUnpaidTraining && (
                <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                  Training Terms to Clarify
                </span>
              )}
            </div>
            <div className="text-sm">
              {renderFieldValue('training', analysis.training, isUnpaidTraining)}
            </div>
          </div>

          {/* Visa Sponsorship */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Visa Sponsorship</span>
            </div>
            <div className="text-sm">
              {renderFieldValue('visaSponsorship', analysis.visaSponsorship)}
            </div>
          </div>

          {/* Commitment Terms */}
          <div className={`p-3.5 rounded-lg border ${
            hasCommitmentClause
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-2">
                <FileLock2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Commitment Terms</span>
              </div>
              {hasCommitmentClause && (
                <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                  Commitment Terms to Clarify
                </span>
              )}
            </div>
            <div className="text-sm">
              {renderFieldValue('commitmentTerms', analysis.commitmentTerms, hasCommitmentClause)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Questions to Ask Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Questions to Clarify with the Recruiter</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Professional, objective questions to clarify specific terms and ensure mutual alignment before taking next steps.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono tabular-nums px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            {analysis.flaggedConcerns.length} {analysis.flaggedConcerns.length === 1 ? 'item' : 'items'} to clarify
          </span>
        </div>

        {analysis.flaggedConcerns.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">No major terms requiring clarification detected</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              The outreach details appear relatively transparent. You can still confirm team specifics, day-to-day stack, and interview process.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.flaggedConcerns.map((concern: FlaggedConcern, idx: number) => {
              const isHigh = concern.severity === 'high';
              const isMedium = concern.severity === 'medium';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-all ${
                    isHigh
                      ? 'border-amber-300 bg-amber-50/25'
                      : isMedium
                      ? 'border-slate-300 bg-slate-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isHigh
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : isMedium
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isHigh ? 'KEY CLARIFICATION' : isMedium ? 'RECOMMENDED' : 'OPTIONAL'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {concern.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {concern.flag}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyQuestion(concern.suggestedQuestion, idx)}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                        title="Copy question text"
                      >
                        {copiedQuestionIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Question</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAppendQuestionToDraft(concern.suggestedQuestion)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                        title="Add this question into the drafted reply below"
                      >
                        <span>+ Add to Draft</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                    <span className="font-semibold text-slate-700">Why this matters: </span>
                    {concern.explanation}
                  </p>

                  <div className="bg-white p-2.5 rounded border border-slate-200/80 text-xs text-slate-800 flex items-start gap-2">
                    <span className="font-semibold text-indigo-600 shrink-0">Suggested Inquiry:</span>
                    <span className="italic leading-relaxed">"{concern.suggestedQuestion}"</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Draft Reply & Save to Tracker Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Draft Candidate Reply</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Short, professional reply expressing interest while tactfully raising the flagged questions. You can edit this directly before copying.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => handleToneChange('standard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedTone === 'standard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleToneChange('direct')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedTone === 'direct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct & Firm
            </button>
            <button
              onClick={() => handleToneChange('casual')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedTone === 'casual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Casual InMail
            </button>
          </div>
        </div>

        {/* Editable Draft Text Area */}
        <div className="mb-4">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={7}
            className="w-full p-3.5 text-sm text-slate-800 bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans leading-relaxed resize-y"
          />
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Tip: Personalize the greetings and sign-off with your name before sending.</span>
            <span className="font-mono tabular-nums">{draftText.length} chars</span>
          </div>
        </div>

        {/* Copy Button & Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReply}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                copiedReply
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs'
              }`}
            >
              {copiedReply ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Draft Reply</span>
                </>
              )}
            </button>
          </div>

          {/* Save To Tracker Area */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Status:</span>
              <select
                value={trackerStatus}
                onChange={(e) => setTrackerStatus(e.target.value as JobStatus)}
                className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Replied">Replied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Not interested">Not interested</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Follow-up:</span>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-all ${
                isSavedToTracker
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isSavedToTracker ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved in Tracker!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Tracker</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
