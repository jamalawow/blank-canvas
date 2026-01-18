# Changelog

## v0.4.3 (Current) - PDF Export Reliability
*   **Fix:** Added specific IDs to `CoverLetterGenerator` container to ensure CSS Grid layout doesn't break print flow.
*   **Fix:** Updated print CSS to explicitly target `#cover-letter-view` and reset overflow properties.
*   **UI:** Updated "Export PDF" buttons to "Print / Save PDF" to clarify that the system uses the native browser print dialog.
*   **UI:** Added `.no-print` class to the Left Panel of the Cover Letter view to prevent it from overlapping or appearing in the PDF.

## v0.4.2 - Data Persistence
*   **Fix:** Master Profile data is now automatically saved to LocalStorage. Users no longer lose their imported resume data on page refresh.
*   **Refactor:** Updated `App.tsx` state initialization to lazy-load from storage instead of default hardcoded values.

## v0.4.1 - Cover Letter PDF Fix
*   **Fix:** Resolved issue where Cover Letter `textarea` would not print full content. Implemented dual-rendering logic: editable textarea for screen, static expandable div for print.
*   **CSS:** Added `.only-print` utility class in `index.html` to manage print-specific visibility.

## v0.4.0 - Cover Letter Generation
*   **Feature:** Added Cover Letter Generator. Uses the "Ruthless Hiring Manager" persona to write persuasive, non-fluffy letters based on the Resume + JD.
*   **Feature:** Added Cover Letter tab to sidebar.
*   **Logic:** Integrated Cover Letter data into `ResumeSnapshot` so it is saved with the job history.
*   **Export:** Enabled PDF Export for Cover Letter via native print dialog.

## v0.3.3 - Robust PDF Export
*   **Fix:** Rewrote `@media print` CSS logic. Switched from `visibility: hidden` (which caused layout clipping) to `display: none` for `.no-print` elements.
*   **Fix:** Added specific IDs (`#app-root`, `#main-content`, etc.) to layout containers to force `height: auto` and `overflow: visible` during print. This solves the "blank page" or "first page only" print issue caused by React's `h-screen` architecture.
*   **App:** Tagged Sidebar and Header with `no-print` class.

## v0.3.2 - UI Fixes
*   **Fix:** "Add Role" button in Master Profile Editor was purely visual; now adds a new Experience block.
*   **Fix:** "Add Bullet Point" button was inactive; now appends an empty bullet.
*   **Fix:** "Delete Bullet" icon was inactive; now removes the bullet.
*   **Fix:** Added placeholders to Experience date/location inputs for better UX.

## v0.3.0 - State Isolation & Workflow Fixes
*   **Feature:** Split `profile` state into `masterProfile` (Source of Truth) and `tailoredProfile` (Sandboxed).
*   **Feature:** Added "Reset to Master" button in Job Matcher.
*   **Logic:** Implemented auto-sync: Tailored profile automatically updates from Master *until* a Job Description is entered.
*   **UI:** Added Gap Analysis modal to generate strategic bullets for missing skills.

## v0.2.1 - Import Capabilities
*   **Feature:** Smart Import. Users can upload a PDF or paste text.
*   **AI:** Implemented `parseResumeFromPdf` using Gemini 3 Flash multimodal capabilities.
*   **UI:** Added loading states and file upload zones.

## v0.2.0 - The "Job Matcher" Engine
*   **Feature:** Job Description Analysis & Keyword extraction.
*   **AI:** "Ruthless Hiring Manager" persona implemented for bullet rewriting.
*   **AI:** Relevance scoring system (0-100) with visual bars.
*   **UI:** Side-by-side comparison for AI suggestions (Accept/Discard).

## v0.1.0 - Initial Scaffold
*   **Core:** React setup with Typescript.
*   **Data:** Defined `MasterProfile`, `Experience`, `BulletPoint` types.
*   **UI:** Basic CRUD for Master Profile.
*   **Spec:** Wrote `PYTHON_BACKEND_SCRIPT` specification for future migration.
