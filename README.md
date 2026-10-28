# arQuonCX — Enterprise Customer Success & Product Growth Platform

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5-2d3748.svg)](https://www.prisma.io/)

**arQuonCX** is a comprehensive, full-stack Customer Success and Product Adoption platform designed for modern B2B SaaS organizations. It unifies user telemetry, automated in-app walkthroughs, predictive delivery health tracking, sentiment capture (NPS/CSAT), and executive delivery briefing into an intuitive, high-performance platform.

---

## ?? Key Features

### 1. ?? C-Suite Delivery Briefing & Predictive AI Engine
- **Weekly Executive View**: Real-time project health, ARR at risk, implementation stage progress, and blocker escalation.
- **Predictive Completion Forecast**: Algorithmic forecasting calculating predicted Go-Live variance (\Ahead\, \On-Track\, \At-Risk\, \Critical Delay\) based on milestone burndown and blockers.
- **Excel / CSV Ingestion Engine**: Instant drag-and-drop ingestion of project delivery sheets with automatic normalization and 5-stage milestone generation.
- **1-Click Executive Memo**: Instant copy-to-clipboard Markdown executive memo for leadership status syncs.

### 2. ?? Accounts 360° & Health Scoring
- Multi-factor Customer Health Score computation balancing Usage, Support Tickets, Champion Engagement, and NPS Sentiment.
- Renewal risk indicators, contract ARR countdowns, and assigned CSM portfolio tracking.
- Stakeholder relationship directory with Executive Sponsor and Champion tagging.

### 3. ? In-App Onboarding & Adoption Flows
- No-code in-app guided walkthroughs, tooltips, slideouts, and checklist modules.
- Behavioral audience segmentation and role-targeted flow deployment.
- Live interactive Flow Simulator directly inside the console.

### 4. ?? Surveys & Voice of Customer (NPS / CSAT)
- Dynamic survey builder (NPS 0-10, CSAT 1-5, Feature Ratings, Qualitative Feedback).
- Real-time sentiment classification (\positive\, \
eutral\, \
egative\).
- \"Close the Loop\" customer feedback triage workflow.

### 5. ??? Role-Based Access Control (RBAC)
- Enterprise multi-persona permission model:
  - **Super Admin** (\SUPER_ADMIN\): Full administrative and governance control.
  - **CS Operations** (\CS_OPS\): Scoring metrics, integration setup, audit logs.
  - **Customer Success** (\CSM\): Client health, touchpoints, delivery updates.
  - **Product / Growth** (\PRODUCT_GROWTH\): In-app flows, surveys, user funnels.
  - **Viewer** (\VIEWER\): Executive read-only analytics.

### 6. ?? Integrations & Telemetry SDK
- Plug-and-play integrations with Salesforce, HubSpot, Slack, Segment, and Mixpanel.
- Lightweight embeddable JavaScript tracker snippet for event collection and user identification.

---

## ??? Architecture

\\\
                                  +------------------------------------+
                                  |      Vite + React 19 Frontend      |
                                  |     (http://localhost:5173/)       |
                                  +------------------------------------+
                                            |                   |
                 Typed REST API Client      |                   | In-App Client SDK
                (Authorization: Bearer)     v                   v (X-API-Key / Ingest)
                                  +------------------------------------+
                                  |     Express + TypeScript Backend   |
                                  |     (http://localhost:3001/)       |
                                  +------------------------------------+
                                                    |
                                      Prisma ORM (Schema + Client)
                                                    |
                                                    v
                                  +------------------------------------+
                                  |     SQLite / PostgreSQL Database   |
                                  |             (\"prisma/dev.db\")      |
                                  +------------------------------------+
\\\

---

## ?? Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   \\\ash
   git clone https://github.com/dipbagchi-cloud/arQuonCX.git
   cd arQuonCX
   \\\

2. **Install dependencies**:
   \\\ash
   npm install
   \\\

3. **Configure Environment Variables**:
   \\\ash
   cp .env.example .env
   \\\

4. **Initialize & Seed the Database**:
   \\\ash
   npx prisma db push
   npx tsx prisma/seed.ts
   \\\

5. **Start Development Servers**:
   - **Backend API**:
     \\\ash
     npx tsx server/src/index.ts
     \\\
   - **Frontend App**:
     \\\ash
     npm run dev
     \\\

6. **Open in Browser**:
   - Web Platform: \http://localhost:5173/\
   - Backend API Health: \http://localhost:3001/health\

---

## ?? Theme & Accessibility
- Full native support for **Light** and **Dark** modes with persistent state in \localStorage\.
- High-contrast bespoke SVG brand identity with adaptive isometric quantum prism mark.
- Micro-compact typography and clean layout engineered for enterprise data density.

---

## ?? License
Copyright © 2026 arQuonCX Inc. All rights reserved. Proprietary software.
