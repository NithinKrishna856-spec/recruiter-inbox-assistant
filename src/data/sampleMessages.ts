export interface SampleMessage {
  id: string;
  title: string;
  tag: string;
  tagColor: string;
  text: string;
  postingSnippet?: string;
  description: string;
}

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'posting-conflict',
    title: 'Discrepancy (Pay Mismatch & Link)',
    tag: 'Conflict',
    tagColor: 'text-amber-800 bg-amber-50 border-amber-200',
    description: 'Message quotes $95k vs posting $130k-$145k. Tests discrepancy detection and source attribution.',
    text: `Hi Alex,

I saw your GitHub profile and thought your background would be a great fit for our Junior Full Stack Developer opening at FinTech Systems!

We are offering an initial starting compensation of $95,000 base salary. Please take a look at the official job posting link below to review our tech stack:
https://fintechsystems.com/careers/junior-software-engineer

Let me know if you would like to set up a quick 15-minute introductory call this week!

Best,
Jordan Lee | Senior Tech Recruiter at FinTech Systems`,
    postingSnippet: `FinTech Systems — Official Job Posting:
Role: Associate Backend Engineer (New Grad)
Location: New York, NY (Hybrid: 2 days remote, 3 days in office)
Employment Type: Full-time Direct Hire (At-will)
Compensation: $130,000 - $145,000 base salary + 10% annual bonus
Visa Sponsorship: Actively supports F-1 STEM OPT extensions and H-1B lottery sponsorship.
Training: Dedicated 1-on-1 mentorship from Senior Staff Engineers with 6-month ramp-up.`,
  },
  {
    id: 'link-reference-tip',
    title: 'Outreach with Job Link (Tip Trigger)',
    tag: 'Job Link Tip',
    tagColor: 'text-sky-800 bg-sky-50 border-sky-200',
    description: 'Recruiter mentions an external job link while posting box is empty, triggering the helpful posting tip.',
    text: `Hi Alex,

Hope your week is going well! I came across your LinkedIn profile and noticed your strong computer science foundation.

Our engineering team at Nexus Data is expanding and we are actively interviewing for an Associate Software Engineer. Please review the complete job description and team requirements on our careers portal:
https://nexusdata.io/jobs/associate-swe-2026

If the position aligns with your goals, let's schedule some time to connect!

Thanks,
Rachel Adams | Technical Recruiter at Nexus Data`,
    postingSnippet: '',
  },
  {
    id: 'staffing-commitment',
    title: 'Staffing Firm (Commitment Terms)',
    tag: 'Terms to Clarify',
    tagColor: 'text-amber-800 bg-amber-50 border-amber-200',
    description: '10-week pre-placement training, 2-year commitment clause, $20k early repayment fee.',
    text: `Hi Alex,

We reviewed your GitHub and LinkedIn and were very impressed with your computer science fundamentals! We are actively hiring Entry-Level Software Engineers for our Fortune 500 Client Placement Cohort.

Here are the program highlights:
- 10 weeks of immersive virtual training covering Full Stack Java, Spring Boot, and Cloud Architecture (unpaid training, with a living stipend awarded only upon successful client placement).
- Upon cohort completion, you will be deployed to one of our premier financial or healthcare clients across the country. Candidates must be willing to relocate anywhere in the US at their own expense.
- Candidates must sign a mandatory 2-year employment commitment. If you leave the program or resign prior to the full 24 months, a $20,000 liquidated damages fee applies to reimburse our training expenses.
- Starting compensation begins at $55,000/year once placed with an end-client.

We have interviews happening this Thursday. Let me know if you would like to reserve a spot!

Best,
Marcus Vance
Senior Tech Talent Recruiter | Apex Global Workforce`,
    postingSnippet: `Company: Apex Global Workforce
Position: Entry-Level Software Trainee
Requirements: BS in Computer Science
Compensation: Competitive Market Rate upon placement. Mandatory 24-month client commitment.`,
  },
  {
    id: 'transparent-startup',
    title: 'Direct Hire Junior SWE (Startup)',
    tag: 'Direct Hire',
    tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    description: 'Transparent direct hire: clear salary band, hybrid policy, mentorship, visa support.',
    text: `Hi Alex,

I lead technical recruiting at CloudScale, a Series-B developer tooling startup based in San Francisco. I came across your distributed systems project on GitHub and thought your background would be a great fit for our Core Backend team.

Role Overview:
- Title: Associate Software Engineer (New Grad)
- Location: San Francisco, CA (Hybrid: 2 days in office, 3 days remote)
- Employment Type: Full-time Direct Hire (At-will employment)
- Compensation: Base salary $125,000 - $140,000 + stock options + $10,000 relocation stipend
- Benefits: 100% employer-covered health/dental/vision, 401(k) matching, and $2,000 annual learning stipend
- Onboarding: Every new grad is paired 1-on-1 with a Staff Engineer for a structured 6-month ramp-up and mentorship program.
- Visa: We actively support F-1 STEM OPT extensions and sponsor H-1B lottery filings.

Would you be open for a brief 20-minute chat this week to learn more about the team and what we're building?

Cheers,
Sarah Lin
Head of Talent | CloudScale Systems (cloudscale.io)`,
    postingSnippet: '',
  },
];
