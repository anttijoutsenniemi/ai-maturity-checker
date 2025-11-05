# 🤖 AI Capability Development Tool (AI CapDev)

A secure and intelligent platform that helps organizations **assess, plan, and improve their AI maturity**.  
Teams answer guided questionnaires, view analytics, and receive actionable recommendations on how to advance their AI adoption journey.

---

## 🧭 Summary

The **AI Capability Development Tool** enables companies to evaluate their current level of AI implementation through structured self-assessments.  
It guides users through a series of dimensions — such as strategy, data, skills, and governance — and provides insights and recommendations for growth.

Key features:
- 🧑‍💼 **Secure user & company management**
- 🧩 **Multi-step questionnaire** to gauge AI maturity
- 📊 **Dynamic dashboards** showing progress and gaps
- 💡 **Tailored recommendations** to boost AI readiness
- 🔐 **Hybrid data system**: secure client-side + Supabase backend
- 🗂️ **Encrypted local storage** for user-specific and offline data

The goal is to make AI transformation measurable, structured, and personalized.

---

## ⚙️ Tech & How It Works

| Area | Stack / Details |
|------|------------------|
| **Frontend** | Next.js (App Router) + TypeScript |
| **Database** | Supabase (PostgreSQL) + encrypted IndexedDB hybrid |
| **Auth & Security** | Supabase Auth + client-side encryption |
| **Data Flow** | Client-first hybrid sync (user data stays local, aggregated results stored remotely) |
| **UI** | React components with CSS Modules & Lucide icons |
| **Analytics** | In-app charts and progress graphs for maturity dimensions |

Every page is also first initialized as a Next server component that fetches data by using serversupaclient, a client compo is then rendered
using the data making for a secure app structure.

To setup new db in supabase use the web supa sql editor and paste in the sql's from folder "sql_tables". Make sure to also turn off emailconfirmation for new users in supabase web settings. This allows users to use the coded in signup functionality.

### Process Flow

| Step | Title | Description |
|------|--------|-------------|
| 1 | **Answer assessment questions** | Evaluate your organization’s AI maturity through structured yes/no and descriptive questions. |
| 2 | **Set your priority dimensions** | Identify which capability areas matter most (e.g., Data, Strategy, People). |
| 3 | **Analysis & Planning** | Visualize your AI maturity in interactive charts and tables. |
| 4 | **Get recommendations** | Receive tailored suggestions and best practices for improvement. |

*(A future step “Reassess” will allow comparative tracking over time.)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project + credentials

### 1. Clone & Install
- Clone repo
- Make new .env.local file
- Copy your env credentials to the new file, look for .env.example for example.
- Open top folder (/ai-maturity-checker) to console
- Run command "npm install"
- After installing packages run "npm run dev"
- Head to http://localhost:3000/ And start editing code