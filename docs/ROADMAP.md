# Project Roadmap

## Phase 1: MVP & Core Logic (Current)
**Goal:** Prove we can generate visually clean, ATS-friendly data structures and optimize them via AI.

### ✅ Completed
- [x] **Master Profile Editor:** Create/Edit/Delete experiences and bullets.
- [x] **Resume Parsing:** Import existing resumes (PDF/Text) into structured JSON.
- [x] **Job Analysis:** Extract keywords from JD.
- [x] **Relevance Scoring:** AI rates specific bullets (0-100) against a specific JD.
- [x] **"Anti-Fluff" Optimization:** AI rewrites bullets to remove adjectives and add metrics.
- [x] **Gap Analysis:** Identify missing skills and generate "Bridging Bullets".
- [x] **State Isolation:** "Tailored" profile is separate from "Master" profile.
- [x] **Snapshotting:** Save specific versions of resumes linked to JDs.
- [x] **Client-Side PDF Export:** Implemented clean print styles for native "Save as PDF" functionality.
- [x] **Cover Letter Generation:** Use the gap analysis + matched bullets to write a cover letter.

### 🚧 In Progress / Refinement
- [ ] **Drag & Drop:** Reordering bullets within an experience.
- [ ] **Metric Highlighting:** Visual UI to highlight numbers/percentages in bullets.

## Phase 2: Python Backend Migration (Planned)
**Goal:** Move from LocalStorage to a robust SQLite database and enable WeasyPrint generation.

- [ ] **FastAPI/Streamlit Setup:** Initialize the Python environment.
- [ ] **Database Migration:** Implement the SQLAlchemy models defined in `BackendSpec.tsx`.
- [ ] **WeasyPrint Integration:** Replace HTML/CSS preview with server-side PDF generation for pixel-perfect rendering across all devices (independent of browser print engine).
- [ ] **Context Window Management:** Better handling of large profiles sent to LLM.

## Phase 3: Advanced Features
- [ ] **Version Control for Bullets:** Track how a bullet has evolved over time.
- [ ] **LinkedIn Sync:** Export optimized bullets for LinkedIn profile.
