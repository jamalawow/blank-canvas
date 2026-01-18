# Technical Architecture

## Frontend (React)

### State Management
The app uses a `useState` architecture lifted to `App.tsx` (Root).

1.  **`masterProfile`**: The single source of truth. Edited only in `MasterProfileEditor`.
2.  **`tailoredProfile`**: A deep copy of Master. Edited only in `JobMatcher`.
3.  **`job`**: The current target job description.
4.  **`snapshots`**: Array of saved applications (stored in LocalStorage).

### Synchronization Logic
*   **Idle State:** When `job` is empty, `tailoredProfile` === `masterProfile`. Any edit to Master reflects immediately in the preview.
*   **Active State:** When `job` has content, Sync breaks. Edits to Master do *not* affect the current work-in-progress tailoring session.
*   **Reset:** User can force a re-sync via "Reset to Master" button.

## AI Service Layer (`geminiService.ts`)
We use `@google/genai` (Gemini 3 Flash).

*   **`optimizeBulletPoint`**: Rewrites text based on JD context + Persona rules.
*   **`scoreBulletsRelevance`**: Batch processes bullets to save tokens. Returns JSON `{id, score, reason}`.
*   **`parseResumeFromPdf`**: Multimodal call. Sends Base64 PDF -> Returns structured JSON.
*   **`analyzeJobGaps`**: Compares Profile JSON vs JD Text -> Returns `{missingSkills, presentSkills}`.

## Backend Specification (Future)
See `components/BackendSpec.tsx` for the SQLAlchemy models.

*   **Database:** SQLite.
*   **ORM:** SQLAlchemy (Declarative Base).
*   **PDF Engine:** WeasyPrint (HTML -> PDF). We choose WeasyPrint over ReportLab to allow using Jinja2 HTML templates, ensuring the PDF visual output matches the React HTML preview closely.
