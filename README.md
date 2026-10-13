# Recruiter Inbox Assistant

> **Understand the real terms of recruiter offers before you reply.**

[![Live Demo](https://img.shields.io/badge/Live_App-recruiter--inbox--assistant.ai.studio-6366f1?style=for-the-badge&logo=google)](https://recruiter-inbox-assistant.ai.studio)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Gemini](https://img.shields.io/badge/Gemini_API-@google/genai-4285F4?style=for-the-badge&logo=googlegemini)](https://ai.google.dev)

---

## Overview

![Recruiter Inbox Assistant Screenshot](docs/screenshot.png)

**Live Application:** [https://recruiter-inbox-assistant.ai.studio](https://recruiter-inbox-assistant.ai.studio)

Recruiter outreach to software engineers—especially new grads—is notorious for vague summaries, omitted salary numbers, and hidden contractual lock-ins. **Recruiter Inbox Assistant** helps job seekers inspect outreach messages alongside linked job postings, spot critical missing details, flag discrepancies between the recruiter's pitch and the formal job description, and draft diplomatic, professional follow-up questions before committing to an interview.

---

## Why I Built It

As a new grad navigating the tech job market, I repeatedly received recruiter messages that left out critical terms:
- **Missing pay**: "Competitive salary" or no compensation figures at all.
- **Ambiguous employment arrangements**: Vague descriptions masking third-party staffing, contract-to-hire, or consulting agencies as direct hire roles.
- **Unstated training & lock-in terms**: Unpaid 8-12 week training sessions, mandatory relocation, or multi-year lock-in clauses with heavy liquidated damages for early departure.
- **Externalized job specs**: Key job details were often omitted from the LinkedIn/email message and tucked into a linked external job post instead.

I built this tool to give candidates instant clarity, eliminate asymmetric information in recruiter communications, and provide ready-to-send questions that tactfully clarify offer terms without sounding confrontational.

---

## Key Features

- **Dual-Input Analysis (Message + Job Posting)**: Analyze both the recruiter's message and the full job description simultaneously. If a message contains a link to a posting, the app prompts you to paste the posting details for complete analysis.
- **Fact-Level Source Attribution**: Every extracted fact (company, title, pay, location, employment type, training, visa sponsorship, commitment terms) is strictly labeled:
  - `From message` — Explicitly stated by the recruiter.
  - `From posting` — Found in the linked job description.
  - `Inferred` — Derived from verified company or industry context.
- **Discrepancy & Conflict Detection**: Automatically highlights contradictions between what the recruiter said and what the official posting states (e.g., recruiter says $95k vs. posting listing $130k–$145k), with objective explanations and clarifying questions.
- **Strict Missing-Information Guardrails**: Details are **only** flagged as missing if they are absent from *both* inputs. Never invents details—shows an explicit `"Not mentioned"` when unstated.
- **Email Draft Replies in 3 Tones**: Generates ready-to-copy email responses formatted with proper greetings, concise paragraphs, and placeholders (`[Your Name]`):
  - **Standard**: Polished, professional, and balanced.
  - **Direct**: Quick, concise, and straight to the point.
  - **Casual**: Friendly, conversational, and warm.
- **Follow-up Application Tracker**:
  - Save outreach entries directly into a local tracker table.
  - Track statuses (`To Review`, `Replied`, `Interviewing`, `Archived`).
  - Automatic overdue highlights for pending recruiter replies.
  - Full search, status filters, and one-click **CSV export**.
- **Job Search & Safety Guide**: Built-in reference covering offer terms, new-grad contract red flags, visa sponsorship caveats, and staffing agency practices.
- **Local Fallback Heuristics**: If the Gemini API is unreachable, offline, or rate-limited, the application automatically runs a rule-based parser on the client so users never face a broken screen or lost work.

---

## Tech Stack

### Frontend
- **React 19** (Functional components, custom hooks, typed interfaces)
- **Vite 8** (Fast modern bundler and dev server)
- **Tailwind CSS v4** (`@tailwindcss/vite` modern CSS utility engine)
- **Lucide React** (Clean, accessible UI icons)
- **Motion** (Smooth transitions and modal animations)
- **Client Storage**: `localStorage` (Privacy-first architecture; candidates' job search data stays local to their browser)

### Backend & AI
- **Node.js & Express** (`server.ts` entry point mounted with Vite middleware in development)
- **TypeScript & tsx** (Type-safe runtime execution)
- **@google/genai SDK**: Official Google GenAI SDK powering Gemini 3.5 Flash Lite & Gemini 3.8 Flash
- **Structured Outputs**: Strict JSON schemas (`Type.OBJECT`) to guarantee predictable response structure
- **Security-First API Proxy**: Server-side proxy (`/api/analyze`) ensuring the `GEMINI_API_KEY` is never exposed to the client or browser network logs

---

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/recruiter-inbox-assistant.git
cd recruiter-inbox-assistant
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

Open `.env` and configure your Gemini API key:
```env
# Required for recruiter message analysis
GEMINI_API_KEY="your-actual-gemini-api-key-here"

# Hosted URL (default is port 3000 locally)
PORT=3000
```

> **Note**: `.env` is ignored by `.gitignore` to prevent credentials from ever being committed to source control.

### 4. Start the application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser. The Express server serves both the API backend and the Vite frontend simultaneously.

### 5. Build for production
```bash
# Build the client bundle
npm run build

# Start the full-stack production server
npm start
```

---

## What I Learned

1. **The first build is only a draft; real testing exposes blind spots**:
   - Initial prototypes assumed recruiters wrote everything in their direct message. In practice, real outreach frequently links to external career portals or job boards. Adding dual-input analysis and conflict detection transformed the app from a simple text scanner into an indispensable offer evaluation tool.
2. **AI output requires strict guardrails to prevent hallucinations**:
   - Generative models naturally want to be helpful and may extrapolate missing numbers or standard benefits. We instituted strict negative constraints ("Never invent details", "Use strictly 'Not mentioned' when unstated"), structured schema enforcement, and explicit source attribution (`From message`, `From posting`, `Inferred`) to guarantee honest, dependable analysis.
3. **Design for failure with visible, functional fallbacks**:
   - Network dropouts, API rate limits, or upstream outages shouldn't result in a generic crash screen. Building a client-side heuristic fallback parser ensured users always receive immediate value and can continue reviewing terms offline.

---

## Disclaimer

This application is designed for educational and informational purposes to help job candidates evaluate outreach messages and job listings. It does **not** constitute legal, career, financial, or employment advice. Employment contracts and offer letters should be reviewed carefully with qualified legal or professional counsel before signing.
