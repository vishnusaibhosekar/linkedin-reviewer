  
**PRODUCT REQUIREMENTS DOCUMENT**

**LinkedIn Reviewer**

*AI-Powered LinkedIn Profile Scoring & Rewrite Platform*

Reviewed & Vetted by Manish Maryada — Ex-Founder, YC Alum, Forbes 30u30

| Version 1.0 | Date May 2026 | Status Draft | Author Manish Maryada |
| :---- | :---- | :---- | :---- |

# **1\. Product Overview**

LinkedIn Reviewer is an AI-powered SaaS platform that helps professionals, students, and job seekers understand how strong their LinkedIn profile is — and how to make it better. Users receive a detailed score from 1–100 based on a structured rubric trained on best practices vetted by Manish Maryada (ex-Founder, YC Alum, Forbes 30 Under 30).

Beyond the score, users can unlock a premium add-on where Manish personally rewrites their LinkedIn profile within 2–3 business days, delivered directly to their dashboard or email.

| Core Problem Most professionals have no objective way to know how their LinkedIn profile compares — and generic advice doesn’t account for their specific occupation, goals, or experience level. | Our Solution A personalized, AI-driven score with expert credibility behind it — plus the option to have your profile rewritten by a recognized founder with hiring and networking experience. |
| :---- | :---- |

# **2\. Goals & Success Metrics**

## **2.1 Business Goals**

* Generate revenue through profile review fees and premium rewrite add-ons

* Establish Manish Maryada as the go-to expert authority for LinkedIn optimization

* Build a scalable, AI-first review pipeline that can handle high volume without manual bottlenecks

* Achieve recurring upsell from free/paid review to premium rewrite service

## **2.2 Key Success Metrics**

| Metric | Target (Month 3\) | Notes |
| :---- | ----- | :---- |
| Profile Reviews Completed | **500+** | Paid reviews submitted and scored |
| Rewrite Add-on Conversion | **15%+** | % of review users who purchase rewrite |
| Score Delivery Time | **\<5 min** | From payment to score display |
| Rewrite Delivery Time | **2–3 days** | From payment to written LinkedIn delivery |
| User Satisfaction (CSAT) | **4.5/5+** | Post-review satisfaction score |

# **3\. User Personas**

## **3.1 Persona A — The Active Job Seeker**

* Employed or recently laid off, actively applying for roles

* Wants to know if their LinkedIn is strong enough to get recruiter attention

* Likely to purchase the rewrite add-on if score is below 60

## **3.2 Persona B — The Student / Fresh Graduate**

* No or limited work experience, building their professional brand for the first time

* Price-sensitive but motivated by outcome (internships, first job)

* Likely to share on social if delighted with the experience

## **3.3 Persona C — The Established Professional**

* Currently employed, not actively looking but wants profile to reflect their seniority

* Higher willingness to pay for a premium rewrite service

* Values the credibility of the Manish Maryada brand

# **4\. User Flows & Features**

## **4.1 Flow 1: LinkedIn Profile Review**

This is the core product flow. Every user goes through these steps in order.

### **Step 1 — Landing & Authentication**

1. User arrives on the marketing landing page

2. User clicks “Get My LinkedIn Score” CTA

3. Authentication modal appears with options: Sign up / Log in via Email or Mobile (OTP)

4. On success, user is redirected to their Dashboard

### **Step 2 — Start New LinkedIn Review**

5. From the Dashboard, user clicks “New LinkedIn Review” button

6. A multi-step form wizard opens (progress indicator shown throughout)

Form fields collected across the wizard:

* Full Name

* Occupation Status — dropdown: Employed / Unemployed / Student

* Total Work Experience — e.g. 0-1 years, 1-3 years, 3-7 years, 7+ years

* Current Role / Job Title (if employed)

* Purpose of Review — dropdown: Job Search / Networking / Personal Branding / Freelancing / Other

* LinkedIn Profile URL

* Upload LinkedIn PDF (exported from LinkedIn settings)

* Upload LinkedIn Screenshots — minimum 3 required: Profile photo & banner, About section, Experience section

### **Step 3 — Payment**

7. User is shown a review summary and pricing

8. Payment gateway (Razorpay / Stripe) is opened

9. On payment success, a confirmation screen is shown and a receipt is emailed

### **Step 4 — AI Review Processing**

10. System sends the PDF \+ screenshots \+ form data to the AI review engine

11. A processing screen is shown with a progress animation (“Analyzing your profile…”)

12. Estimated wait time: 2–5 minutes

### **Step 5 — Score Report Delivery**

13. User is redirected to the Score Report page

14. Overall score (1–100) is displayed prominently with a visual gauge

15. Breakdown by each scoring category is shown with individual sub-scores

16. Qualitative feedback is shown for each category (what is working, what needs improvement)

17. A personalized action plan with 3–5 prioritized suggestions is shown at the bottom

18. Score report is also emailed to the user

## **4.2 Flow 2: LinkedIn Rewrite Add-On**

Available to the user immediately after their score report is generated, and also accessible anytime from their dashboard.

### **Step 1 — Rewrite Upsell CTA**

19. At the bottom of the Score Report, a CTA is shown: “Get Your LinkedIn Rewritten by Manish Maryada”

20. A modal/new page opens explaining what the rewrite includes and the turnaround time (2–3 business days)

### **Step 2 — Rewrite Intake Form**

21. User uploads their existing resume (PDF or DOCX)

22. User fills in additional context:

    * Key accomplishments or projects to highlight

    * Target roles or industries they are aiming for

    * Tone preference — formal / conversational / bold

    * Any specific sections they want improved most

23. User confirms their contact email for delivery

### **Step 3 — Payment & Confirmation**

24. User is shown the rewrite pricing and scope of work

25. Payment is completed via the payment gateway

26. Confirmation page and email are sent immediately with expected delivery date

### **Step 4 — Delivery**

27. Within 2–3 business days, the rewritten LinkedIn content is uploaded to the user’s dashboard under “My Rewrites”

28. User also receives an email notification with the deliverable attached or linked

29. Deliverable includes: Headline, About / Summary, Experience bullet points, Skills section recommendations

# **5\. AI Scoring Mechanism (Recommended Framework)**

The scoring rubric evaluates a LinkedIn profile on 9 dimensions. Each dimension has a maximum point value; all points sum to 100\. The AI is instructed to score each section based on the uploaded PDF, screenshots, and form metadata (occupation type, experience level, purpose). Below is the recommended scoring framework:

| Scoring Category | Max Points | What the AI Evaluates |
| :---- | :---: | :---- |
| **Profile Photo & Banner** | **10 pts** | Professional quality of photo, appropriate background, banner image relevance and branding. Checks for: face visibility, neutral/professional background, banner text or visual. |
| **Headline** | **15 pts** | Keyword richness, clarity of value proposition, specificity to role/industry. Great headlines go beyond job title. Penalised if it only states job title without context. |
| **About / Summary** | **15 pts** | Presence, length (150-300 words ideal), storytelling quality, keywords, call-to-action. Evaluated for first-person voice, clarity of who they are and what they offer. |
| **Work Experience** | **20 pts** | Number of roles listed, use of bullet points vs paragraphs, quantification of achievements (%, revenue, team size), relevance to stated purpose. Penalised for vague descriptions. |
| **Education** | **8 pts** | Completeness of education entries, relevance of courses or activities mentioned, distinction (honors, scholarships). Weighted lower for senior professionals. |
| **Skills & Endorsements** | **8 pts** | Presence of top 3 skills, number of skills listed (ideal: 10-20), endorsement count. Checks for relevance to stated role/industry. |
| **Recommendations** | **10 pts** | Number of recommendations received (ideal: 3+), quality indicators (specific, from senior peers), whether the user has given recommendations too. |
| **Achievements & Licenses** | **7 pts** | Presence of certifications, awards, publications, patents, volunteer work. Rewards users who show proof of expertise beyond job titles. |
| **Activity & Recent Posts** | **7 pts** | Whether the user has posted in the last 90 days (inferred from screenshots), engagement signals, consistency of posting. A dormant profile is penalized here. |

## **5.1 Scoring Calibration by User Type**

The AI scoring prompt is dynamically adjusted based on occupation status and experience level to ensure fair evaluation:

* Students: Work Experience weighted lower; Education, Achievements, and Skills weighted higher. Activity/posts scored more generously.

* Unemployed: Greater emphasis on Headline and About section quality as primary signals of professional identity.

* Employed (0-3 yrs): Balanced weighting. Extra credit for quantified achievements.

* Employed (7+ yrs): Work Experience and Recommendations weighted more heavily. Headline penalized if it lacks seniority signals.

## **5.2 Score Bands & Interpretation**

| Score Range | Label | Messaging to User |
| :---- | :---- | :---- |
| **1 – 39** | Needs Major Work | Your profile is currently not working for you. Key sections are incomplete or missing. A rewrite is strongly recommended. |
| **40 – 59** | Below Average | You have the basics but recruiters are unlikely to reach out. Significant gaps in storytelling and visibility. |
| **60 – 74** | Average | Your profile is functional but not memorable. Some sections are strong; others drag the overall impression down. |
| **75 – 89** | Strong | You have a solid, professional presence. A few targeted tweaks could push you into the top tier. |
| **90 – 100** | Exceptional | Elite LinkedIn profile. Recruiters will notice you. Share your score — you’ve earned it. |

# **6\. Dashboard & Portal Features**

## **6.1 User Dashboard**

* View all past LinkedIn reviews with scores and dates

* Access full score reports for each review

* View and download rewrite deliverables from “My Rewrites” section

* Start a new LinkedIn review at any time

* Purchase the rewrite add-on for any completed review

* Update account settings (name, email, mobile, notification preferences)

## **6.2 Notification System**

* Email confirmation on payment (review \+ rewrite)

* Email when score report is ready

* Email \+ dashboard notification when rewrite is delivered

* Optional: WhatsApp/SMS alerts for payment and delivery (future phase)

# **7\. Technical Requirements**

## **7.1 Platform**

* Web-first, fully responsive (mobile \+ desktop)

* Progressive Web App (PWA) support for mobile in Phase 2

## **7.2 Authentication**

* Email/password signup with email verification

* Mobile OTP login via SMS (Twilio or MSG91)

* Session persistence with JWT or cookie-based auth

## **7.3 File Handling**

* Accept PDF uploads up to 20MB (LinkedIn export)

* Accept image uploads (PNG, JPG, WEBP) up to 10MB per file, max 5 files

* Secure cloud storage for all user uploads (AWS S3 or equivalent)

* Files associated with user account and review session

## **7.4 AI Review Engine**

* Integration with a large language model API (e.g., Claude or GPT-4o) via Anthropic/OpenAI API

* Structured system prompt encoding the scoring rubric (Section 5\)

* Dynamic prompt injection of user metadata (occupation, experience, purpose)

* PDF text extraction \+ screenshot image analysis (vision capabilities required)

* Structured JSON output from AI: score per category, overall score, feedback text, top action items

* Retry logic and error handling for API failures

## **7.5 Payments**

* Primary: Razorpay (INR) for Indian users

* Secondary: Stripe (USD/international) for global users

* Webhooks to confirm payment before triggering review processing

* Invoices auto-generated and emailed on successful payment

## **7.6 Database**

* Users table: id, name, email, mobile, auth method, created\_at

* Reviews table: id, user\_id, status, form\_data JSON, score JSON, created\_at, completed\_at

* Rewrites table: id, review\_id, user\_id, status, intake\_form JSON, deliverable\_url, created\_at, delivered\_at

* Payments table: id, user\_id, type (review / rewrite), amount, currency, gateway, status, created\_at

# **8\. Non-Functional Requirements**

| Requirement | Specification |
| :---- | :---- |
| **Performance** | Score page must load in \< 3 seconds. API calls must time out gracefully after 60 seconds with a retry prompt. |
| **Security** | All file uploads encrypted at rest and in transit (TLS 1.2+). User data never shared with third parties. GDPR-compliant data deletion on request. |
| **Scalability** | Architecture must support 100 concurrent review processing jobs without degradation. Queue-based processing for AI calls. |
| **Reliability** | 99.5% uptime SLA. Automated alerts on API errors \> 5% in a 10-minute window. |
| **Accessibility** | WCAG 2.1 AA compliance for all public pages. Color contrast ratios met on score report page. |
| **Browser Support** | Chrome, Safari, Firefox, Edge — latest 2 versions. iOS Safari and Android Chrome for mobile. |

# **9\. Phased Rollout Plan**

## **Phase 1 — MVP (Weeks 1–8)**

* User authentication (email \+ OTP)

* Review intake form \+ file upload

* Payment integration (Razorpay)

* AI scoring engine with structured output

* Score report page with breakdown and feedback

* Rewrite add-on intake form \+ payment

* Basic dashboard (view past reviews, download rewrites)

* Email notifications (confirmation \+ delivery)

## **Phase 2 — Growth (Weeks 9–16)**

* Stripe integration for international payments

* WhatsApp/SMS delivery notifications

* Shareable score card (LinkedIn / Twitter sharing)

* Referral / affiliate program

* Admin dashboard for Manish to manage rewrite requests

* PWA / mobile optimization

## **Phase 3 — Scale (Post Week 16\)**

* Bulk / corporate review plans for HR teams

* LinkedIn profile comparison benchmarking (anonymous percentile ranking)

* Video walkthrough of score report (AI-narrated)

* API for partners / integrations

# **10\. Out of Scope (V1)**

* Direct LinkedIn API integration (platform policy restrictions)

* Automatic LinkedIn profile editing on behalf of users

* Resume builder (separate product)

* Job board or matching features

* Team collaboration features

# **12\. Application Flow Diagram**

The diagram below illustrates the full end-to-end user journey through the LinkedIn Reviewer platform, from landing on the website through to score delivery and optional rewrite add-on.

![][image1]

*Figure 1: LinkedIn Reviewer — Full User Journey Flowchart*

# **13\. Open Questions for Developer**

30. What is the pricing for the review and rewrite services? (Needed for payment integration)

31. Will the admin/rewrite management workflow be handled manually by Manish via email, or does the dev need to build an admin portal in Phase 1?

32. Which AI provider will be used for the review engine — Anthropic Claude or OpenAI?

33. Is there a preferred cloud provider (AWS, GCP, Azure) for file storage and hosting?

34. Should the platform support multiple languages (Hindi, etc.) in Phase 1?

35. Do we need a blog/marketing CMS (e.g., Webflow) integrated, or is this a standalone app with a static landing page?

*This document is confidential and intended for the development team only.*
