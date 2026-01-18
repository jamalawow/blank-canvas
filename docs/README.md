# Resume Tailor & Tracker (MVP)

A local-first **Resume Content Management System** that treats career history as modular data. It uses Generative AI (Gemini 3 Flash) to "tailor" a master profile into specific, ATS-compliant job applications without losing historical context.

## Core Philosophy
1.  **Data-First:** Resumes are data structures, not formatted text documents.
2.  **Context-Preservation:** Store "Master Entries" (Parents) and "Bullet Points" (Children). Toggle bullets on/off per job.
3.  **The "Ruthless Hiring Manager":** AI is strictly prompted to remove fluff, buzzwords, and adjectives, focusing purely on metrics and active verbs.

## Tech Stack
*   **Frontend:** React 19, TailwindCSS, Lucide Icons.
*   **AI:** Google Gemini API (`gemini-3-flash-preview`).
*   **Storage:** LocalStorage (Browser-based MVP).
*   **Future Backend:** Python (Streamlit), SQLite, SQLAlchemy, WeasyPrint.

## Key Features
*   **Master Profile Editor:** CRUD interface for experience and bullets. Import from PDF/Text.
*   **Job Matcher:** Paste a JD -> AI Scores Bullets -> AI Optimizes Text -> Gap Analysis.
*   **Cover Letter Generator:** Auto-generates persuasive letters mapping your skills to the specific JD.
*   **Resume Preview:** Real-time A4 rendering.
*   **Application History:** Snapshotting of specific resume versions tailored for specific companies.
