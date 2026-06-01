<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EasyResume AI

> **Premium ATS Resume Builder Dashboard** — Create, optimize, and track job-application resumes with AI-powered insights. Built with React 19, TypeScript, Vite, TailwindCSS v4, Firebase Auth, Dexie.js (IndexedDB), Gemini AI, and OpenRouter.

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
3. **Modify** existing resumes to better match target roles.
4. **Generate** personalized cover letters from structured inputs.
5. **Track** application projects through a dashboard with stats and filters.

The entire application runs in the browser. Resume data is stored locally in IndexedDB (via Dexie.js), and AI analysis calls are made directly from the client to Gemini and OpenRouter APIs. Firebase provides Google OAuth authentication and analytics.

---

## Features

### 1. Landing Page (`/`)
- Animated hero section with Framer Motion entrance transitions.
- Skeleton resume card visual previews (left, center, right with rotation effects).
- One-click Google Sign-In → redirects to Dashboard.

### 2. Dashboard (`/dashboard`)
- **Stats Cards** — Real-time counts: Total Projects, Applied, Interviews, Offers.
- **Projects Table** — Filterable list of all resume projects with status badges (Draft / Applied / Interview / Offer / Rejected).
- **New Project Modal** — Create a project by entering name, company, and role.
- **Empty State** — Prompts first-time users to create their first project.

### 3. Resume Builder (`/resume-builder`)
- **Form-based editor** with sections for:
  - Template selection (Minimal, Modern) with primary/secondary color pickers.
  - Profile photo upload (base64, stored in localStorage).
  - Personal information (name, role, email, phone, location, years of experience, summary).
  - LinkedIn & Portfolio links.
  - Work experience entries (multiple, each with bullet-point descriptions).
  - Education entries (degree, school, duration, details).
  - Skills list.
- **Live Preview** — Right-side real-time preview that updates as you type.
- **Two Resume Templates**:
  - `MinimalTemplate` — Clean, single-column layout.
  - `ModernTemplate` — Two-column layout with a colored sidebar.
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
  1. **Gemini AI** (primary) — Structured ATS analysis with score, suggestions, and improvements.
  2. **OpenRouter** (secondary) — Deep recruiter-grade analysis with score, summary, strengths, suggestions, missing keywords, and improvements.
  3. **Manual keyword scoring** (fallback) — Local keyword-overlap algorithm when both AI providers fail.
- **Results display**: Color-coded score card (green ≥80%, amber ≥50%, red <50%), executive summary, strengths, missing keywords as tags, actionable suggestions, and improvements.
- **Export results**: Copy to clipboard or download as `.txt`.
- **Loading overlay** with animated step-through messages.

### 5. Modify Resume (`/modify-resume`)
- Paste resume + job description + target role.
- Generates a modified resume optimized for the target position.
- Download modified resume as `.txt`.
- *Note: Currently uses placeholder AI logic (marked `TODO` for full AI integration).*

### 6. Cover Letter Generator (`/cover-letter`)
- Structured input form:
  - User info (name, email, phone, location).
  - Job details (role, company, hiring manager) — add/remove multiple entries.
  - Job description text.
- Generates a personalized cover letter.
- Download as `.txt`.
- *Note: Currently uses placeholder AI logic (marked `TODO` for full AI integration).*

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
│  │              Page Components                 │                │
│  │  Landing │ Dashboard │ Resume │ ATS │ ...    │                │
│  └──────────────────────────────────────────────┘                │
│       │                         │                                │
│  ┌────┴──────┐           ┌──────┴──────────────┐                │
│  │ Firebase  │           │   AI Providers       │                │
│  │ Auth +    │           │  ┌─ Gemini API       │                │
│  │ Analytics │           │  └─ OpenRouter API   │                │
│  └───────────┘           └─────────────────────┘                │
│                                                                 │
│  ┌──────────────────────────────────────────────┐                │
│  │  localStorage: "easyresume_data" (Resume)    │                │
│  └──────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Client-side only** (no backend server) | Zero hosting cost, instant startup, full data privacy — all data stays in the user's browser. |
| **IndexedDB via Dexie** for project data | Structured queries, large storage capacity, async API — ideal for project CRUD. |
| **localStorage** for resume builder data | Simpler persistence for a single-document workflow (the active resume form). |
| **Dual AI providers** (Gemini + OpenRouter) | Redundancy — if one fails, the other provides results. Manual keyword scoring as final fallback. |
| **Firebase Auth (Google only)** | Fast setup, trusted OAuth provider, integrates with Firebase Analytics. |
| **TailwindCSS v4** | Utility-first CSS with new `@theme` directive for design tokens. |
| **Zustand** for global state | Minimal boilerplate compared to Redux; perfect for a single `projects` store. |

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | React | 19.x |
| **Language** | TypeScript | 5.8.x |
| **Bundler** | Vite | 6.x |
| **Styling** | TailwindCSS | 4.x |
| **State Management** | Zustand | 5.x |
| **Routing** | React Router DOM | 7.x |
| **Animations** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.546.x |
| **Local Database** | Dexie.js (IndexedDB) | 4.x |
| **Auth & Analytics** | Firebase | 12.x |
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
    │   ├── DashboardPage.tsx     # Project management dashboard
    │   ├── ResumePage.tsx        # Full resume builder with live preview (1,495 lines)
    │   ├── ATSCheckerPage.tsx    # ATS score checker with AI analysis
    │   ├── ModifyResumePage.tsx  # AI resume modification tool
    │   ├── CoverLetterPage.tsx   # AI cover letter generator
    │   └── PlaceholderPage.tsx   # Generic placeholder for future pages
    │
    ├── components/               # Dashboard-specific components
    │   ├── StatsCards.tsx         # 4-stat card grid (Total, Applied, Interviews, Offers)
    │   ├── ProjectsTable.tsx     # Filterable project table
    │   ├── ProjectRow.tsx        # Individual table row with status badge
    │   ├── NewProjectModal.tsx   # Animated modal for creating projects
    │   └── EmptyState.tsx        # Empty dashboard prompt
    │
    ├── shared/                   # Cross-cutting shared code
    │   ├── components/
    │   │   ├── navbar.tsx        # Sticky top navbar with mobile hamburger menu
    │   │   └── footer.tsx        # Site footer with social links
    │   ├── hooks/
    │   │   └── use-auth.ts       # Firebase auth hook (user, loading, signIn, logout)
    │   └── constants/
    │       └── navigation.ts     # NAV_LINKS and SOCIAL_LINKS arrays
    │
    ├── store/
    │   └── use-project-store.ts  # Zustand store for project CRUD
    │
    ├── db/
    │   └── project-service.ts    # Dexie database schema + CRUD operations
    │
    ├── firebase/
    │   ├── config.ts             # Firebase app initialization (env-driven)
    │   └── auth.ts               # Google Auth provider, signIn, signOut
    │
    ├── lib/
    │   ├── gemini.ts             # Gemini AI ATS analysis function
    │   ├── openrouter.ts         # OpenRouter AI ATS analysis function
    │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
    │
    ├── utils/
    │   ├── file-parser.ts        # Extract text from PDF, DOCX, TXT files
    │   ├── keyword-extractor.ts  # ATS keyword extraction & scoring algorithm
    │   └── create-empty-project.ts  # Factory for new ResumeProject objects
    │
    ├── types/
    │   └── resume.ts             # TypeScript interfaces (ResumeProject, ResumeData, ProjectStatus)
    │
    └── reference/                # Design reference assets (not used at runtime)
        ├── AI studio reference/
        ├── figma export/
        ├── mimic/
        └── resume templates/
```

---

## Data Models & Types

### `ProjectStatus`

```typescript
type ProjectStatus = "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";
```

### `ResumeData`

The structured resume content stored per project:

```typescript
interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    date: string;
  }[];
  skills: string[];
}
```

### `ResumeProject`

Top-level project entity stored in IndexedDB:

```typescript
interface ResumeProject {
  id: string;           // crypto.randomUUID()
  name: string;         // User-defined project name
  company: string;      // Target company
  role: string;         // Target role
  status: ProjectStatus;
  updatedAt: number;    // Date.now() timestamp
  createdAt: number;    // Date.now() timestamp
  resumeData: ResumeData;
}
```

### Resume Builder `FormData` (local to ResumePage)

The resume builder uses a separate, richer data shape stored in `localStorage`:

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

### Zustand Store: `useProjectStore`

**Location:** `src/store/use-project-store.ts`

| Method | Description |
|---|---|
| `fetchProjects()` | Loads all projects from IndexedDB, sorted by `updatedAt` descending. |
| `setCurrentProject(project)` | Sets the currently active project in memory. |
| `createProject(name, company, role)` | Creates a new project with empty `ResumeData`, persists to IndexedDB, refreshes list. |
| `deleteProject(id)` | Deletes from IndexedDB, clears `currentProject` if it was the deleted one. |

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

### ATS Checker Fallback Chain

```
User clicks "Analyze Match"
       │
       ▼
  ┌─ Try Gemini AI ──────────────────┐
  │  Success? → Display AI results   │
  │  Failure? ▼                      │
  ├─ Calculate manual keyword score  │
  │  Then try OpenRouter ────────────┤
  │  Success? → Display AI results   │
  │  Timeout/Failure? ▼              │
  └─ Use manual score + static tips  │
       │                              │
       ▼                              │
  Display results ◄───────────────────┘
```

---

## Routing & Pages

**Router:** React Router DOM v7 (`BrowserRouter`)

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero section with animated resume previews |
| `/dashboard` | `DashboardPage` | Project management hub |
| `/resume-builder` | `ResumePage` | Form editor with live preview |
| `/ats-checker` | `ATSCheckerPage` | AI-powered ATS analysis |
| `/modify-resume` | `ModifyResumePage` | AI resume tailoring |
| `/cover-letter` | `CoverLetterPage` | AI cover letter generation |

**Navigation links** are defined in `src/shared/constants/navigation.ts`:

```typescript
const NAV_LINKS = [
  { label: "ATS Checker",    href: "/ats-checker" },
  { label: "Resume Builder", href: "/resume-builder" },
  { label: "Modify Resume",  href: "/modify-resume" },
  { label: "Cover Letter",   href: "/cover-letter" },
];
```

---

## Component Inventory

### Layout Components (shared)

| Component | File | Description |
|---|---|---|
| `Navbar` | `src/shared/components/navbar.tsx` | Sticky top navbar, desktop nav links, mobile hamburger, auth-aware (Sign In / Dashboard), Donate button. Uses logo from `/assets/logos/EasyResume AI navbar.svg`. |
| `Footer` | `src/shared/components/footer.tsx` | Branding, social links (GitHub, LinkedIn, Mail, X), copyright. Uses logo from `/assets/logos/EasyResume AI.svg`. |

### Dashboard Components

| Component | File | Description |
|---|---|---|
| `StatsCards` | `src/components/StatsCards.tsx` | 4-column stat cards derived from project data. |
| `ProjectsTable` | `src/components/ProjectsTable.tsx` | Searchable table with column headers. |
| `ProjectRow` | `src/components/ProjectRow.tsx` | Table row with status badge styling, relative time display via `date-fns`. |
| `NewProjectModal` | `src/components/NewProjectModal.tsx` | Animated modal (Framer Motion) with backdrop blur. |
| `EmptyState` | `src/components/EmptyState.tsx` | Dashed-border prompt card for empty dashboards. |

### Resume Builder Internal Components (inside `ResumePage.tsx`)

| Component | Description |
|---|---|
| `FormSection` | Collapsible form section wrapper with icon and title. |
| `FormInput` | Reusable labeled input field. |
| `ExperienceForm` | Multi-field form for a single work experience entry with bullet-point editing. |
| `EducationForm` | Multi-field form for a single education entry. |
| `MinimalTemplate` | Resume preview — single-column, clean design. |
| `ModernTemplate` | Resume preview — two-column layout with colored sidebar. |
| `ProfessionalTemplate` | Resume preview (referenced but unused currently). |
| `ResumeSkeleton` | Animated skeleton card used on the landing page. |

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

Loaded via Google Fonts CDN.

### Utility Classes

| Class | Purpose |
|---|---|
| `.glass-morphism` | `bg-white/80 backdrop-blur-md` — frosted glass effect |
| `.card-hover` | `hover:border-gray-300 hover:shadow-md` — interactive card elevation |

### Color Palette

| Usage | Color | Hex |
|---|---|---|
| Primary / Text | Black | `#000000` |
| Success / CTA | Green | `#27AE60` |
| Secondary text | Gray | `#7A7A8C` |
| Body text | Dark gray | `#4A4A57` |
| Background | Off-white | `#fcfcfc` |
| Borders | Light gray | `#DADAE3`, `#E5E7EB`, `#f1f1f1` |
| Links (ATS page) | Blue | `#0066FF` |

---

## Authentication

**Provider:** Firebase Authentication (Google OAuth popup)

### Flow

1. User clicks **"Sign In"** or **"Get Started"** → triggers `loginWithGoogle()`.
2. Firebase opens Google OAuth popup → returns `User` object.
3. `useAuth` hook listens to `onAuthStateChanged` and exposes `{ user, loading, signIn, logout }`.
4. Navbar and Landing Page conditionally render "Sign In" vs "Dashboard" based on auth state.

### Files

| File | Purpose |
|---|---|
| `src/firebase/config.ts` | Initializes Firebase app + Analytics from `VITE_FIREBASE_*` env vars. |
| `src/firebase/auth.ts` | `loginWithGoogle()` and `logout()` functions. |
| `src/shared/hooks/use-auth.ts` | React hook wrapping Firebase auth state. |

---

## Local Database (Dexie / IndexedDB)

**Database name:** `EasyResumeDB`
**Schema version:** 1

### Schema

```typescript
this.version(1).stores({
  projects: "id, name, company, status, updatedAt",
});
```

### Service API (`projectService`)

| Method | Description |
|---|---|
| `getAllProjects()` | Returns all projects ordered by `updatedAt` descending. |
| `getProject(id)` | Returns a single project by ID. |
| `createProject(project)` | Inserts a new project. |
| `updateProject(id, updates)` | Partial update + auto-sets `updatedAt` to `Date.now()`. |
| `deleteProject(id)` | Removes a project by ID. |

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

# Firebase Configuration (all accessed via import.meta.env)
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# App URL (AI Studio injects automatically)
APP_URL="http://localhost:3000"
```

### How Env Vars Are Consumed

| Variable | Method | Where |
|---|---|---|
| `GEMINI_API_KEY` | `process.env.GEMINI_API_KEY` via Vite `define` | `src/lib/gemini.ts` |
| `VITE_OPENROUTER_API_KEY` | `import.meta.env.VITE_OPENROUTER_API_KEY` | `src/lib/openrouter.ts` |
| `VITE_FIREBASE_*` | `import.meta.env.VITE_FIREBASE_*` | `src/firebase/config.ts` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Gemini API key** (from [Google AI Studio](https://aistudio.google.com/))
- *(Optional)* An **OpenRouter API key** (from [openrouter.ai](https://openrouter.ai/))
- *(Optional)* A **Firebase project** for auth & analytics

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

### ATS Checker — File Upload

- Supports `.txt`, `.pdf`, and `.docx` files.
- **PDF parsing:** Uses `pdfjs-dist` with a CDN-hosted worker (`pdf.worker.min.mjs`).
- **DOCX parsing:** Uses `mammoth.js` to extract raw text.
- **TXT/MD:** Simple `FileReader.readAsText()`.

### ATS Checker — Results Export

- **Copy TXT:** Copies formatted results to clipboard.
- **Download TXT:** Triggers a `ATS_Review_Results.txt` file download.

---

## Deployment

### Google AI Studio

This app was originally scaffolded for **Google AI Studio** deployment. The `metadata.json` contains app metadata, and the `.env.example` documents the `GEMINI_API_KEY` and `APP_URL` variables that AI Studio injects automatically at runtime.

### Manual Deployment

```bash
# Build the production bundle
npm run build

# The output is in dist/ — deploy to any static hosting:
# - Vercel
# - Netlify
# - Firebase Hosting
# - Cloudflare Pages
# - Any static file server
```

### Vite Configuration Notes

- **Path alias:** `@` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`).
- **HMR:** Can be disabled via `DISABLE_HMR=true` env var (used by AI Studio to prevent flickering during agent edits).

---

## Git History

| Commit | Description |
|---|---|
| `8f7c1ba` | Completed Modern template CSS and functionality |
| `d361658` | Minimal resume template completed |
| `7c3ff4d` | First stable Resume Builder — major CSS and functionality |
| `eb44ed6` | ATS Checker page — fixed major issues |
| `9f17028` | Firebase Auth, Analytics, env setup |
| `1f7f9e3` | Initial working state |
| `4d2ae8c` | Initial commit |

---

## License

This project is licensed under the **Apache-2.0** License.

---

<div align="center">
  <p>Built with 💚 by <strong>Prashanth_ks</strong></p>
</div>
