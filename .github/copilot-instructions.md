# Copilot Instructions for Lesson Plan Generator

## Project Overview
- **Type:** Next.js 15 App Router, TypeScript, Tailwind CSS
- **Purpose:** Create, manage, and export lesson plans (Thai/English)
- **Key Features:** PDF export, image integration (Unsplash/Pixabay), responsive UI, Supabase backend

## Architecture & Data Flow
- **Pages:**
  - `src/app/plan/[id]/page.tsx`: Lesson plan detail & PDF export
  - `src/app/create_plan/`: Create new lesson plans
  - `src/app/api/lesson_plans/`: API routes for CRUD operations
- **Components:**
  - Shared UI in `src/components/`
- **Libs:**
  - `src/lib/pdf-export.ts`: PDF export logic (jsPDF + html2canvas, Thai font support)
  - `src/lib/image-providers.ts`: Unsplash/Pixabay integration
  - `src/lib/schemas.ts`: Zod validation schemas
  - `src/lib/supabase.ts`: Supabase client

## PDF Export Workflow
- Triggered from lesson plan detail page (`plan/[id]/page.tsx`)
- Uses `exportElementToPDF` (see `pdf-export.ts`)
  - Handles multi-page, Thai/English fonts, custom filename
  - UI disables export button and shows loading state
  - Filename generated via `generateLessonPlanFilename`
- Customization via `scale`, `quality`, and paper size options

## Developer Workflows
- **Start Dev Server:** `npm run dev`
- **Install PDF deps:** `npm install jspdf html2canvas @types/jspdf`
- **API Testing:** Use Next.js API routes under `src/app/api/lesson_plans/`
- **Supabase:** Requires account/config in `src/lib/supabase.ts`

## Project-Specific Patterns
- **Font Handling:** Thai font loaded via Google Fonts in PDF export
- **Error Handling:** User-friendly messages for fetch/export errors
- **Image Attribution:** Images include source/attribution metadata
- **Filename Sanitization:** See `generateLessonPlanFilename`
- **No-Print Elements:** Use `.no-print` class to hide elements during PDF export

## External Integrations
- **Supabase:** Database for lesson plans
- **Unsplash/Pixabay:** Image search APIs
- **jsPDF/html2canvas:** PDF generation

## Key Files & Directories
- `src/app/plan/[id]/page.tsx`: PDF export UI logic
- `src/lib/pdf-export.ts`: PDF export implementation
- `docs/PDF_EXPORT_FEATURE.md`: Feature documentation
- `README.md`: Project setup & overview

---
**For AI agents:**
- Follow existing patterns for PDF export, error handling, and API usage
- Reference `docs/PDF_EXPORT_FEATURE.md` for advanced PDF logic
- Use Zod schemas for validation
- Maintain Thai/English support throughout UI and exports
