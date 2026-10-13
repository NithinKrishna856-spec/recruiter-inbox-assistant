/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { MessageInput, messageReferencesJobPosting } from './components/MessageInput';
import { AnalysisResults } from './components/AnalysisResults';
import { TrackerTable } from './components/TrackerTable';
import { TrackerDetailModal } from './components/TrackerDetailModal';
import { AddManualModal } from './components/AddManualModal';
import { NewGradSafetyGuide } from './components/NewGradSafetyGuide';
import { WelcomeBanner } from './components/WelcomeBanner';
import { ExtractedAnalysis, TrackerItem, JobStatus, FieldSource, FieldConflict } from './types';
import {
  loadTrackerItems,
  saveTrackerItems,
  isFollowUpOverdue,
  getTodayDateString,
  addDaysToDateString,
} from './utils/storage';
import { CheckCircle2, ShieldAlert, PlusCircle, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('analyze');
  const [inputText, setInputText] = useState<string>('');
  const [jobPostingText, setJobPostingText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExtractedAnalysis | null>(null);
  const [lastAnalyzedRawText, setLastAnalyzedRawText] = useState<string>('');
  const [lastAnalyzedJobPostingText, setLastAnalyzedJobPostingText] = useState<string>('');
  const [isSavedToTracker, setIsSavedToTracker] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Welcome message state for first-time users
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      return localStorage.getItem('recruiter_assistant_welcome_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem('recruiter_assistant_welcome_dismissed', 'true');
    } catch {}
  };

  const handleOpenWelcome = () => {
    setShowWelcome(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSample = () => {
    setInputText(`Hi Alex,

I lead technical recruiting at CloudScale Systems, a developer tooling company based in San Francisco. I came across your distributed systems project on GitHub and thought your background would be a strong match for our Associate Backend Engineer role.

Role Highlights:
- Associate Backend Engineer (New Grad)
- Base compensation starts around $130,000 + equity options
- Structured 6-month ramp-up with dedicated 1-on-1 mentorship from a Senior Staff Engineer
- Full-time Direct Hire (At-will employment)

You can review the full team description and tech stack on our careers portal:
https://cloudscale.io/careers/associate-backend-engineer

Would you be open for a brief 15-minute introductory chat this week?

Best,
Sarah Lin | Head of Talent at CloudScale Systems`);

    setJobPostingText(`CloudScale Systems — Associate Backend Engineer (New Grad)
Location: San Francisco, CA (Hybrid: 2 days in office, 3 days remote)
Employment Type: Full-time Direct Hire (At-will)
Compensation: $125,000 - $140,000 base salary + equity options + $10,000 relocation stipend
Onboarding: Dedicated 1-on-1 mentorship from Senior Staff Engineers with 6-month ramp-up program.
Visa Sponsorship: Actively supports F-1 STEM OPT extensions and H-1B lottery sponsorship.`);

    setErrorMessage(null);
    setAnalysisResult(null);
    setIsSavedToTracker(false);
    setActiveView('analyze');
    showToast('Sample outreach and job posting loaded');

    setTimeout(() => {
      const el = document.getElementById('message-input-textarea');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }, 100);
  };

  // Tracker state
  const [trackerItems, setTrackerItems] = useState<TrackerItem[]>([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState<TrackerItem | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Load tracker items from localStorage on mount
  useEffect(() => {
    const items = loadTrackerItems();
    setTrackerItems(items);
  }, []);

  const overdueCount = trackerItems.filter((item) =>
    isFollowUpOverdue(item.followUpDate, item.status)
  ).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Rule-based fallback extractor combining recruiter outreach and optional job posting
  const performFallbackExtraction = (msgText: string, postText: string = ''): ExtractedAnalysis => {
    const lowerMsg = msgText.toLowerCase();
    const lowerPost = postText.toLowerCase();
    const combinedLower = `${lowerMsg}\n${lowerPost}`;

    const fieldSources: Record<string, FieldSource> = {};
    const conflicts: FieldConflict[] = [];
    const inferredFields: string[] = [];

    // Helper to extract company
    const extractCompany = (txt: string) => {
      const match = txt.match(/(?:at|with|from|company:)\s+([A-Z][A-Za-z0-9\s&]{2,25})/i);
      return match ? match[1].trim() : 'Not mentioned';
    };

    const companyMsg = extractCompany(msgText);
    const companyPost = extractCompany(postText);
    let company = 'Not mentioned';
    if (companyMsg !== 'Not mentioned') {
      company = companyMsg;
      fieldSources.company = 'From message';
    } else if (companyPost !== 'Not mentioned') {
      company = companyPost;
      fieldSources.company = 'From posting';
    }

    // Role
    const extractRole = (txt: string) => {
      const l = txt.toLowerCase();
      if (l.includes('software engineer i (backend)') || l.includes('backend engineer')) return 'Backend Engineer';
      if (l.includes('frontend engineer') || l.includes('front-end')) return 'Frontend Engineer';
      if (l.includes('full stack') || l.includes('full-stack')) return 'Full Stack Engineer';
      if (l.includes('software engineer') || l.includes('software developer')) return 'Software Engineer';
      if (l.includes('java developer')) return 'Java Developer';
      if (l.includes('qa automation') || l.includes('qa engineer')) return 'QA Automation Engineer';
      return 'Not mentioned';
    };
    const roleMsg = extractRole(msgText);
    const rolePost = extractRole(postText);
    let roleTitle = 'Not mentioned';
    if (roleMsg !== 'Not mentioned' && rolePost !== 'Not mentioned' && roleMsg !== rolePost) {
      conflicts.push({
        field: 'roleTitle',
        messageValue: roleMsg,
        postingValue: rolePost,
        explanation: `Recruiter message describes the role as "${roleMsg}", but the linked job posting titles it "${rolePost}".`,
        suggestedQuestion: `Could you confirm whether the opening is for the ${roleMsg} or ${rolePost} position?`,
      });
      roleTitle = roleMsg;
      fieldSources.roleTitle = 'From message';
    } else if (roleMsg !== 'Not mentioned') {
      roleTitle = roleMsg;
      fieldSources.roleTitle = 'From message';
    } else if (rolePost !== 'Not mentioned') {
      roleTitle = rolePost;
      fieldSources.roleTitle = 'From posting';
    }

    // Location
    const extractLoc = (txt: string) => {
      const l = txt.toLowerCase();
      if (l.includes('remote')) return 'Remote';
      if (l.includes('hybrid')) return 'Hybrid';
      if (l.includes('onsite') || l.includes('on-site')) return 'Onsite';
      return 'Not mentioned';
    };
    const locMsg = extractLoc(msgText);
    const locPost = extractLoc(postText);
    let location = 'Not mentioned';
    if (locMsg !== 'Not mentioned' && locPost !== 'Not mentioned' && locMsg !== locPost) {
      conflicts.push({
        field: 'location',
        messageValue: locMsg,
        postingValue: locPost,
        explanation: `Message indicates "${locMsg}", while the job posting specifies "${locPost}".`,
        suggestedQuestion: `Could you clarify the in-person vs. remote requirements for this position?`,
      });
      location = locMsg;
      fieldSources.location = 'From message';
    } else if (locMsg !== 'Not mentioned') {
      location = locMsg;
      fieldSources.location = 'From message';
    } else if (locPost !== 'Not mentioned') {
      location = locPost;
      fieldSources.location = 'From posting';
    }

    // Employment type
    const extractType = (txt: string) => {
      const l = txt.toLowerCase();
      if (l.includes('direct hire') || l.includes('full-time') || l.includes('full time')) return 'Direct hire';
      if (l.includes('staffing') || l.includes('consulting') || l.includes('cohort') || l.includes('placement')) return 'Staffing / Consulting';
      if (l.includes('contract')) return 'Contract';
      return 'Not mentioned';
    };
    const typeMsg = extractType(msgText);
    const typePost = extractType(postText);
    let employmentType = 'Not mentioned';
    if (typeMsg !== 'Not mentioned' && typePost !== 'Not mentioned' && typeMsg !== typePost) {
      conflicts.push({
        field: 'employmentType',
        messageValue: typeMsg,
        postingValue: typePost,
        explanation: `Recruiter message mentions "${typeMsg}", but the job posting specifies "${typePost}".`,
        suggestedQuestion: `Can you verify whether this is a direct hire position or a contract / staffing arrangement?`,
      });
      employmentType = typeMsg;
      fieldSources.employmentType = 'From message';
    } else if (typeMsg !== 'Not mentioned') {
      employmentType = typeMsg;
      fieldSources.employmentType = 'From message';
    } else if (typePost !== 'Not mentioned') {
      employmentType = typePost;
      fieldSources.employmentType = 'From posting';
    } else if (company.toLowerCase().includes('apex') || company.toLowerCase().includes('revature')) {
      employmentType = 'Staffing / Consulting';
      inferredFields.push('employmentType');
      fieldSources.employmentType = 'Inferred';
    }

    // Pay
    const extractPay = (txt: string) => {
      const match = txt.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?(?:\s*\/(?:year|yr|hr|hour))?/i);
      if (match) return match[0];
      if (txt.toLowerCase().includes('competitive') || txt.toLowerCase().includes('market rate')) {
        return 'Not mentioned (Described as "competitive")';
      }
      return 'Not mentioned';
    };
    const payMsg = extractPay(msgText);
    const payPost = extractPay(postText);
    let pay = 'Not mentioned';
    if (payMsg !== 'Not mentioned' && payPost !== 'Not mentioned' && payMsg !== payPost) {
      conflicts.push({
        field: 'pay',
        messageValue: payMsg,
        postingValue: payPost,
        explanation: `Recruiter outreach states "${payMsg}", whereas the official job posting lists "${payPost}".`,
        suggestedQuestion: `Could you clarify which salary structure governs: the ${payMsg} cited in your note or the ${payPost} published on the posting?`,
      });
      pay = `${payMsg} (Message) vs ${payPost} (Posting)`;
      fieldSources.pay = 'From message';
    } else if (payMsg !== 'Not mentioned') {
      pay = payMsg;
      fieldSources.pay = 'From message';
    } else if (payPost !== 'Not mentioned') {
      pay = payPost;
      fieldSources.pay = 'From posting';
    }

    // Training
    let training = 'Not mentioned';
    if (combinedLower.includes('unpaid') && combinedLower.includes('training')) {
      training = 'Unpaid training (High risk)';
      fieldSources.training = lowerMsg.includes('unpaid') ? 'From message' : 'From posting';
    } else if (combinedLower.includes('mentorship') || combinedLower.includes('mentor')) {
      training = 'Structured mentorship provided';
      fieldSources.training = lowerMsg.includes('mentor') ? 'From message' : 'From posting';
    } else if (combinedLower.includes('training')) {
      training = 'Training program mentioned';
      fieldSources.training = lowerMsg.includes('training') ? 'From message' : 'From posting';
    }

    // Visa
    let visaSponsorship = 'Not mentioned';
    if (combinedLower.includes('opt') || combinedLower.includes('stem') || combinedLower.includes('h-1b') || combinedLower.includes('h1b')) {
      visaSponsorship = combinedLower.includes('no sponsorship') || combinedLower.includes('us citizen only') ? 'No sponsorship / US Citizens only' : 'OPT / H-1B supported';
      fieldSources.visaSponsorship = lowerMsg.includes('opt') || lowerMsg.includes('h-1b') ? 'From message' : 'From posting';
    } else if (combinedLower.includes('us citizen') || combinedLower.includes('green card')) {
      visaSponsorship = 'US Citizens / Permanent Residents only';
      fieldSources.visaSponsorship = lowerMsg.includes('us citizen') ? 'From message' : 'From posting';
    }

    // Commitment
    let commitmentTerms = 'Not mentioned';
    if (combinedLower.includes('2-year') || combinedLower.includes('2 year') || combinedLower.includes('liquidated') || combinedLower.includes('penalty')) {
      commitmentTerms = '2-year commitment with early-exit penalty fee';
      fieldSources.commitmentTerms = lowerMsg.includes('2-year') || lowerMsg.includes('penalty') ? 'From message' : 'From posting';
    } else if (combinedLower.includes('at-will') || combinedLower.includes('at will')) {
      commitmentTerms = 'Standard at-will employment';
      fieldSources.commitmentTerms = lowerMsg.includes('at-will') ? 'From message' : 'From posting';
    }

    // Check link reference
    const mentionsLink = messageReferencesJobPosting(msgText);
    const referencesJobLinkWithoutPosting = Boolean(!postText.trim() && mentionsLink);

    const flaggedConcerns: any[] = [];

    // Add conflict concerns
    for (const c of conflicts) {
      flaggedConcerns.push({
        category: c.field === 'pay' ? 'Compensation' : 'Role Clarity',
        severity: 'high',
        flag: `${c.field.replace(/([A-Z])/g, ' $1')} Discrepancy`,
        explanation: c.explanation,
        suggestedQuestion: c.suggestedQuestion || `Could you clarify the discrepancy regarding ${c.field}?`,
      });
    }

    if (training.includes('Unpaid') || combinedLower.includes('unpaid training')) {
      flaggedConcerns.push({
        category: 'Training Terms',
        severity: 'high' as const,
        flag: 'Unpaid Training Period',
        explanation: 'Clarifying whether compensation is provided during initial training ensures expectations regarding onboarding pay align.',
        suggestedQuestion: 'Could you confirm whether the initial training period is fully paid at the regular starting salary rate?',
      });
    }

    if (commitmentTerms.includes('penalty') || commitmentTerms.includes('2-year') || combinedLower.includes('liquidated damages')) {
      flaggedConcerns.push({
        category: 'Commitment & Terms',
        severity: 'high' as const,
        flag: 'Mandatory Commitment & Exit Repayment Clause',
        explanation: 'Fixed commitments and early-exit repayment clauses specify financial obligations if employment ends before the designated duration.',
        suggestedQuestion: 'Is the position at-will employment, and are there any monetary fees, repayment clauses, or lock-in durations if I choose to depart earlier?',
      });
    }

    // Only flag missing if missing from BOTH!
    if (pay === 'Not mentioned' || pay.includes('Described as')) {
      flaggedConcerns.push({
        category: 'Compensation',
        severity: 'medium' as const,
        flag: 'Base Salary Not Disclosed',
        explanation: 'Neither the outreach message nor the linked posting specifies a base salary range.',
        suggestedQuestion: 'What is the approved base salary range or hourly rate for this role?',
      });
    }

    if (employmentType.includes('Staffing')) {
      flaggedConcerns.push({
        category: 'Employment Type & Placement',
        severity: 'medium' as const,
        flag: 'End-Client Placement Unspecified',
        explanation: 'In consulting and staffing arrangements, confirming the end-client assignment and compensation policy between projects clarifies the day-to-day work environment.',
        suggestedQuestion: 'Could you share the specific end-client company name, and what is your policy regarding compensation between client assignments?',
      });
    }

    if (visaSponsorship === 'Not mentioned') {
      flaggedConcerns.push({
        category: 'Visa & Work Auth',
        severity: 'low' as const,
        flag: 'Work Authorization Ambiguity',
        explanation: 'If you require F-1 STEM OPT extension or future H-1B sponsorship, verify this before proceeding through rounds.',
        suggestedQuestion: 'Does the company support F-1 STEM OPT extensions and H-1B lottery sponsorship for new graduates?',
      });
    }

    // Check recruiter name for personalized email greeting
    let recruiterGreeting = 'Hi there,';
    const recruiterMatch = msgText.match(/(?:this is|i'm|i am|my name is)\s+([A-Z][a-z]+)\b/i) || msgText.match(/^([A-Z][a-z]+)\s+here\b/i);
    if (recruiterMatch && !['We', 'The', 'Our', 'Here', 'Hope'].includes(recruiterMatch[1])) {
      recruiterGreeting = `Hi ${recruiterMatch[1]},`;
    }

    return {
      company,
      roleTitle,
      location,
      employmentType,
      pay,
      training,
      visaSponsorship,
      commitmentTerms,
      summary: `Outreach for a ${roleTitle} role at ${company}. ${flaggedConcerns.length > 0 ? `${flaggedConcerns.length} key points require clarification.` : 'Terms appear relatively standard.'}`,
      riskLevel: flaggedConcerns.some((c) => c.severity === 'high') ? 'Caution' : flaggedConcerns.length > 0 ? 'Moderate' : 'Standard',
      flaggedConcerns,
      draftReplies: {
        standard: `${recruiterGreeting}\n\nThank you for reaching out regarding the ${roleTitle} opportunity at ${company}. I am very interested in the work your team is doing.\n\nBefore taking next steps, could you clarify a few details:\n${flaggedConcerns.map((c) => `- ${c.suggestedQuestion}`).join('\n')}\n\nI look forward to hearing from you.\n\nBest regards,\n[Your Name]`,
        direct: `${recruiterGreeting}\n\nThanks for reaching out about the ${roleTitle} role at ${company}.\n\nTo make sure our expectations align before scheduling a call, could you please confirm:\n${flaggedConcerns.map((c) => `- ${c.suggestedQuestion}`).join('\n')}\n\nThanks,\n[Your Name]`,
        casual: `${recruiterGreeting.replace(/,$/, '!')}\n\nThanks for reaching out about ${company}! The role sounds interesting.\n\nQuick questions on compensation and terms:\n${flaggedConcerns.map((c) => `- ${c.suggestedQuestion}`).join('\n')}\n\nBest,\n[Your Name]`,
      },
      inferredFields,
      fieldSources,
      conflicts,
      referencesJobLinkWithoutPosting,
    };
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setIsSavedToTracker(false);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          jobPostingText: jobPostingText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errObj: any = new Error(errorData.error || `Server responded with HTTP ${response.status}`);
        errObj.statusCode = errorData.statusCode || response.status;
        errObj.model = errorData.model || 'gemini-3.5-flash-lite';
        errObj.rawError = errorData.rawError;
        throw errObj;
      }

      const res = await response.json();
      if (!res.data) {
        throw new Error('No analysis data received.');
      }

      setAnalysisResult(res.data);
      setLastAnalyzedRawText(inputText.trim());
      setLastAnalyzedJobPostingText(jobPostingText.trim());
      showToast('Analysis complete!');
    } catch {
      setErrorMessage(
        'Online analysis is temporarily unavailable. An offline summary was generated instead.'
      );

      const fallbackData = performFallbackExtraction(inputText.trim(), jobPostingText.trim());
      setAnalysisResult(fallbackData);
      setLastAnalyzedRawText(inputText.trim());
      setLastAnalyzedJobPostingText(jobPostingText.trim());
      showToast('Analysis report generated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToTracker = (itemData: {
    company: string;
    role: string;
    type: string;
    status: JobStatus;
    followUpDate: string;
    notes: string;
    analysis: ExtractedAnalysis;
    rawText: string;
  }) => {
    const newItem: TrackerItem = {
      id: `job-${Date.now()}`,
      company: itemData.company,
      role: itemData.role,
      type: itemData.type,
      status: itemData.status,
      followUpDate: itemData.followUpDate,
      notes: itemData.notes,
      pay: itemData.analysis.pay,
      inferredFields: itemData.analysis.inferredFields || [],
      fieldSources: itemData.analysis.fieldSources,
      conflicts: itemData.analysis.conflicts,
      createdAt: new Date().toISOString(),
      rawText: itemData.rawText,
      jobPostingText: lastAnalyzedJobPostingText,
      analysis: itemData.analysis,
      extractedDetails: {
        location: itemData.analysis.location,
        pay: itemData.analysis.pay,
        training: itemData.analysis.training,
        visaSponsorship: itemData.analysis.visaSponsorship,
        commitmentTerms: itemData.analysis.commitmentTerms,
        riskLevel: itemData.analysis.riskLevel,
        inferredFields: itemData.analysis.inferredFields || [],
      },
    };

    const updated = [newItem, ...trackerItems];
    setTrackerItems(updated);
    saveTrackerItems(updated);
    setIsSavedToTracker(true);
    showToast(`Saved "${newItem.company}" to your application tracker!`);
    setActiveView('tracker');
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setInputText('');
    setJobPostingText('');
    setErrorMessage(null);
    setIsSavedToTracker(false);
    setActiveView('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const el = document.getElementById('message-input-textarea') || document.querySelector('textarea');
      el?.focus();
    }, 80);
  };

  const handleUpdateTrackerItem = (id: string, updates: Partial<TrackerItem>) => {
    const updated = trackerItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setTrackerItems(updated);
    saveTrackerItems(updated);
    showToast('Tracker updated.');
  };

  const handleDeleteTrackerItem = (id: string) => {
    const updated = trackerItems.filter((item) => item.id !== id);
    setTrackerItems(updated);
    saveTrackerItems(updated);
    showToast('Opportunity removed from tracker.');
  };

  const handleAddManualItem = (data: Omit<TrackerItem, 'id' | 'createdAt'>) => {
    const newItem: TrackerItem = {
      ...data,
      id: `manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...trackerItems];
    setTrackerItems(updated);
    saveTrackerItems(updated);
    showToast(`Added "${newItem.company}" to tracker!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar with 3 View Tabs */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        trackerCount={trackerItems.length}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* VIEW 1: ANALYZE */}
        {activeView === 'analyze' && (
          <div className="animate-in fade-in duration-150">
            {/* Editorial Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
                  <span>New Grad Career Advocacy</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">Recruiter Message Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Recruiter Inbox Assistant
                </h1>
                <p className="text-sm text-slate-600 max-w-3xl mt-1.5 leading-relaxed">
                  Understand the real terms of recruiter offers before you reply. Extract key details, spot what's missing, and track your follow-ups.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {!showWelcome && (
                  <button
                    onClick={handleOpenWelcome}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                    title="View welcome overview & guide"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>How it works</span>
                  </button>
                )}

                <button
                  onClick={handleNewAnalysis}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors shadow-2xs"
                  title="Start a new recruiter message analysis"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* Welcome Banner for first-time users */}
            {showWelcome && (
              <WelcomeBanner
                onDismiss={handleDismissWelcome}
                onLoadSample={handleLoadSample}
              />
            )}

            {/* Message Input Section */}
            <MessageInput
              inputText={inputText}
              setInputText={setInputText}
              jobPostingText={jobPostingText}
              setJobPostingText={setJobPostingText}
              onAnalyze={handleAnalyze}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />

            {/* Analysis Results */}
            {analysisResult && (
              <AnalysisResults
                analysis={analysisResult}
                rawText={lastAnalyzedRawText}
                onSaveToTracker={handleSaveToTracker}
                isSavedToTracker={isSavedToTracker}
              />
            )}
          </div>
        )}

        {/* VIEW 2: TRACKER */}
        {activeView === 'tracker' && (
          <div className="animate-in fade-in duration-150">
            <TrackerTable
              items={trackerItems}
              onUpdateItem={handleUpdateTrackerItem}
              onDeleteItem={handleDeleteTrackerItem}
              onViewItemDetails={(item) => setSelectedDetailItem(item)}
              onOpenAddManual={() => setIsManualModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW 3: GUIDE */}
        {activeView === 'guide' && (
          <div className="animate-in fade-in duration-150">
            <NewGradSafetyGuide />
          </div>
        )}
      </main>

      {/* Modals */}
      <TrackerDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onUpdate={handleUpdateTrackerItem}
        onDelete={handleDeleteTrackerItem}
      />

      <AddManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAdd={handleAddManualItem}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Recruiter Inbox Assistant · Built for New Grad Software Engineers</span>
          <span className="text-slate-400">Review terms, clarify conditions, and manage follow-ups</span>
        </div>
      </footer>
    </div>
  );
}
