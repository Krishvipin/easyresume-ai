<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EasyResume AI

> **Premium ATS Resume Builder Dashboard** — Create, optimize, tailor, and track job-application resumes with AI-powered insights. Built with React 19, TypeScript, Vite, TailwindCSS v4, and OpenRouter AI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models & Types](#data-models--types)
- [State Management](#state-management)
- [AI Integrations & Logging](#ai-integrations--logging)
- [Routing & Pages](#routing--pages)
- [Component Inventory](#component-inventory)
- [Styling & Design System](#styling--design-system)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Export & Import Flows](#export--import-flows)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

**EasyResume AI** is a full-featured, client-side resume management platform that helps job seekers:

1. **Build** professional resumes with a real-time, live-preview editor and multiple template choices.
2. **Tailor & Modify** existing resumes using AI to match target Job Descriptions without altering original data.
3. **Check** ATS (Applicant Tracking System) compatibility scores against specific job descriptions.
4. **Generate** tailored cover letters powered by free OpenRouter AI models.

The entire application runs in the browser. Resume data is stored locally in `localStorage`, and AI requests are made directly via client calls to OpenRouter free models with automatic failover.

---

## Features

### 1. Landing Page (`/`)
- Animated hero section with Framer Motion entrance transitions.
- Skeleton resume card visual previews.

### 2. Resume Builder (`/resume-builder`)
- **Form-based editor**:
  - Template selection (`Minimal`, `Modern`, `Professional`) with primary and secondary color pickers.
  - Profile photo upload (base64, stored in `localStorage`).
  - Personal information (name, role, email, phone, location, years of experience, summary).
  - LinkedIn & Portfolio links.
  - Work experience entries (multiple, each with bullet-point descriptions and re-ordering controls).
  - Education entries (degree, school, duration, details).
  - Skills & Tools lists.
  - Certifications list.
- **Tailor Resume (AI Resume Modifier)**:
  - Input section for target **Job Description** and optional **ATS Score Report / Suggestions**.
  - Powered by OpenRouter AI multi-model fallback (`nvidia/nemotron-3.5-lightning:free` → `thinkingmachines/inkling-small:free` → `meta-llama/llama-3.3-70b-instruct:free` → `openrouter/free`).
  - Creates a separate **Modified Resume** entity in `localStorage` (`easyresume_modified_data`) while keeping the **Default Resume** static in `easyresume_data`.
  - Automatically synchronizes template styles, primary/secondary colors, and profile photo edits across both Default and Modified resumes in real time.
  - Configurable layout via `USE_TABBED_VERSION_SWITCHER` feature flag (defaults to stacked vertical previews for side-by-side comparison).
- **Dual Resume Live Previews**:
  - **Default Resume** preview with static badge, Reset, Copy Text, Import JSON, Export JSON, and Download PDF tools.
  - **Modified Resume** preview stacked below with **`AI Tailored`** badge, **`Copy Modified Text`**, and **`Export Modified JSON`** tools.
- **Export Options**:
  - **Download PDF** — Uses `window.print()` with print-optimized CSS (`@media print`).
  - **Download JSON** — Exports resume data as `.json` (stamped with `_isEasyResume: true`).
  - **Import JSON** — Re-imports previously exported JSON files.
  - **Copy Text** — Plain-text formatting clipboard copy.

### 3. ATS Score Checker (`/ats-checker`)
- Dual inputs: candidate resume text and target job description.
- **File upload support** — Accepts `.txt`, `.pdf`, and `.docx` files with automated text extraction.
- **OpenRouter AI analysis**:
  - Returns complete `ATSAnalysisResult` (Overall Score 0-100, Score Label e.g. "Weak Match"/"Strong Match", Executive Summary, 7 category breakdown bars, Matched Skills tags, Missing Skills with severity, and numbered Recommendations).
  - Multi-model fallback sequence to guarantee uptime on free tiers.
- **Export results**: Copy analysis summary to clipboard.

### 4. Cover Letter Generator (`/cover-letter`)
- Input form for candidate profile, target job title, company name, hiring manager, and job description.
- Direct OpenRouter AI cover letter generation with live output display and clipboard copy.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │  React   │  │  localStorage                               │  │
│  │  Router  │  │  ├─ "easyresume_data"          (Default)    │  │
│  │  (SPA)   │  │  └─ "easyresume_modified_data" (Modified)   │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
│       │                                                         │
│  ┌────┴────────────────────────────────────────┐                │
│  │              Page Components                │                │
│  │  Landing │ Resume Builder │ ATS │ Cover Letter               │
│  └──────────────────────────────────────────────┘               │
│       │                                                         │
│  ┌────┴────────────────────────────────────────┐                │
│  │         OpenRouter Multi-Model Engine       │                │
│  │  1. nvidia/nemotron-3.5-lightning:free      │                │
│  │  2. thinkingmachines/inkling-small:free     │                │
│  │  3. meta-llama/llama-3.3-70b-instruct:free  │                │
│  │  4. openrouter/free                         │                │
│  └──────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

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
| **AI Engine** | OpenRouter REST API (Free Models) | — |
| **File Parsing** | pdf.js (`pdfjs-dist`) + Mammoth.js | 5.x / 1.x |
| **Date Formatting** | date-fns | 4.x |
| **CSS Utilities** | clsx + tailwind-merge | 2.x / 3.x |

---

## Project Structure

```
easyresume-ai-codex/
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite config (React, TailwindCSS, env injection via define)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies & scripts
├── README.md                     # Documentation
├── .env.example                  # Environment variable template
│
└── src/
    ├── main.tsx                  # React DOM entry
    ├── App.tsx                   # Root router & page layout
    ├── index.css                 # Global CSS & TailwindCSS v4 tokens
    ├── vite-env.d.ts             # Vite env type declarations
    │
    ├── pages/                    # Route-level page components
    │   ├── LandingPage.tsx       # Landing page & hero section
    │   ├── ResumePage.tsx        # Resume builder with dual preview & AI tailoring
    │   ├── ATSCheckerPage.tsx    # ATS score checker & analysis
    │   └── CoverLetterPage.tsx   # Cover letter generator
    │
    ├── lib/                      # Core AI services & prompts
    │   ├── openrouter.ts         # OpenRouter API engine with model fallback & logging
    │   ├── ats-prompt.ts         # ATS prompt template specification
    │   ├── tailor-prompt.ts      # Resume tailoring prompt specification
    │   └── utils.ts              # cn() utility
    │
    └── utils/
        ├── file-parser.ts        # Extract text from PDF, DOCX, TXT files
        └── keyword-extractor.ts  # Fallback ATS keyword scoring
```

---

## State Management

### localStorage Keys

- **`easyresume_data`**: Stores the static **Default Resume** object (`formData`).
- **`easyresume_modified_data`**: Stores the AI-tailored **Modified Resume** object (`modifiedFormData`).
- Form updates for templates, primary/secondary colors, and profile photo synchronize to both objects simultaneously.

---

## AI Integrations & Logging

### OpenRouter Multi-Model Fallback Engine (`src/lib/openrouter.ts`)

- **Primary Models**:
  1. `nvidia/nemotron-3.5-lightning:free`
  2. `thinkingmachines/inkling-small:free`
  3. `meta-llama/llama-3.3-70b-instruct:free`
  4. `openrouter/free`
- **Timeout Protection**: Per-model 30s `AbortController` timeout prevents stalled model requests from blocking the fallback chain.
- **Exported Functions**:
  - `getDynamicSuggestionsFromOpenRouter(resume, jobDescription, signal?)`
  - `modifyResumeWithOpenRouter(formData, jobDescription, atsReport, signal?)`
  - `generateCoverLetterFromOpenRouter(prompt, signal?)`

### Console Logging (`[EasyResume AI]`)
All key AI calls, fallback attempts, and template style updates output formatted console logs tagged with `[EasyResume AI]`. Logs remain active in both local development and Vercel production builds.

---

## Routing & Pages

| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Animated hero section |
| `/resume-builder` | `ResumePage` | Resume builder, live preview, and AI Tailor Resume section |
| `/ats-checker` | `ATSCheckerPage` | ATS compatibility checker & analysis breakdown |
| `/cover-letter` | `CoverLetterPage` | AI cover letter generator |

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# OpenRouter API Key
VITE_OPENROUTER_API_KEY="your-openrouter-api-key"

# Optional: OpenRouter timeout in seconds (default: 60)
VITE_OPENROUTER_TIMEOUT_SECONDS=60

# Local Development Flag
DEV=true
```

> **Vercel Deployment Note**: `vite.config.ts` includes static injection under `define` (`process.env.OPENROUTER_API_KEY` and `process.env.VITE_OPENROUTER_API_KEY`) so environment variables configured in Vercel settings are baked into client builds automatically.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- An **OpenRouter API key** (from [openrouter.ai](https://openrouter.ai/))

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/Krishvipin/easyresume-ai.git
cd easyresume-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Add your VITE_OPENROUTER_API_KEY to .env

# 4. Start the development server
npm run dev
```

App runs locally at **http://localhost:3000**.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| **dev** | `npm run dev` | Start Vite dev server on port 3000 |
| **build** | `npm run build` | Build production bundle in `dist/` |
| **preview** | `npm run preview` | Preview production build locally |
| **clean** | `npm run clean` | Remove `dist/` build directory |
| **lint** | `npm run lint` | Type-check with `tsc --noEmit` |

---

## License

This project is licensed under the **Apache-2.0** License.

---

<div align="center">
  <p>Built with 💚 by <strong>Prashanth_ks</strong></p>
</div>
