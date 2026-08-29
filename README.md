<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EasyResume AI

> **Premium ATS Resume Builder Dashboard** — Create, optimize, tailor, and track job-application resumes with AI-powered insights. Built with React 19, TypeScript, Vite, TailwindCSS v4, and OpenRouter AI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Effective Memory Architecture](#effective-memory-architecture)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models & Types](#data-models--types)
- [State Management](#state-management)
- [AI Integrations & Speed Optimization](#ai-integrations--speed-optimization)
- [Routing & Pages](#routing--pages)
- [Donation & BuyMeCoffee Integration](#donation--buymecoffee-integration)
- [Favicon & Cross-Browser Support](#favicon--cross-browser-support)
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
2. **Tailor & Modify** existing resumes using AI to match target Job Descriptions without altering original candidate data.
3. **Check** ATS (Applicant Tracking System) compatibility scores against specific job descriptions.
4. **Generate** tailored cover letters powered by free OpenRouter AI models.

The entire application runs in the browser. Resume data is stored locally in `localStorage`, and AI requests are made directly via client calls to OpenRouter free models with automatic failover and high-speed parameters.

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
  - Powered by OpenRouter AI multi-model fallback (`meta-llama/llama-3.3-70b-instruct:free` → `thinkingmachines/inkling-small:free` → `nvidia/nemotron-3.5-lightning:free` → `openrouter/free`).
  - Creates a separate **Modified Resume** entity in `localStorage` (`easyresume_modified_data`) while keeping the **Default Resume** static in `easyresume_data`.
  - Automatically synchronizes template styles, primary/secondary colors, and profile photo edits across both Default and Modified resumes in real time.
  - Configurable layout via `USE_TABBED_VERSION_SWITCHER` feature flag (defaults to stacked vertical previews for side-by-side comparison).
- **Dual Resume Live Previews & Controls**:
  - **Default Resume** preview with Reset, Copy Text, Import JSON, Export JSON, and Download PDF tools.
  - **Modified Resume** preview stacked below — renders **only when a modified resume is generated or active**.
  - Includes **`AI Tailored`** badge, fixed-width **`Copy Modified Text`** button (no layout wobble when copied), **`Export Modified JSON`**, and a manual **`Clear`** button (`Trash2` icon) to discard the modified resume anytime.
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
- **1-Click Workflow (`Send to Tailor Resume ✨`)**:
  - Formats ATS suggestions, missing skills, and top recommendations and pre-fills them directly into the Tailor Resume section on `/resume-builder`.
- **Reset Scan**: Clear stored scan state to run fresh analysis.

### 4. Cover Letter Generator (`/cover-letter`)
- Input form for candidate profile, target job title, company name, hiring manager, and job description.
- Direct OpenRouter AI cover letter generation with live output display and clipboard copy.
- **Reset Form**: Clear inputs and generated output.

---

## Effective Memory Architecture

All user data, inputs, scan results, and generated letters are stored persistently in the browser's `localStorage` so navigating between pages or refreshing the tab never loses state.

| Feature / Page | Stored Key | Persistent Contents |
|---|---|---|
| **Default Resume** | `easyresume_data` | Candidate personal info, work experience, education, skills, photo, template, and colors |
| **Modified Resume** | `easyresume_modified_data` | AI-tailored resume object (cleared manually via **Clear** button or modal reset) |
| **ATS Checker** | `easyresume_ats_checker_data` | Candidate resume text, target job description, error state, and complete ATS scan results |
| **Cover Letter** | `easyresume_cover_letter_data` | User info, target company/role details, job description, and generated cover letter |
| **Tailor Resume Inputs** | `easyresume_tailor_input_data` | Job description and ATS report pre-fill data |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │  React   │  │  localStorage                               │  │
│  │  Router  │  │  ├─ "easyresume_data"          (Default)    │  │
│  │  (SPA)   │  │  ├─ "easyresume_modified_data" (Modified)   │  │
│  │          │  │  ├─ "easyresume_ats_checker_data"           │  │
│  │          │  │  ├─ "easyresume_cover_letter_data"          │  │
│  │          │  │  └─ "easyresume_tailor_input_data"          │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
│       │                                                         │
│  ┌────┴────────────────────────────────────────┐                │
│  │              Page Components                │                │
│  │  Landing │ Resume Builder │ ATS │ Cover Letter               │
│  └──────────────────────────────────────────────┘               │
│       │                                                         │
│  ┌────┴────────────────────────────────────────┐                │
│  │         OpenRouter High-Speed Engine        │                │
│  │  1. meta-llama/llama-3.3-70b-instruct:free  │                │
│  │  2. thinkingmachines/inkling-small:free     │                │
│  │  3. nvidia/nemotron-3.5-lightning:free      │                │
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
├── index.html                    # HTML entry point with favicon suite
├── vite.config.ts                # Vite config (React, TailwindCSS, env injection via define)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies & scripts
├── README.md                     # Documentation
├── .env.example                  # Environment variable template
│
├── public/                       # Static public assets
│   ├── favicon.ico               # ICO favicon fallback
│   ├── favicon.png               # PNG favicon fallback
│   └── favicon.svg               # SVG vector favicon
│
└── src/
    ├── main.tsx                  # React DOM entry
    ├── App.tsx                   # Root router & page layout
    ├── index.css                 # Global CSS & TailwindCSS v4 tokens
    ├── vite-env.d.ts             # Vite env type declarations
    │
    ├── pages/                    # Route-level page components
    │   ├── LandingPage.tsx       # Landing page & hero section
    │   ├── ResumePage.tsx        # Resume builder with dual preview, AI tailoring & clear control
    │   ├── ATSCheckerPage.tsx    # ATS score checker, analysis & 1-click tailor transfer
    │   └── CoverLetterPage.tsx   # Cover letter generator
    │
    ├── shared/                   # Shared UI components
    │   └── components/
    │       └── navbar.tsx        # Top navigation bar with BuyMeCoffee component & Donate modal
    │
    ├── lib/                      # Core AI services & prompts
    │   ├── openrouter.ts         # High-speed OpenRouter API engine with model fallback & logging
    │   ├── ats-prompt.ts         # ATS prompt template specification
    │   ├── tailor-prompt.ts      # Resume tailoring prompt specification
    │   └── utils.ts              # cn() utility
    │
    └── utils/
        ├── file-parser.ts        # Extract text from PDF, DOCX, TXT files
        └── keyword-extractor.ts  # Fallback ATS keyword scoring
```

---

## AI Integrations & Speed Optimization

### OpenRouter High-Speed Multi-Model Fallback Engine (`src/lib/openrouter.ts`)

- **Primary Models**:
  1. `meta-llama/llama-3.3-70b-instruct:free` (Primary high-speed Llama 3.3 model)
  2. `thinkingmachines/inkling-small:free`
  3. `nvidia/nemotron-3.5-lightning:free`
  4. `openrouter/free`
- **Request Parameters for High Speed & Precision**:
  - `temperature: 0.2`: Reduces token sampling randomness, speeds up generation, and enforces strict JSON formatting.
  - `max_tokens: 1500`: Constrains output generation length.
- **Accelerated Timeout (18s)**: 18-second per-model timeout limit triggers the next fallback model immediately if a free node queues or cold-starts.
- **Exported Functions**:
  - `getDynamicSuggestionsFromOpenRouter(resume, jobDescription, signal?)`
  - `modifyResumeWithOpenRouter(formData, jobDescription, atsReport, signal?)`
  - `generateCoverLetterFromOpenRouter(prompt, signal?)`

---

## Donation & BuyMeCoffee Integration

Integrated `BuyMeCoffee` support component and interactive donation modal overlay:
- **Navbar Button**: **Donate 🤍** button in desktop navigation and mobile dropdown menu.
- **Donation Modal**: Framer Motion overlay with backdrop blur and circular close button (`w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200`).
- **Support Link**: Direct Ko-fi integration (`https://ko-fi.com/astroanimate`).

---

## Favicon & Cross-Browser Support

Full cross-browser icon suite served at the root `/` URL for desktop, mobile (iOS/Android), Safari, and Vercel deployments:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.png" />
```

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
