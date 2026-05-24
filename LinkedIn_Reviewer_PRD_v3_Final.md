# LinkedIn Reviewer — Product Requirements Document

**Version:** 3.0 (Final Merged)  
**Date:** May 19, 2026  
**Product Owner:** Manish Maryada  
**Developer:** V  
**Status:** Draft — Pending Pricing & Alignment

---

## 1. Product Overview

LinkedIn Reviewer is an AI-powered SaaS platform that scores LinkedIn profiles on a scale of 1–100 using a structured rubric designed and vetted by Manish Maryada (ex-Founder, YC Alum, Forbes 30 Under 30).

Users sign up, submit their LinkedIn profile data (URL, PDF export, and screenshots), make a payment, and receive an AI-generated score report with a section-by-section breakdown, qualitative feedback, and a prioritized action plan. After receiving their score, users can purchase a premium add-on where Manish personally rewrites their LinkedIn profile, delivered in 2–3 business days.

**Core Problem:** Most professionals have no objective way to know how their LinkedIn profile compares — and generic advice doesn't account for their specific occupation, goals, or experience level.

**Our Solution:** A personalized, AI-driven score with expert credibility behind it — plus the option to have your profile rewritten by a recognized founder with hiring and networking experience.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

- Generate revenue through profile review fees and premium rewrite add-ons
- Establish Manish Maryada as the go-to authority for LinkedIn optimization
- Build a scalable, AI-first review pipeline that handles high volume without manual bottlenecks
- Achieve recurring upsell from paid review → premium rewrite service

### 2.2 Key Success Metrics

| Metric | Target (Month 3) | Notes |
|--------|-----------------|-------|
| Profile Reviews Completed | 500+ | Paid reviews submitted and scored |
| Rewrite Add-on Conversion | 15%+ | % of review users who purchase rewrite |
| Score Delivery Time | < 5 min | From payment to score display |
| Rewrite Delivery Time | 2–3 days | From payment to written LinkedIn delivery |
| User Satisfaction (CSAT) | 4.5/5+ | Post-review satisfaction score |
| Average AI Cost per Review | < $0.15 | OpenRouter token cost monitoring |

---

## 3. Target Users

**Persona A — The Active Job Seeker**
Employed or recently laid off, actively applying for roles. Wants to know if their LinkedIn is strong enough to get recruiter attention. Likely to purchase the rewrite add-on if score is below 60.

**Persona B — The Student / Fresh Graduate**
No or limited work experience, building their professional brand for the first time. Price-sensitive but motivated by outcome (internships, first job). Likely to share on social if delighted with the experience.

**Persona C — The Established Professional**
Currently employed, not actively looking but wants profile to reflect their seniority. Higher willingness to pay for premium rewrite. Values the credibility of the Manish Maryada brand.

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / Database | InsForge (Postgres + Auth + Storage) |
| Auth | InsForge (user records + sessions + JWT) |
| OTP Delivery | Zavu.dev (WhatsApp OTP primary, SMS fallback) |
| AI | OpenRouter (Claude Sonnet 4.5 default, swappable) |
| Payments | Dodo Payments (Global — INR, USD, multi-currency) |
| Profile Data | LinkedIn URL + PDF upload + Screenshot uploads |
| File Storage | InsForge Storage (S3-compatible — PDFs, screenshots, rewrite deliverables) |
| Messaging | Zavu.dev (WhatsApp notifications + transactional emails) |
| Hosting | Vercel |
| Design Language | Atlassian-style — clean white/blue, minimal chrome |

### 4.1 Tech Stack Decisions (Answering Manish's Open Questions)

| Manish's Question | Decision |
|-------------------|----------|
| Which AI provider? | OpenRouter gateway → Claude Sonnet 4.5 (Anthropic) as default. Swappable to GPT-4o or Gemini via env var. Vision-capable for screenshot analysis. |
| Cloud provider for storage? | InsForge Storage (S3-compatible, built into InsForge). No separate AWS/GCP needed. |
| OTP provider? | Zavu.dev (WhatsApp primary, SMS fallback). Replaces Twilio/MSG91. |
| Admin portal in Phase 1? | Yes — simple admin dashboard for Manish to manage rewrite orders (see Section 14). |
| Multiple languages? | English only for MVP. Hindi/regional in Phase 2. |
| Blog/CMS? | Static landing page in Next.js for MVP. No CMS integration. |

---

## 5. User Flows

### 5.1 Flow 1 — LinkedIn Profile Review (Core Product)

```
Landing Page → Sign Up / Login → Dashboard → New Review → Intake Form → Payment → AI Processing → Score Report
```

**Step 1 — Landing & Authentication**
User arrives on the marketing landing page. Clicks "Get My LinkedIn Score" CTA. Authentication modal appears with options: sign up/log in via Mobile (WhatsApp OTP via Zavu.dev, SMS fallback) or Email/Password. On success, user is redirected to their Dashboard.

**Step 2 — Start New LinkedIn Review**
From the Dashboard, user clicks "New LinkedIn Review" button. A multi-step form wizard opens with a progress indicator shown throughout.

**Intake form fields collected across the wizard:**

| Field | Type | Details |
|-------|------|---------|
| Full Name | Text input | Required |
| Occupation Status | Dropdown | Employed / Unemployed / Student |
| Total Work Experience | Dropdown | 0–1 years / 1–3 years / 3–7 years / 7+ years |
| Current Role / Job Title | Text input | Conditional — shown only if Employed |
| Purpose of Review | Dropdown | Job Search / Networking / Personal Branding / Freelancing / Other |
| LinkedIn Profile URL | Text input | URL validation applied |
| LinkedIn PDF | File upload | .pdf, max 20MB. Instructions: "Go to your LinkedIn → More → Save as PDF" |
| LinkedIn Screenshots | Multi-file upload | .png/.jpg/.webp, max 10MB per file, max 5 files. **Minimum 3 required:** (1) Profile photo & banner, (2) About section, (3) Experience section. Optional: Featured, Recommendations, Activity. |

All fields required except Current Role (conditional). Form validates before proceeding.

**Step 3 — Payment**
User is shown a review summary and pricing. Payment gateway (Dodo Payments) is opened. On payment success, a confirmation screen is shown and a receipt is emailed.

**Step 4 — AI Review Processing**
System sends the PDF + screenshots + form data to the AI review engine. A processing screen is shown with a progress animation ("Analyzing your profile…"). Estimated wait time: 2–5 minutes.

**Step 5 — Score Report Delivery**
User is redirected to the Score Report page:
- Overall score (1–100) displayed prominently with a visual gauge
- Breakdown by each of the 9 scoring categories with individual sub-scores
- Qualitative feedback for each category (what's working, what needs improvement)
- Personalized action plan with 3–5 prioritized suggestions at the bottom
- Prominent CTA: "Get Your LinkedIn Rewritten by Manish Maryada"
- Score report is also emailed to the user

### 5.2 Flow 2 — LinkedIn Rewrite Add-On

Available immediately after score report generation, and also accessible anytime from the dashboard.

```
Score Report → "Get Rewrite" CTA → Rewrite Intake Form → Payment → Manish Writes → Delivery (2-3 days)
```

**Step 1 — Rewrite Upsell CTA**
At the bottom of the Score Report, a CTA is shown: "Get Your LinkedIn Rewritten by Manish Maryada." A modal/new page opens explaining what the rewrite includes and the turnaround time (2–3 business days).

**Step 2 — Rewrite Intake Form**

| Field | Type | Details |
|-------|------|---------|
| Resume Upload | File upload | .pdf or .docx, max 20MB |
| Key Accomplishments | Textarea | "What projects or achievements do you want highlighted?" |
| Target Roles / Industries | Text input | Pre-filled from review intake if available |
| Tone Preference | Dropdown | Formal / Conversational / Bold |
| Sections to Improve Most | Multi-select | Headline / About / Experience / Skills / All |
| Contact Email | Email input | Pre-filled from account, editable |

**Step 3 — Payment & Confirmation**
User is shown the rewrite pricing and scope of work. Payment completed via Dodo Payments. Confirmation page and email sent immediately with expected delivery date.

**Step 4 — Delivery**
Within 2–3 business days, the rewritten LinkedIn content is uploaded to the user's dashboard under "My Rewrites." User also receives an email (and WhatsApp notification) with the deliverable attached or linked.

**Deliverable includes:** Headline, About/Summary, Experience bullet points (per role), Skills section recommendations.

### 5.3 Returning User Flow

```
Login → Dashboard → View past reviews / Start new review / Check rewrite status / Purchase rewrite for any past review
```

---

## 6. AI Scoring Framework

### 6.1 Scoring Rubric (100 Points Total)

The AI evaluates 9 dimensions. Each dimension has a maximum point value; all points sum to 100. The AI scores each section based on the uploaded PDF, screenshots, and form metadata (occupation type, experience level, purpose).

| # | Category | Max Points | What the AI Evaluates |
|---|----------|-----------|----------------------|
| 1 | Profile Photo & Banner | 10 | Professional quality of photo, appropriate background, banner image relevance and branding. Checks for: face visibility, neutral/professional background, banner text or visual. |
| 2 | Headline | 15 | Keyword richness, clarity of value proposition, specificity to role/industry. Great headlines go beyond job title. Penalized if it only states job title without context. |
| 3 | About / Summary | 15 | Presence, length (150–300 words ideal), storytelling quality, keywords, call-to-action. Evaluated for first-person voice, clarity of who they are and what they offer. |
| 4 | Work Experience | 20 | Number of roles listed, use of bullet points vs. paragraphs, quantification of achievements (%, revenue, team size), relevance to stated purpose. Penalized for vague descriptions. |
| 5 | Education | 8 | Completeness of education entries, relevance of courses or activities mentioned, distinction (honors, scholarships). Weighted lower for senior professionals. |
| 6 | Skills & Endorsements | 8 | Presence of top 3 skills, number of skills listed (ideal: 10–20), endorsement count. Checks for relevance to stated role/industry. |
| 7 | Recommendations | 10 | Number of recommendations received (ideal: 3+), quality indicators (specific, from senior peers), whether the user has given recommendations too. |
| 8 | Achievements & Licenses | 7 | Presence of certifications, awards, publications, patents, volunteer work. Rewards users who show proof of expertise beyond job titles. |
| 9 | Activity & Recent Posts | 7 | Whether the user has posted in the last 90 days (inferred from screenshots), engagement signals, consistency of posting. A dormant profile is penalized here. |

**Total: 100 points**

### 6.2 Dynamic Calibration by User Type

The AI scoring prompt is dynamically adjusted based on occupation status and experience level:

- **Students:** Work Experience weighted lower; Education, Achievements, and Skills weighted higher. Activity/posts scored more generously.
- **Unemployed:** Greater emphasis on Headline and About section quality as primary signals of professional identity.
- **Employed (0–3 years):** Balanced weighting. Extra credit for quantified achievements.
- **Employed (7+ years):** Work Experience and Recommendations weighted more heavily. Headline penalized if it lacks seniority signals.

### 6.3 Score Bands

| Score Range | Band Label | User-Facing Message |
|-------------|-----------|-------------------|
| 90–100 | Exceptional | Elite LinkedIn profile. Recruiters will notice you. Share your score — you've earned it. |
| 75–89 | Strong | You have a solid, professional presence. A few targeted tweaks could push you into the top tier. |
| 60–74 | Average | Your profile is functional but not memorable. Some sections are strong; others drag the overall impression down. |
| 40–59 | Below Average | You have the basics but recruiters are unlikely to reach out. Significant gaps in storytelling and visibility. |
| 1–39 | Needs Major Work | Your profile is currently not working for you. Key sections are incomplete or missing. A rewrite is strongly recommended. |

### 6.4 AI Output Format

The AI returns structured JSON that the frontend renders into the score report:

```json
{
  "overall_score": 62,
  "score_band": "Average",
  "user_message": "Your profile is functional but not memorable. Some sections are strong; others drag the overall impression down.",
  "sections": [
    {
      "name": "Profile Photo & Banner",
      "score": 7,
      "max_score": 10,
      "assessment": "Professional headshot present. Banner is the default LinkedIn gradient — a missed branding opportunity.",
      "strengths": ["Clear, well-lit headshot", "Face clearly visible"],
      "issues": ["Default banner image — no personal branding", "No banner text or visual that reinforces your positioning"],
      "suggestions": ["Create a custom banner showing your name, role, and key skills", "Use Canva or similar to create a branded LinkedIn banner"]
    },
    {
      "name": "Headline",
      "score": 10,
      "max_score": 15,
      "assessment": "Communicates current focus but lacks keywords recruiters search for.",
      "strengths": ["Clear indication of what you do", "Includes a credibility signal (Former Early Engineer)"],
      "issues": ["No mention of key technologies", "\"Stealth Startup\" doesn't help recruiters find you"],
      "suggestions": [
        "Software Engineer | AI Systems & LLM Infrastructure | TypeScript, Python, AWS",
        "AI Engineer | Building Production LLM Systems | Ex-OpenText"
      ]
    },
    {
      "name": "Work Experience",
      "score": 12,
      "max_score": 20,
      "assessment": "Current role has solid bullets but previous role has zero description.",
      "strengths": ["Current role has specific, detailed bullet points"],
      "issues": [
        "Previous role (1.75 years) has no description at all",
        "No quantified metrics in any bullet points",
        "Missing context on team size, scale, or user impact"
      ],
      "suggestions": [
        "Add 3-4 bullets to each past role describing what you built and its impact",
        "Add metrics: 'Reduced API latency by X%' or 'Served Y daily active users'",
        "Mention technologies used at each role"
      ]
    }
  ],
  "action_plan": [
    {
      "rank": 1,
      "section": "Work Experience",
      "action": "Add bullet points to all past roles — an empty role is a red flag to recruiters",
      "impact": "high"
    },
    {
      "rank": 2,
      "section": "Headline",
      "action": "Add target keywords and technologies to your headline",
      "impact": "high"
    },
    {
      "rank": 3,
      "section": "Recommendations",
      "action": "Request 2-3 recommendations from managers or senior colleagues",
      "impact": "medium"
    },
    {
      "rank": 4,
      "section": "Activity & Recent Posts",
      "action": "Post at least once per week about your work or industry",
      "impact": "medium"
    },
    {
      "rank": 5,
      "section": "Profile Photo & Banner",
      "action": "Create a custom banner that reinforces your professional brand",
      "impact": "low"
    }
  ]
}
```

### 6.5 Screenshot Analysis

For categories the PDF cannot cover (Profile Photo & Banner, Activity & Recent Posts, Recommendations, Achievements & Licenses), the AI uses vision capabilities to analyze uploaded screenshots. The prompt instructs the model to:

- Assess profile photo and banner image quality/presence
- Read visible Featured section items
- Read visible Recommendation text and count
- Assess recent Activity/Posts if visible (last 90 days)
- Identify certifications, awards, licenses
- Extract any data the PDF missed

Handled by sending screenshots as image inputs to the vision-capable model via OpenRouter.

---

## 7. Payment Integration

### 7.1 Pricing Structure

| Service | Price (INR) | Price (USD) | Notes |
|---------|------------|------------|-------|
| AI Profile Review | TBD (Manish to confirm) | TBD | One-time per review |
| Premium Rewrite by Manish | TBD (Manish to confirm) | TBD | Includes headline, about, experience, skills. 1 revision round. |

### 7.2 Payment Providers

**Dodo Payments** — Global payment acceptance platform. Supports UPI, credit/debit cards, net banking, wallets (India), plus Apple Pay, Google Pay, and international cards. Automatic currency detection and multi-currency support.

Auto-detect user's region (based on IP or explicit country selection) to show the appropriate payment provider.

### 7.3 Payment Flow

1. User completes intake form → shown order summary with price
2. Payment initiated via Dodo Payments checkout
3. On success: payment record created, review processing triggered, receipt emailed
4. On failure: user shown retry option, no review triggered
5. Webhook from Dodo Payments confirms payment status server-side (do not rely on client-side redirect alone)
6. Invoices auto-generated and emailed on successful payment

---

## 8. Database Schema (InsForge Postgres)

### 8.1 Tables

**users** (managed by InsForge Auth)
- id, email, phone, name, avatar_url, auth_provider, created_at

**otp_requests**
- id (UUID, PK)
- phone (VARCHAR) — E.164 format
- otp_hash (VARCHAR) — hashed OTP (never plaintext)
- expires_at (TIMESTAMPTZ) — created_at + 5 minutes
- attempts (INT, default 0) — max 5 failed attempts
- verified (BOOLEAN, default false)
- zavu_message_id (VARCHAR) — Zavu delivery tracking ID
- created_at (TIMESTAMPTZ)

**reviews**
- id (UUID, PK)
- user_id (FK → users)
- status (ENUM: 'pending_payment', 'paid', 'processing', 'completed', 'failed')
- full_name (VARCHAR)
- professional_status (ENUM: 'employed', 'unemployed', 'student')
- work_experience (VARCHAR) — "0-1", "1-3", "3-7", "7+"
- current_role (VARCHAR, nullable)
- purpose (VARCHAR) — selected purpose
- linkedin_url (TEXT)
- pdf_storage_path (TEXT) — InsForge Storage path
- screenshot_paths (TEXT[]) — array of InsForge Storage paths
- parsed_pdf_text (TEXT) — extracted text from PDF
- parsed_data (JSONB) — structured sections from PDF parsing
- review_data (JSONB) — full AI review output (Section 6.4 JSON)
- overall_score (INT, nullable)
- score_band (VARCHAR, nullable)
- model_used (VARCHAR) — e.g., "anthropic/claude-sonnet-4.5"
- tokens_used (INT, nullable)
- created_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ, nullable)

**payments**
- id (UUID, PK)
- user_id (FK → users)
- type (ENUM: 'review', 'rewrite')
- review_id (FK → reviews, nullable)
- rewrite_id (FK → rewrite_orders, nullable)
- amount (DECIMAL)
- currency (VARCHAR) — 'INR' or 'USD'
- provider (ENUM: 'razorpay', 'stripe')
- provider_transaction_id (VARCHAR)
- status (ENUM: 'pending', 'completed', 'failed', 'refunded')
- invoice_url (TEXT, nullable)
- created_at (TIMESTAMPTZ)

**rewrite_orders**
- id (UUID, PK)
- user_id (FK → users)
- review_id (FK → reviews) — links to the review that triggered this
- status (ENUM: 'pending_payment', 'paid', 'in_progress', 'completed', 'revision_requested', 'delivered')
- resume_storage_path (TEXT) — uploaded resume (.pdf or .docx)
- key_accomplishments (TEXT)
- target_roles (VARCHAR)
- tone_preference (ENUM: 'formal', 'conversational', 'bold')
- sections_to_improve (VARCHAR[]) — e.g., ['headline', 'about', 'experience']
- special_requests (TEXT, nullable)
- contact_email (VARCHAR)
- deliverable_path (TEXT, nullable) — InsForge Storage path to completed rewrite
- assigned_to (VARCHAR, default 'manish')
- created_at (TIMESTAMPTZ)
- due_date (TIMESTAMPTZ) — auto-set to created_at + 3 business days
- completed_at (TIMESTAMPTZ, nullable)

### 8.2 Row Level Security

- Users can only read/write their own reviews, payments, and rewrite orders
- Admin role (Manish) can read all rewrite orders and update their status/deliverables
- RLS policies enforced at the InsForge Postgres level

---

## 9. API Routes (Next.js App Router)

### 9.1 Auth
- `POST /api/auth/send-otp` — Generate OTP, store hashed with expiry, send via Zavu SDK (WhatsApp → SMS fallback)
- `POST /api/auth/verify-otp` — Verify OTP against stored hash, create/retrieve user in InsForge, issue JWT
- `POST /api/auth/login-email` — Email/password login (secondary)
- `POST /api/auth/signup-email` — Email/password signup (secondary)
- `POST /api/auth/logout` — Clear session

### 9.2 Reviews
- `POST /api/reviews` — Create new review (intake form data + file uploads)
- `GET /api/reviews` — List user's reviews
- `GET /api/reviews/:id` — Get full review detail including score report
- `POST /api/reviews/:id/process` — Internal: trigger AI processing after payment confirmed

### 9.3 Payments
- `POST /api/payments/create-order` — Create Dodo Payments checkout session
- `POST /api/payments/verify` — Verify payment callback/webhook
- `POST /api/webhooks/dodo` — Dodo Payments webhook handler

### 9.4 Rewrite Orders
- `POST /api/rewrites` — Create rewrite order (resume + intake data)
- `GET /api/rewrites` — List user's rewrite orders
- `GET /api/rewrites/:id` — Get rewrite order detail + deliverable download

### 9.5 Admin (Protected — Manish Only)
- `GET /api/admin/rewrites` — List all pending/in-progress rewrite orders
- `PATCH /api/admin/rewrites/:id` — Update status, upload deliverable
- `GET /api/admin/stats` — Dashboard stats (total reviews, revenue, conversion rate)

### 9.6 AI (Internal — Server Only)
- `POST /api/ai/review` — Construct prompt from parsed data + screenshots, call OpenRouter, store result
- `POST /api/ai/parse-pdf` — Extract and structure text from uploaded PDF

---

## 10. Design System

### 10.1 Principles

- **Atlassian-inspired:** Clean whites, blues, generous whitespace, clear typography
- **Minimal chrome:** No unnecessary borders, shadows, or decorative elements
- **Content-first:** The score report is the hero, not the UI
- **Trust-forward:** Manish's credibility signals (YC, Forbes) visible but not overbearing
- **Scannable:** Section cards with clear headers, scores, and expandable detail

### 10.2 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0052CC` | CTAs, active states, links |
| Primary Hover | `#0747A6` | Button hover states |
| Background | `#FFFFFF` | Page background |
| Surface | `#F4F5F7` | Card backgrounds, input fields |
| Text Primary | `#172B4D` | Headings, body text |
| Text Secondary | `#6B778C` | Captions, metadata, placeholders |
| Border | `#DFE1E6` | Dividers, card borders |
| Success | `#36B37E` | High scores (75+), positive feedback |
| Warning | `#FFAB00` | Medium scores (40–74), improvement areas |
| Danger | `#DE350B` | Low scores (<40), critical issues |
| Premium Gold | `#FFB800` | Rewrite upsell accents |

### 10.3 Typography

- **Font:** Inter (or system font stack as fallback)
- **Headings:** Semi-bold, `#172B4D`
- **Body:** Regular, 14px–16px
- **Captions/metadata:** 12px, `#6B778C`

### 10.4 Key Components (shadcn/ui)

- `Card` — Review section containers, dashboard items
- `Button` — Primary (blue filled), Secondary (outlined), Ghost, Premium (gold accent for rewrite CTA)
- `Input` / `Textarea` — Clean, minimal borders
- `Select` — Dropdowns for status, experience, purpose, tone
- `Badge` — Score indicators with color coding
- `Tabs` — Section navigation within score report
- `Skeleton` — Loading states during AI generation
- `Dialog` — Payment confirmation, rewrite intake
- `Progress` — Score visualization (circular gauge for overall, linear bars for sections)
- `FileUpload` — Drag-and-drop for PDF and screenshots with preview thumbnails
- `Stepper` — Multi-step form wizard progress indicator

---

## 11. PDF Parsing Strategy

### 11.1 MVP Approach

Use `pdf-parse` (Node.js) to extract raw text from the LinkedIn PDF export. Apply regex/heuristic parsing to identify sections:

- **Name:** First line, largest font
- **Headline:** Line immediately below name
- **Summary:** Text block after "Summary" header
- **Experience:** Blocks starting with company names, containing title + date range + bullets
- **Education:** Blocks after "Education" header
- **Skills:** "Top Skills" section in sidebar
- **Certifications:** "Certifications" section

### 11.2 Known Limitations of LinkedIn PDF

The PDF export does NOT include: Featured section content, Recommendations, Activity/posts, Skills with endorsement counts, Profile/banner photos, Custom URL.

These gaps are compensated by: screenshots (analyzed via vision model, minimum 3 required) and the LinkedIn URL (stored for reference, future API integration).

### 11.3 File Handling Requirements

- Accept PDF uploads up to 20MB (LinkedIn export)
- Accept image uploads (PNG, JPG, WEBP) up to 10MB per file, max 5 files
- Secure cloud storage via InsForge Storage for all user uploads
- Files associated with user account and review session
- Encrypted at rest and in transit (TLS 1.2+)

### 11.4 Future: Proxycurl Integration

Proxycurl ($0.01–0.03 per profile) can accept a LinkedIn URL and return structured JSON with all public profile sections. This eliminates PDF parsing and provides richer data. Deferred to Phase 3.

---

## 12. OpenRouter Integration

### 12.1 Configuration

- API endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Default model: `anthropic/claude-sonnet-4.5` (vision-capable for screenshot analysis)
- Streaming enabled for perceived performance during processing
- API key stored as environment variable, never exposed client-side
- Retry logic and error handling for API failures (timeout gracefully after 60s with retry prompt)

### 12.2 Request Structure

All AI calls go through a Next.js API route (server-side only). The route:

1. Retrieves the parsed profile text, user metadata, and screenshot images
2. Constructs the system prompt with scoring rubric (Section 6.1) + calibration for user type (Section 6.2)
3. Sends text + images to OpenRouter (multimodal request)
4. Receives structured JSON response matching Section 6.4 format
5. Validates the JSON structure, stores in the reviews table
6. Marks the review as 'completed', triggers email + WhatsApp notification

### 12.3 Cost Management

- Claude Sonnet 4.5 pricing: ~$3/M input, ~$15/M output tokens
- With screenshots (vision): input cost is higher (~$0.05–$0.15 per review depending on screenshot count)
- Since reviews are paid, cost is covered by revenue — but monitor cost/revenue ratio
- Track token usage per review in database

### 12.4 Model Swapping

The model is configurable via environment variable (`OPENROUTER_MODEL`). Switching models requires only changing the env var. The model must support vision/multimodal for screenshot analysis.

---

## 13. Zavu.dev Integration (OTP & Messaging)

### 13.1 OTP Authentication Flow

```
User enters phone number
    → Backend generates 6-digit OTP (crypto.randomInt)
    → Backend stores OTP hash + expiry (5 min) in InsForge Postgres
    → Backend calls Zavu SDK to send OTP via WhatsApp (SMS auto-fallback)
    → User receives OTP on WhatsApp (or SMS)
    → User enters OTP in app
    → Backend verifies against stored hash
        → On match: create/retrieve user in InsForge, issue JWT
        → On mismatch: increment attempt counter, block after 5 failed attempts
```

### 13.2 Implementation

```typescript
import Zavudev from '@zavudev/sdk';

const zavu = new Zavudev({
  apiKey: process.env.ZAVU_API_KEY,
});

const message = await zavu.messages.send({
  to: '+919876543210',
  messageType: 'template',
  content: {
    templateId: 'tmpl_otp_verification',
    templateVariables: { '1': otpCode }
  }
});
```

### 13.3 Rate Limiting

- Max 5 OTP requests per phone number per hour
- Max 5 verification attempts per OTP before invalidation
- Exponential backoff on repeated failures (30s, 60s, 120s cooldown)

### 13.4 WhatsApp Template (Pre-Launch Requirement)

Create and get Meta approval for an OTP auth template via Zavu's dashboard before launch. Meta approval takes 1–3 days. Start during development.

### 13.5 Transactional Notifications via Zavu

Beyond OTP, Zavu handles WhatsApp notifications for key events (score ready, rewrite delivered) and can handle transactional emails. Alternatively, use Resend/Postmark for email.

### 13.6 Cost Estimate

- WhatsApp auth in India: ~₹0.20 ($0.0024) per message
- At 1,000 users/month with 2 OTPs each: ~₹400/month ($5)
- Negligible at MVP scale

---

## 14. Admin Dashboard (Manish)

### 14.1 Purpose

A simple internal dashboard for Manish to manage rewrite fulfillment and monitor business metrics. Not user-facing. Built in Phase 1.

### 14.2 Features

**Rewrite Queue**
- List of all rewrite orders with status filters (Paid / In Progress / Completed / Revision Requested)
- Each order shows: user name, their AI score report, uploaded resume, intake form answers, tone preference
- Action buttons: Mark as In Progress, Upload Deliverable, Mark as Completed
- Due date tracking with overdue highlighting

**Business Stats**
- Total reviews generated (all time / this month)
- Total revenue (reviews + rewrites, by currency)
- Review-to-rewrite conversion rate
- Average score across all reviews
- Revenue per user

### 14.3 Access Control

Admin routes protected by role check. Only Manish's user ID (or users with `admin` role flag) can access `/admin/*` routes.

---

## 15. Notifications

| Trigger | Channel | Recipient | Content |
|---------|---------|-----------|---------|
| OTP request | WhatsApp (SMS fallback) | User | "{{code}} is your verification code. Expires in 5 minutes." |
| Payment confirmed (review) | Email | User | "Your LinkedIn review is being processed. Score in ~5 minutes." + receipt |
| Score report ready | WhatsApp + Email | User | "Your LinkedIn score is ready! You scored X/100." + link |
| Rewrite order placed | Email | User + Manish | User: confirmation + delivery date. Manish: new order alert. |
| Rewrite delivered | WhatsApp + Email | User | "Your LinkedIn rewrite is ready! Download from your dashboard." |
| Rewrite revision requested | Email | Manish | "User X has requested a revision." |

---

## 16. Dashboard & Portal Features

### 16.1 User Dashboard

- View all past LinkedIn reviews with scores and dates
- Access full score reports for each review
- View and download rewrite deliverables from "My Rewrites" section
- Start a new LinkedIn review at any time
- Purchase the rewrite add-on for any completed review
- Update account settings (name, email, mobile, notification preferences)

### 16.2 Score Report Page

- Overall score with circular visual gauge
- 9 category cards with individual scores, strengths, issues, and suggestions
- Expandable/collapsible detail per category
- Action plan at the bottom with ranked improvements
- "Get Your LinkedIn Rewritten" premium CTA
- Share score (Phase 2)

---

## 17. Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| Performance | Score page loads in <3s. API calls timeout gracefully after 60s with retry prompt. WhatsApp OTP delivered in <3s. |
| Security | All file uploads encrypted at rest and in transit (TLS 1.2+). User data never shared with third parties. GDPR-compliant data deletion on request. OTPs stored as hashes only. All API keys server-side only. Webhook signatures verified. |
| Scalability | Architecture must support 100 concurrent review processing jobs without degradation. Queue-based processing for AI calls. Stateless API routes on Vercel serverless. |
| Reliability | 99.5% uptime SLA. Automated alerts on API errors >5% in a 10-minute window. |
| Accessibility | WCAG 2.1 AA compliance for all public pages. Color contrast ratios met on score report page. |
| Browser Support | Chrome, Safari, Firefox, Edge — latest 2 versions. iOS Safari and Android Chrome for mobile. |

---

## 18. Phased Rollout

### Phase 1 — MVP (Weeks 1–8)

- User authentication (email + WhatsApp OTP via Zavu.dev)
- Review intake form wizard + file uploads (PDF + screenshots)
- Payment integration (Dodo Payments for global acceptance)
- AI scoring engine with structured JSON output via OpenRouter
- Score report page with breakdown, feedback, and action plan
- Rewrite add-on intake form + payment
- Basic dashboard (view past reviews, download rewrites)
- Admin dashboard for Manish to manage rewrite orders
- Email + WhatsApp notifications (OTP, confirmation, delivery)

### Phase 2 — Growth (Weeks 9–16)

- Multi-currency support expansion (additional payment methods via Dodo Payments)
- WhatsApp/SMS delivery notifications for all events
- Shareable score card (LinkedIn/Twitter sharing image)
- Referral / affiliate program
- PWA / mobile optimization
- Hindi language support

### Phase 3 — Scale (Post Week 16)

- Proxycurl integration for URL-based profile extraction
- Bulk / corporate review plans for HR teams
- LinkedIn profile comparison benchmarking (anonymous percentile ranking)
- AI-narrated video walkthrough of score report
- AI-powered rewrite draft (AI generates first draft, Manish reviews/refines)
- API for partners / integrations
- Chrome extension for one-click review

---

## 19. Out of Scope (V1)

- Direct LinkedIn API integration (platform policy restrictions)
- Automatic LinkedIn profile editing on behalf of users
- Resume builder (separate product)
- Job board or matching features
- Team collaboration features
- Blog/CMS integration (static landing page only)

---

## 20. Application Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     LANDING PAGE                         │
│            "Get Your LinkedIn Score"                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SIGN UP / LOGIN                         │
│        Phone → WhatsApp OTP (Zavu.dev) → Verify          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD                             │
│         Past reviews + "New Review" button               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               INTAKE FORM WIZARD                         │
│   Name, Status, Experience, Role, Purpose,               │
│   LinkedIn URL, PDF Upload, 3+ Screenshots               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    PAYMENT                                │
│              Dodo Payments                            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                AI PROCESSING                             │
│    Parse PDF + Analyze 3+ Screenshots + Score            │
│            "Analyzing your profile…"                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 SCORE REPORT                             │
│     Overall: 62/100 — 9 category breakdown              │
│     Feedback + Action Plan (3-5 items)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │  Want   │
                    │ Rewrite?│
                    └────┬────┘
               ┌─────┐  │  ┌─────┐
               │ No  │◄─┘─►│ Yes │
               └──┬──┘     └──┬──┘
                  │           │
                  ▼           ▼
            ┌──────────┐  ┌──────────────────────────────┐
            │   Done   │  │     REWRITE INTAKE FORM       │
            │  (Exit)  │  │  Resume, Accomplishments,     │
            └──────────┘  │  Tone, Sections + Payment     │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   MANISH WRITES (2-3 days)   │
                          │   Admin dashboard manages    │
                          └──────────────┬───────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   DELIVERY                   │
                          │   Dashboard + Email +        │
                          │   WhatsApp notification      │
                          └──────────────────────────────┘
```

---

## 21. Open Questions (Align Before Development)

| # | Question | Status |
|---|----------|--------|
| 1 | **Pricing:** What is the price for AI review and premium rewrite? Launch/early-bird pricing? | Pending — Manish to confirm |
| 2 | **Payment provider:** Dodo Payments from day one for global reach | Decision: Dodo Payments supports INR + USD + multi-currency from launch |
| 3 | **Refund policy:** Under what conditions can a user request a refund? | Pending — Manish to confirm |
| 4 | **Screenshot validation:** What if user uploads blurry/cropped/irrelevant images? Reject + re-request, or proceed with warning? | Recommendation: Proceed with warning, note in report if data was insufficient |
| 5 | **Prompt iteration:** Plan for 3–5 iterations of the scoring prompt. Budget time for testing with 20+ real profiles. | Development phase |
| 6 | **PDF parsing edge cases:** LinkedIn changes PDF layout periodically. Need diverse testing corpus (students, executives, sparse, non-English). | Development phase |
| 7 | **Legal:** Terms of service for storing/analyzing LinkedIn data. Privacy policy for payment data. | Pending — needs legal review |
| 8 | **CSAT collection:** How to collect the 4.5/5 satisfaction score? In-app rating after viewing report? | Recommendation: Thumbs up/down per section + optional 1-5 star overall |
