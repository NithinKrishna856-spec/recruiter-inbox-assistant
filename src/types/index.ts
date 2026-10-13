export type JobStatus =
  | 'New'
  | 'Replied'
  | 'Interviewing'
  | 'Offer'
  | 'Rejected'
  | 'Not interested';

export type FieldSource = 'From message' | 'From posting' | 'Inferred';

export interface FieldConflict {
  field: string;
  messageValue: string;
  postingValue: string;
  explanation: string;
  suggestedQuestion?: string;
}

export interface FlaggedConcern {
  category: string;
  severity: 'high' | 'medium' | 'low';
  flag: string;
  explanation: string;
  suggestedQuestion: string;
}

export interface DraftReplies {
  standard: string;
  direct: string;
  casual: string;
}

export interface ExtractedAnalysis {
  company: string;
  roleTitle: string;
  location: string;
  employmentType: string;
  pay: string;
  training: string;
  visaSponsorship: string;
  commitmentTerms: string;
  summary: string;
  riskLevel: 'Caution' | 'Moderate' | 'Standard';
  flaggedConcerns: FlaggedConcern[];
  draftReplies: DraftReplies;
  inferredFields?: string[];
  fieldSources?: Record<string, FieldSource>;
  conflicts?: FieldConflict[];
  referencesJobLinkWithoutPosting?: boolean;
}

export interface TrackerItem {
  id: string;
  company: string;
  role: string;
  type: string;
  status: JobStatus;
  followUpDate: string; // YYYY-MM-DD
  notes: string;
  pay?: string;
  createdAt: string; // ISO date
  rawText?: string;
  jobPostingText?: string;
  analysis?: ExtractedAnalysis;
  inferredFields?: string[];
  fieldSources?: Record<string, FieldSource>;
  conflicts?: FieldConflict[];
  extractedDetails?: {
    location?: string;
    pay?: string;
    training?: string;
    visaSponsorship?: string;
    commitmentTerms?: string;
    riskLevel?: string;
    inferredFields?: string[];
  };
}
