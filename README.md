<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EasyResume AI

> **Premium ATS Resume Builder Dashboard** — Create, optimize, and track job-application resumes with AI-powered insights. Built with React 19, TypeScript, Vite, TailwindCSS v4, Gemini AI, and OpenRouter.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models & Types](#data-models--types)
- [State Management](#state-management)
- [AI Integrations](#ai-integrations)
- [Routing & Pages](#routing--pages)
- [Component Inventory](#component-inventory)
- [Styling & Design System](#styling--design-system)
- [Authentication](#authentication)
- [Local Database (Dexie / IndexedDB)](#local-database-dexie--indexeddb)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Export & Import Flows](#export--import-flows)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

**EasyResume AI** is a full-featured, client-side resume management platform that helps job seekers:

1. **Build** professional resumes with a real-time, live-preview editor.
2. **Check** ATS (Applicant Tracking System) compatibility scores against specific job descriptions.
3. **Modify** existing resumes to better match target roles (UI Implemented).
4. **Generate** personalized cover letters from structured inputs (UI Implemented).

The entire application runs in the browser. Resume data is stored locally in localStorage, and AI analysis calls are made directly from the client to Gemini and OpenRouter APIs.

---

## Features

### 1. Landing Page (`/`)
- Animated hero section with Framer Motion entrance transitions.
- Skeleton resume card visual previews (left, center, right with rotation effects).



### 3. Resume Builder (`/resume-builder`)
- **Form-based editor** with sections for:
  - Template selection (Minimal, Modern, Professional) with primary/secondary color pickers.
  - Profile photo upload (base64, stored in localStorage).
  - Personal information (name, role, email, phone, location, years of experience, summary).
  - LinkedIn & Portfolio links.
  - Work experience entries (multiple, each with bullet-point descriptions).
  - Education entries (degree, school, duration, details).
  - Skills list.
- **Live Preview** — Right-side real-time preview that updates as you type.
- **Three Resume Templates**:
  - `MinimalTemplate` — Clean, single-column layout.
  - `ModernTemplate` — Two-column layout with a colored sidebar.
  - `ProfessionalTemplate` — A classic, professional format tailored for corporate roles.
- **Export Options**:
  - **Download PDF** — Uses `window.print()` with print-optimized CSS (`@media print`).
  - **Download JSON** — Exports the complete resume data as a `.json` file (stamped with `_isEasyResume: true` for validation).
  - **Import JSON** — Re-imports a previously exported JSON file.
- **Reset** — Clears all data and reverts to the default template (with confirmation dialog).
- **Persistence** — All form data auto-saves to `localStorage` under the key `easyresume_data`.

### 4. ATS Score Checker (`/ats-checker`)
- Two input areas: resume text and job description.
- **File upload support** — Accepts `.txt`, `.pdf`, and `.docx` files; extracts text automatically.
- **Three-tier AI fallback strategy**:
  1. **Gemini AI** (primary) — Structured ATS analysis with score, suggestions, and improvements (using `gemini-1.5-flash`).
  2. **OpenRouter** (secondary) — Deep recruiter-grade analysis with score, summary, strengths, suggestions, missing keywords, and improvements.
  3. **Manual keyword scoring** (fallback) — Local keyword-overlap algorithm when both AI providers fail.
- **Results display**: Color-coded score card (green ≥80%, amber ≥50%, red <50%), executive summary, strengths, missing keywords as tags, actionable suggestions, and improvements.
- **Export results**: Copy to clipboard or download as `.txt`.
- **Loading overlay** with animated step-through messages.

### 5. Modify Resume (`/modify-resume`)
- Complete UI for inputting current resume, target role, and job description.
- Generates a tailored version of the resume.
- Features real-time loader state and file download capabilities.
- *Note: Currently uses placeholder simulation logic (marked `TODO` for full AI integration).*

### 6. Cover Letter Generator (`/cover-letter`)
- Comprehensive structured input form:
  - User info (name, email, phone, location).
  - Job details (role, company, hiring manager) — supports adding/removing multiple entries dynamically.
  - Complete job description text area.
- Dedicated output UI with download feature.
- *Note: Currently uses placeholder simulation logic (marked `TODO` for full AI integration).*

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│                                                                 │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────────────────┐  │
│  │  React   │  │  Zustand      │  │  Dexie.js (IndexedDB)    │  │
│  │  Router  │──│  Store        │──│  "EasyResumeDB"          │  │
│  │  (SPA)   │  │  (projects)   │  │  └─ projects table       │  │
│  └──────────┘  └───────────────┘  └──────────────────────────┘  │
│       │                                                         │
│  ┌────┴────────────────────────────────────────┐                │
│  │              Page Components                │                │
│  │  Landing │ Dashboard │ Resume │ ATS │ ...   │                │
│  └──────────────────────────────────────────────┘               │
│       │                         │                               │
│  ┌────┴──────┐           ┌──────┴──────────────┐                │
│  │ Firebase  │           │   AI Providers      │                │
│  │ Auth +    │           │  ┌─ Gemini API      │                │
│  │ Analytics │           │  └─ OpenRouter API  │                │
│  └───────────┘           └─────────────────────┘                │
│                                                                 │
│  ┌──────────────────────────────────────────────┐               │
│  │  localStorage: "easyresume_data" (Resume)    │               │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Client-side only** (no backend server) | Zero hosting cost, instant startup, full data privacy — all data stays in the user's browser. |
| **localStorage** for resume builder data | Simpler persistence for a single-document workflow (the active resume form). |
| **Dual AI providers** (Gemini + OpenRouter) | Redundancy — if one fails, the other provides results. Manual keyword scoring as final fallback. |
| **TailwindCSS v4** | Utility-first CSS with new `@theme` directive for design tokens. |

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React | 19.x |
| **Language** | TypeScript | 5.8.x |
| **Bundler** | Vite | 6.x |
| **Styling** | TailwindCSS | 4.x |
| **Routing** | React Router DOM | 7.x |
| **Animations** | Framer Motion & Motion | 12.x |
| **Icons** | Lucide React | 0.546.x |
| **AI — Primary** | Google Generative AI (`@google/genai`) | 1.52.x |
| **AI — Secondary** | OpenRouter API (REST) | — |
| **File Parsing** | pdf.js (`pdfjs-dist`) + Mammoth.js | 5.x / 1.x |
| **Date Formatting** | date-fns | 4.x |
| **CSS Utilities** | clsx + tailwind-merge | 2.x / 3.x |

---

## Project Structure

```
easyresume-ai-codex/
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite config (React, TailwindCSS, env injection, path aliases)
├── tsconfig.json                 # TypeScript config (ES2022, bundler resolution)
├── package.json                  # Dependencies & scripts
├── metadata.json                 # AI Studio app metadata
├── .env.example                  # Environment variable template
├── .gitignore
│
├── public/
│   └── assets/
│       ├── logos/                 # App logos (SVG) — navbar & footer variants
│       ├── icons/                # UI icons
│       ├── illustrations/        # Decorative illustrations
│       └── images/               # Static images
│
└── src/
    ├── main.tsx                  # React DOM entry — mounts <App /> into #root
    ├── App.tsx                   # Root component — Router, Navbar, Routes, Footer
    ├── index.css                 # Global styles, TailwindCSS imports, @theme tokens, utility classes
    ├── vite-env.d.ts             # Vite + Firebase env type declarations
    │
    ├── pages/                    # Route-level page components
    │   ├── LandingPage.tsx       # Hero + animated resume skeletons
    │   ├── ResumePage.tsx        # Full resume builder with live preview & templates
    │   ├── ATSCheckerPage.tsx    # ATS score checker with AI analysis
    │   ├── ModifyResumePage.tsx  # Interactive UI for AI resume tailoring
    │   ├── CoverLetterPage.tsx   # Interactive UI for AI cover letter generation
    │   └── PlaceholderPage.tsx   # Generic placeholder for future pages
    │
    │
    ├── components/               # Domain-specific components
    ├── shared/                   # Cross-cutting shared code
    │   ├── components/
    │   │   ├── navbar.tsx        # Sticky top navbar with mobile menu, auth-aware
    │   │   └── footer.tsx        # Site footer with social links
    │   └── constants/
    │       └── navigation.ts     # NAV_LINKS and SOCIAL_LINKS arrays
    │
    ├── lib/
    │   ├── gemini.ts             # Gemini AI ATS analysis function
    │   ├── openrouter.ts         # OpenRouter AI ATS analysis function
    │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
    │
    ├── utils/
    │   ├── file-parser.ts        # Extract text from PDF, DOCX, TXT files
    │   ├── keyword-extractor.ts  # ATS keyword extraction & scoring algorithm
    │
    └── reference/                # Design reference assets (not used at runtime)
```

---

## Data Models & Types

### Resume Builder `FormData` (local to ResumePage)

The resume builder uses a comprehensive form data schema stored in `localStorage`:

```typescript
interface FormData {
  template: "minimal" | "modern" | "professional";
  primaryColor: string;
  secondaryColor: string;
  photo?: string;           // base64 data URL
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  experience: number;       // years of experience
  summary: string;
  linksPortfolio: { label: string; url: string }[];
  experiences: {
    id: string;
    position: string;
    company: string;
    duration: string;
    description: string[];  // bullet points
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    duration: string;
    details: string;
  }[];
  skills: string[];
}
```

---

## State Management

### localStorage Persistence

The **Resume Builder** (`ResumePage`) manages its own form state locally:

- **Key:** `easyresume_data`
- **Write:** On every `formData` state change via `useEffect`.
- **Read:** On component mount as the initial state for `useState`.
- **Reset:** Removes the key and resets to `initialFormData`.

---

## AI Integrations

### 1. Gemini AI (`src/lib/gemini.ts`)

| Property | Value |
|---|---|
| **SDK** | `@google/genai` |
| **Model** | `gemini-1.5-flash` |
| **API Key** | `process.env.GEMINI_API_KEY` (injected by Vite `define`) |
| **Function** | `analyzeATS(resume, jobDescription)` |
| **Returns** | `{ score: number, suggestions: string[], improvements: string[] }` |
| **Usage** | Primary ATS analysis in `ATSCheckerPage` |

### 2. OpenRouter (`src/lib/openrouter.ts`)

| Property | Value |
|---|---|
| **Endpoint** | `https://openrouter.ai/api/v1/chat/completions` |
| **Model** | `openrouter/free` |
| **API Key** | `process.env.OPENROUTER_API_KEY` or `import.meta.env.VITE_OPENROUTER_API_KEY` |
| **Function** | `getDynamicSuggestionsFromOpenRouter(resume, jobDescription, signal?)` |
| **Returns** | `{ score, summary, strengths[], suggestions[], missingKeywords[], improvements[] }` |
| **Features** | AbortController timeout support (configurable via `VITE_OPENROUTER_TIMEOUT_SECONDS`, default 60s) |
| **Usage** | Secondary ATS analysis (fallback after Gemini fails) |

### 3. Manual Keyword Scoring (`src/utils/keyword-extractor.ts`)

A fully local, zero-API fallback:

- **`extractKeywords(text)`** — Normalizes text, replaces tech phrase variations (e.g., "front end" → "frontend"), filters stopwords, returns unique keywords.
- **`calculateATSScore(resume, jobDescription)`** — Computes `score` as `(matched / total job keywords) × 100`, returns `{ score, matched[], missing[] }`.

---

## Routing & Pages

**Router:** React Router DOM v7 (`BrowserRouter`)

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero section with animated resume previews |
| `/resume-builder` | `ResumePage` | Protected form editor with live preview |
| `/ats-checker` | `ATSCheckerPage` | AI-powered ATS analysis |
| `/modify-resume` | `ModifyResumePage` | UI for AI resume tailoring |
| `/cover-letter` | `CoverLetterPage` | UI for AI cover letter generation |

---

## Component Inventory

### Layout Components (shared)

| Component | File | Description |
|---|---|---|
| `Navbar` | `src/shared/components/navbar.tsx` | Sticky top navbar, desktop nav links, mobile hamburger, auth-aware (Sign In / Dashboard), Donate button. |
| `Footer` | `src/shared/components/footer.tsx` | Branding, social links (GitHub, LinkedIn, Mail, X), copyright. |

### Resume Builder Internal Components (inside `ResumePage.tsx`)

| Component | Description |
|---|---|
| `FormSection` | Collapsible form section wrapper with icon and title. |
| `FormInput` | Reusable labeled input field. |
| `ExperienceForm` | Multi-field form for a single work experience entry with bullet-point editing. |
| `EducationForm` | Multi-field form for a single education entry. |
| `MinimalTemplate` | Resume preview — single-column, clean design. |
| `ModernTemplate` | Resume preview — two-column layout with colored sidebar. |
| `ProfessionalTemplate` | Resume preview — classic structured layout for corporate roles. |

---

## Styling & Design System

### CSS Framework

**TailwindCSS v4** with the `@tailwindcss/vite` plugin. Configured in `vite.config.ts` and imported in `src/index.css`.

### Design Tokens (`@theme`)

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --color-brand-primary: #000000;
  --color-brand-success: #27AE60;
  --color-brand-secondary: #7A7A8C;
  --color-surface-bg: #fcfcfc;
  --color-surface-accent: #FFFFFF;
  --color-border-subtle: #f1f1f1;
}
```

### Fonts

- **Inter** (400, 500, 600, 700) — Body text, UI labels.
- **Bricolage Grotesque** (600, 700, 800) — Headings, display text.

---



## Environment Variables

### Required Variables

Create a `.env` file based on `.env.example`:

```env
# Gemini AI (injected via Vite `define`)
GEMINI_API_KEY="your-gemini-api-key"

# OpenRouter (accessed via import.meta.env)
VITE_OPENROUTER_API_KEY="your-openrouter-api-key"

# Optional: OpenRouter timeout in seconds (default: 60)
VITE_OPENROUTER_TIMEOUT_SECONDS=60

# App URL (AI Studio injects automatically)
APP_URL="http://localhost:3000"
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))
- *(Optional)* An **OpenRouter API key** (from [openrouter.ai](https://openrouter.ai/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Krishvipin/easyresume-ai.git
cd easyresume-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Start Vite dev server on port 3000, bound to `0.0.0.0` |
| **build** | `npm run build` | Create production bundle in `dist/` |
| **preview** | `npm run preview` | Preview the production build locally |
| **clean** | `npm run clean` | Remove the `dist/` directory |
| **lint** | `npm run lint` | Type-check with `tsc --noEmit` (no output files) |

---

## Export & Import Flows

### Resume Builder — JSON

- **Export:** `handleExportJSON()` serializes `formData` with a `_isEasyResume: true` marker and triggers a `.json` file download.
- **Import:** `handleImportJSON()` reads a `.json` file, validates the `_isEasyResume` marker, normalizes experience description arrays, and loads data into state.
- **File naming:** `resume_{FullName}_{YYYY-MM-DD}.json`

### Resume Builder — PDF

- Uses `window.print()` with a comprehensive `@media print` stylesheet.
- The form panel is hidden via `print:hidden`, and only the preview renders.
- Color-adjust properties ensure backgrounds/colors print correctly.

### ATS Checker — File Upload & Export

- Supports `.txt`, `.pdf`, and `.docx` files.
- **PDF parsing:** Uses `pdfjs-dist` with a CDN-hosted worker.
- **DOCX parsing:** Uses `mammoth.js`.
- **Export:** Copy to clipboard or download as a `.txt` file.

---

## Deployment

### Manual Deployment

```bash
# Build the production bundle
npm run build

# The output is in dist/ — deploy to any static hosting:
# - Vercel, Netlify, Firebase Hosting, Cloudflare Pages, etc.
```

---

## License

This project is licensed under the **Apache-2.0** License.

---

<div align="center">
  <p>Built with 💚 by <strong>Prashanth_ks</strong></p>
</div>
