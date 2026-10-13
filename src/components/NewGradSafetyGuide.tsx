import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const NewGradSafetyGuide: React.FC = () => {
  return (
    <section id="guide" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-12">
      <div className="pb-3 border-b border-slate-100 mb-5">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600" />
          <span>New Grad Job Search Safety Guide</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Practical guidance and points of clarification to consider when evaluating entry-level software engineering outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Red Flags Card */}
        <div className="p-4 rounded-lg bg-rose-50/40 border border-rose-200">
          <div className="flex items-center gap-2 mb-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Key Terms to Clarify</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <li>
              <strong>Training Compensation:</strong> Many employers pay full salary from day one; ask whether training is paid or if there are specific conditions attached.
            </li>
            <li>
              <strong>Commitment & Lock-in Clauses:</strong> Some programs include multi-year commitments or training repayment agreement provisions (TRAPs) with early-exit penalty fees. It is generally advisable to clarify whether any early-exit penalties or monetary obligations apply before signing.
            </li>
            <li>
              <strong>Unassigned "Bench" Periods:</strong> In staffing or consulting arrangements, compensation policies during unassigned bench periods between client projects can vary. Consider asking how transitions between projects are compensated.
            </li>
            <li>
              <strong>Experience Representation:</strong> Be mindful of agencies that suggest inflating your experience level on resumes presented to end clients, as technical evaluations will be pegged to that level.
            </li>
          </ul>
        </div>

        {/* Missing Pay Card */}
        <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200">
          <div className="flex items-center gap-2 mb-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Salary & Role Ambiguity</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <li>
              <strong>Pay Transparency:</strong> Multiple states and municipalities now require employers to disclose pay ranges in job listings. When a message lists only "competitive pay", asking for the base salary band or hourly rate early helps ensure expectations align.
            </li>
            <li>
              <strong>End-Client Placement:</strong> Staffing outreach often keeps the client confidential initially. You can ask for general industry details, team size, and the core tech stack if the client name cannot be shared yet.
            </li>
            <li>
              <strong>W-2 vs. 1099 Classification:</strong> W-2 roles typically involve standard employee tax withholding, whereas 1099 or independent contract work often requires handling your own self-employment taxes, insurance, and equipment.
            </li>
            <li>
              <strong>Relocation Expectations:</strong> If a role mentions nationwide deployment, inquire whether relocation is voluntary, what expenses are covered, and how much advance notice is provided.
            </li>
          </ul>
        </div>

        {/* Healthy Signs Card */}
        <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Encouraging Indicators</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
            <li>
              <strong>Transparent Compensation:</strong> Clear base salary bands, equity guidelines, and comprehensive benefits shared early in the conversation.
            </li>
            <li>
              <strong>Structured Onboarding & Mentorship:</strong> Defined 30/60/90-day ramp-up plans, buddy systems, or designated senior engineering mentors.
            </li>
            <li>
              <strong>Standard At-Will Employment:</strong> Conventional employment relationships that either party can end without financial repayment penalties.
            </li>
            <li>
              <strong>Clear Work Authorization Guidance:</strong> Direct and transparent communication regarding support for F-1 STEM OPT extensions and H-1B lottery sponsorship.
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Disclaimer Note */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 italic">
          This is general guidance, not legal advice. Laws vary by state.
        </p>
      </div>
    </section>
  );
};
