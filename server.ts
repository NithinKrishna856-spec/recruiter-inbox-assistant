import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    company: {
      type: Type.STRING,
      description: "Company name, or 'Not mentioned' if unspecified."
    },
    roleTitle: {
      type: Type.STRING,
      description: "Job title or role name, or 'Not mentioned' if unspecified."
    },
    location: {
      type: Type.STRING,
      description: "Work location and remote status (e.g. 'San Francisco, CA (Hybrid)', 'Remote (US)', 'Austin, TX (In-Person)'), or 'Not mentioned'."
    },
    employmentType: {
      type: Type.STRING,
      description: "Employment arrangement: 'Direct hire', 'Staffing / Consulting', 'Contract', 'Contract-to-hire', or 'Not mentioned'."
    },
    pay: {
      type: Type.STRING,
      description: "Compensation, salary range, or hourly rate details. Explicitly 'Not mentioned' if omitted or vague without numbers."
    },
    training: {
      type: Type.STRING,
      description: "Training details (e.g. 'Paid 8-week onboarding', 'Unpaid 10-week pre-employment training', 'Mentorship provided'), or 'Not mentioned'."
    },
    visaSponsorship: {
      type: Type.STRING,
      description: "Visa sponsorship and work authorization terms (e.g. 'OPT/CPT friendly', 'H-1B transfer supported', 'US Citizens / GC only', 'No sponsorship'), or 'Not mentioned'."
    },
    commitmentTerms: {
      type: Type.STRING,
      description: "Commitment clauses, contract duration, or lock-in terms (e.g. '2-year mandatory commitment with $20,000 penalty clause for early exit', 'At-will employment', '6-month contract with renewal'), or 'Not mentioned'."
    },
    inferredFields: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Array of field names (e.g. 'employmentType', 'location', 'pay', etc.) that were NOT explicitly stated in the message, but inferred based on general knowledge about the company or industry. Return empty [] if fields were directly stated in the text."
    },
    fieldSources: {
      type: Type.OBJECT,
      properties: {
        company: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        roleTitle: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        location: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        employmentType: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        pay: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        training: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        visaSponsorship: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." },
        commitmentTerms: { type: Type.STRING, description: "'From message', 'From posting', or 'Inferred'." }
      },
      required: ["company", "roleTitle", "location", "employmentType", "pay", "training", "visaSponsorship", "commitmentTerms"],
      description: "Origin source for each of the 8 extracted fields: strictly 'From message', 'From posting', or 'Inferred'."
    },
    conflicts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING, description: "Name of field where message and posting conflict (e.g. 'pay', 'roleTitle', 'location', 'employmentType')." },
          messageValue: { type: Type.STRING, description: "Value or terms stated in the recruiter message." },
          postingValue: { type: Type.STRING, description: "Value or terms stated in the linked job posting." },
          explanation: { type: Type.STRING, description: "Clear explanation of the contradiction and why it matters." },
          suggestedQuestion: { type: Type.STRING, description: "Question the candidate should ask to resolve the discrepancy." }
        },
        required: ["field", "messageValue", "postingValue", "explanation", "suggestedQuestion"]
      },
      description: "List of discrepancies or contradictions between the recruiter message and the job posting."
    },
    referencesJobLinkWithoutPosting: {
      type: Type.BOOLEAN,
      description: "True if the recruiter message references a job link or posting, but no job posting details were provided in the job posting text input."
    },
    summary: {
      type: Type.STRING,
      description: "A concise 1-2 sentence executive summary of the opportunity for a new grad software engineer."
    },
    riskLevel: {
      type: Type.STRING,
      description: "Overall terms assessment for a software engineer: 'Caution' (significant commitment terms, exit repayment clauses, or unpaid training), 'Moderate' (unspecified pay, undisclosed end-client, or discrepancy between inputs), or 'Standard' (transparent direct hire or clear contract terms)."
    },
    flaggedConcerns: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Category: 'Commitment & Terms', 'Training & Compensation', 'Compensation', 'Employment Type & Placement', 'Visa & Work Auth', or 'Role Clarity'."
          },
          severity: {
            type: Type.STRING,
            description: "Severity level: 'high' (significant terms with monetary exit clauses or unpaid training), 'medium' (unspecified salary or undisclosed end-client), 'low' (role stack clarification)."
          },
          flag: {
            type: Type.STRING,
            description: "Short neutral title of the term to clarify (e.g. 'Mandatory 2-Year Commitment Clause', 'Unpaid Training Period', 'Base Salary Not Disclosed', 'End-Client Placement Unspecified')."
          },
          explanation: {
            type: Type.STRING,
            description: "Objective explanation of the term to clarify, keeping the tone neutral without accusing employers."
          },
          suggestedQuestion: {
            type: Type.STRING,
            description: "The exact professional, courteous question the candidate can ask the recruiter to clarify terms."
          }
        },
        required: ["category", "severity", "flag", "explanation", "suggestedQuestion"]
      },
      description: "List of terms to clarify and corresponding professional questions to ask."
    },
    draftReplies: {
      type: Type.OBJECT,
      properties: {
        standard: {
          type: Type.STRING,
          description: "A professional reply formatted strictly like a real email: greeting on its own line followed by an empty line (e.g. 'Hi [Recruiter Name or there],\\n\\n'), 1-2 short paragraphs separated by blank lines politely showing interest and asking the flagged questions, and a professional sign-off on its own line followed by '[Your Name]' on its own line (e.g. '\\n\\nBest regards,\\n[Your Name]')."
        },
        direct: {
          type: Type.STRING,
          description: "A concise, direct reply formatted strictly like a real email: greeting on its own line followed by an empty line (e.g. 'Hi [Recruiter Name or there],\\n\\n'), short paragraphs separated by blank lines getting straight to questions about compensation, contract, and role clarity, and a professional sign-off on its own line followed by '[Your Name]' on its own line (e.g. '\\n\\nBest,\\n[Your Name]')."
        },
        casual: {
          type: Type.STRING,
          description: "A warm, conversational reply formatted strictly like a real email: greeting on its own line followed by an empty line (e.g. 'Hi [Recruiter Name or there],\\n\\n'), short friendly paragraphs separated by blank lines integrating the clarifying questions, and a warm sign-off on its own line followed by '[Your Name]' on its own line (e.g. '\\n\\nThanks,\\n[Your Name]')."
        }
      },
      required: ["standard", "direct", "casual"]
    }
  },
  required: [
    "company",
    "roleTitle",
    "location",
    "employmentType",
    "pay",
    "training",
    "visaSponsorship",
    "commitmentTerms",
    "inferredFields",
    "fieldSources",
    "conflicts",
    "referencesJobLinkWithoutPosting",
    "summary",
    "riskLevel",
    "flaggedConcerns",
    "draftReplies"
  ]
};

// Primary free-tier model (switchable to backup if unavailable)
const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const BACKUP_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

// API Endpoint for message analysis
app.post('/api/analyze', async (req: Request, res: Response) => {
  let modelAttempted = PRIMARY_MODEL;
  try {
    const { text, jobPostingText } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Please provide recruiter text or job posting to analyze.', statusCode: 400, model: PRIMARY_MODEL });
      return;
    }

    const trimmedMessage = text.trim();
    const trimmedPosting = typeof jobPostingText === 'string' ? jobPostingText.trim() : '';

    let combinedPrompt = `[RECRUITER MESSAGE]\n${trimmedMessage}`;
    if (trimmedPosting) {
      combinedPrompt += `\n\n[JOB POSTING DETAILS]\n${trimmedPosting}`;
    } else {
      combinedPrompt += `\n\n[JOB POSTING DETAILS]\n(No separate job posting provided)`;
    }

    const systemInstruction = `You are an expert career advisor and offer terms analyst for software engineers.
You analyze recruiter outreach messages and optional job posting details.

FOUR MANDATORY RULES (STRICT COMPLIANCE REQUIRED):
1. NEVER INVENT DETAILS:
   - If information is not in the message or posting (and cannot be reliably inferred), show strictly "Not mentioned".
   - Never assume, guess, or fabricate numbers, benefits, or policies.
2. ALWAYS LABEL EACH FACT:
   - For each extracted field (company, roleTitle, location, employmentType, pay, training, visaSponsorship, commitmentTerms), set 'fieldSources[fieldName]' strictly to one of:
     * "From message" if the fact came from the recruiter message.
     * "From posting" if the fact came from the job posting details.
     * "Inferred" if it was not explicitly in either input, but inferred based on verified industry or company knowledge.
3. ONLY FLAG A FIELD AS MISSING IF IT'S MISSING FROM BOTH INPUTS:
   - If either the message OR the posting provides the detail, extract it and do NOT flag it as missing.
   - Only set a field to "Not mentioned" and add a flagged concern if it is missing from BOTH inputs.
4. KEEP THE TONE NEUTRAL:
   - Describe terms to clarify; do NOT accuse employers or use emotional/hostile terminology (do not call companies "predatory", "body shops", "scams", or "shady").
   - Frame every observation as an objective term, clause, commitment, or detail to clarify before proceeding.
   - All suggested inquiries and draft replies must remain professional, courteous, and diplomatic.

CONFLICT DETECTION (DISCREPANCIES):
If the recruiter message and job posting contradict each other on any field (e.g., different pay or job title, different location, or different employment types like direct hire vs contract):
- Add an entry to 'conflicts' with 'field', 'messageValue', 'postingValue', 'explanation', and 'suggestedQuestion'.
- Describe the difference objectively (e.g., "The recruiter message states $95,000 while the job posting lists $130,000-$145,000. Clarifying which compensation applies ensures mutual alignment.").
- Naturally integrate this clarifying question into the draft replies.

JOB LINK REFERENCE DETECTION:
- If the job posting input was NOT provided (is empty or "(No separate job posting provided)"), and the recruiter message mentions a job link, URL (http/https), or references an external posting ("see posting", "link below", "apply on portal", "job description here", "linked posting", etc.):
- Set 'referencesJobLinkWithoutPosting' to true. Otherwise false.

DRAFT REPLIES FORMATTING (REAL EMAIL FORMAT):
Format every draft reply (standard, direct, casual) strictly like a real email:
- GREETING ON ITS OWN LINE: Start with a greeting on its own line followed by an empty line (e.g., "Hi [Recruiter Name]," or "Hi there," if no recruiter name was stated).
- SHORT PARAGRAPHS: Keep paragraphs short (1-2 sentences each), separated by blank lines (\\n\\n). Tactfully integrate the questions for terms needing clarification.
- SIGN-OFF ON ITS OWN LINE WITH NAME PLACEHOLDER: End with a professional sign-off on its own line followed by the exact placeholder "[Your Name]" on the next line (e.g., "\\n\\nBest regards,\\n[Your Name]" or "\\n\\nBest,\\n[Your Name]" or "\\n\\nThanks,\\n[Your Name]").`;

    const modelsToTry = [PRIMARY_MODEL, ...BACKUP_MODELS];
    let responseText: string | undefined;
    let lastError: any;

    for (const m of modelsToTry) {
      try {
        modelAttempted = m;
        const response = await ai.models.generateContent({
          model: m,
          contents: combinedPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
            temperature: 0.1,
          },
        });
        responseText = response.text;
        if (responseText) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${m} call failed:`, err?.message || err);
        // If not a 503/429, don't cascade, break immediately
        const msg = String(err?.message || '');
        if (!msg.includes('503') && !msg.includes('429') && !msg.includes('UNAVAILABLE')) {
          break;
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error(`No response generated by model ${modelAttempted}.`);
    }

    const parsedData = JSON.parse(responseText);
    res.json({ success: true, data: parsedData, model: modelAttempted });
  } catch (error: any) {
    console.error('Error analyzing recruiter message with Gemini:', error);

    let statusCode = 500;
    let errorMessage = error?.message || 'Failed to analyze message. Please try again.';

    // Parse JSON error response from Google GenAI SDK if present
    try {
      if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
        const parsed = JSON.parse(errorMessage);
        if (parsed?.error?.code) statusCode = Number(parsed.error.code) || statusCode;
        if (parsed?.error?.message) errorMessage = parsed.error.message;
      }
    } catch {
      // not a json string
    }

    if (error?.status) statusCode = Number(error.status) || statusCode;
    if (error?.statusCode) statusCode = Number(error.statusCode) || statusCode;

    const httpStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

    res.status(httpStatus).json({
      error: errorMessage,
      statusCode: httpStatus,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recruiter Inbox Assistant server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
