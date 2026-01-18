# Product Specifications & AI Personas

This project relies heavily on specific prompting strategies to ensure high-quality output.

## 1. The "Ruthless Hiring Manager" Persona
The AI is instructed to act as a strict, pragmatic recruiter who hates "fluff".

### Negative Constraints (The "Forbidden List")
The AI must NEVER use these words:
*   Spearheaded
*   Orchestrated
*   Leveraged
*   Crucial
*   Visionary
*   Comprehensive
*   Synergy
*   Transformational
*   "Utilized" (unless referring to a specific physical tool)

### Positive Constraints
*   **Active Verbs:** Built, Audited, Reduced, Negotiated, Deployed, Engineered.
*   **Metrics First:** If a number isn't present, the AI should structure the sentence to highlight the *outcome*, not the *process*.

## 2. Data Model Philosophy
*   **Clustered Data:** Bullets are not atomic; they belong to a Role.
*   **Tailoring = Filtering:** Tailoring is primarily about *hiding* irrelevant bullets and *rewriting* relevant ones. It is rarely about writing fiction.
*   **Snapshots:** Once a resume is "Saved" for a job, it is immutable. Changing the Master Profile later should not break the history of what was sent to Company X.

## 3. Scoring Logic
*   **0-20:** Irrelevant (Delete or Hide).
*   **21-50:** Weak Match (Needs rewriting or bridging).
*   **51-80:** Strong Match (Good as is).
*   **81-100:** Perfect Keyword Match.
