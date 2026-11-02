# 🎓 CampusHire — Smart Campus Placement & Recruitment Management System

A full-stack campus recruitment platform connecting **Students**, **Corporate Recruiters**, and **Placement Cell Administrators** through automated eligibility screening, resume parsing, explainable skill-matching, and real-time analytics.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup](#1-backend-setup-django)
  - [Frontend Setup](#2-frontend-setup-react--vite)
- [Running the Application](#-running-the-application)
- [Demo Accounts](#-demo-accounts)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Environment Variables](#-environment-variables)

---

## 🛠 Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| **Backend**  | Python 3.10+, Django 5.x, Django REST Framework  |
| **Auth**     | SimpleJWT (Access + Refresh tokens)              |
| **Database** | SQLite (dev) / PostgreSQL (prod)                 |
| **Resume**   | PyMuPDF (fitz) — PDF text & skill extraction     |
| **API Docs** | drf-spectacular (Swagger / ReDoc)                |
| **Frontend** | React 19, Vite 8, React Router 7                |
| **Styling**  | Tailwind CSS 4                                   |
| **Charts**   | Recharts 3                                       |
| **Icons**    | Lucide React                                     |
| **HTTP**     | Axios                                            |

---

## 📁 Project Structure

```
PythonDjango/
├── backend/                    # Django REST API
│   ├── apps/                   # Django apps (modular)
│   │   ├── accounts/           # User model, JWT auth, registration
│   │   ├── analytics/          # Placement stats & dashboard data
│   │   ├── applications/       # Job applications & status tracking
│   │   ├── companies/          # Company profiles & verification
│   │   ├── interviews/         # Interview scheduling
│   │   ├── jobs/               # Job postings & eligibility rules
│   │   ├── notifications/      # In-app notification system
│   │   ├── recruiters/         # Recruiter profiles
│   │   └── students/           # Student profiles & resume management
│   ├── config/                 # Django project config
│   │   ├── settings.py         # Main settings (DB, JWT, CORS, etc.)
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── media/                  # Uploaded resumes (gitignored)
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env                    # Environment variables (local)
│   ├── .env.example            # Template for .env
│   └── db.sqlite3              # SQLite database (dev)
│
├── frontend/                   # React + Vite SPA
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Axios API service modules
│   │   │   ├── client.js       # Axios instance with JWT interceptors
│   │   │   ├── auth.js
│   │   │   ├── students.js
│   │   │   ├── recruiters.js
│   │   │   ├── jobs.js
│   │   │   ├── applications.js
│   │   │   ├── interviews.js
│   │   │   ├── notifications.js
│   │   │   └── analytics.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Top navigation with theme toggle
│   │   │   ├── Sidebar.jsx     # Dashboard sidebar navigation
│   │   │   ├── Footer.jsx
│   │   │   ├── ThemeToggle.jsx # Dark/Light mode switch
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx     # Navbar + Footer wrapper
│   │   │   └── DashboardLayout.jsx  # Navbar + Sidebar wrapper
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Login, Register
│   │   │   ├── student/        # Student dashboard, profile, jobs, etc.
│   │   │   ├── recruiter/      # Recruiter dashboard, job mgmt, etc.
│   │   │   └── admin/          # Admin dashboard, approvals, etc.
│   │   ├── App.jsx             # Root component & route definitions
│   │   ├── App.css
│   │   ├── index.css           # Global design system & dark mode
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   ├── vite.config.js          # Vite config with API proxy
│   ├── package.json
│   └── package-lock.json
│
└── README.md                   # ← You are here
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool          | Version   | Check Command         |
|---------------|-----------|------------------------|
| **Python**    | 3.10+     | `python --version`     |
| **pip**       | Latest    | `pip --version`        |
| **Node.js**   | 18+       | `node --version`       |
| **npm**       | 9+        | `npm --version`        |

---

## 🚀 Getting Started

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy the environment template and configure
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Run database migrations
python manage.py migrate

# (Optional) Create a superuser for Django Admin
python manage.py createsuperuser

# (Optional) Seed demo data if a seed command exists
# python manage.py seed_data

# Start the Django development server
python manage.py runserver
```

The backend API will be running at: **http://127.0.0.1:8000**

### 2. Frontend Setup (React + Vite)

```bash
# Open a NEW terminal, navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be running at: **http://localhost:5173**

> **Note**: The Vite dev server is pre-configured to proxy `/api` and `/media` requests to `http://127.0.0.1:8000`, so both servers work together seamlessly.

---

## 🏃 Running the Application

You need **two terminals** running simultaneously:

| Terminal | Directory  | Command                    | URL                        |
|----------|-----------|----------------------------|-----------------------------|
| 1        | `backend/` | `python manage.py runserver` | http://127.0.0.1:8000     |
| 2        | `frontend/`| `npm run dev`               | http://localhost:5173      |

Open **http://localhost:5173** in your browser to use the application.

---

## 🔑 Demo Accounts

The following demo accounts are available on the login page via quick-fill buttons:

| Role              | Email                              | Password             |
|-------------------|------------------------------------|----------------------|
| **Student**       | `arjun.sharma@campushire.edu`      | `StudentPass@2026`   |
| **Recruiter**     | `sarah.recruiter@google.com`       | `RecruiterPass@2026` |
| **Placement Admin** | `admin@campushire.edu`           | `AdminPass@2026`     |

> These accounts must be seeded into the database first. If they don't exist, register new accounts through the UI.

---

## 📖 API Documentation

Once the backend is running, interactive API docs are available at:

| Format  | URL                                    |
|---------|----------------------------------------|
| Swagger | http://127.0.0.1:8000/api/docs/       |
| ReDoc   | http://127.0.0.1:8000/api/redoc/      |
| Schema  | http://127.0.0.1:8000/api/schema/     |
| Root    | http://127.0.0.1:8000/api/            |

---

## ✨ Features

### Student Portal
- 📝 Profile management with academic details
- 📄 PDF resume upload with PyMuPDF text extraction
- 🔍 Browse jobs with automatic eligibility checking
- 📊 Explainable skill-match percentage per job
- 📋 Application tracking with status timeline
- 📅 Interview schedule calendar
- 🔔 Real-time notifications

### Recruiter Portal
- 🏢 Company profile management
- 📝 Create/edit job postings with eligibility criteria
- 👥 Applicant review with skill-match scores
- 📅 Interview scheduling with meeting links
- 📊 Hiring funnel analytics
- 🔔 Application & approval notifications

### Placement Admin Portal
- ✅ Recruiter/company verification workflow
- 📋 Job posting approval before going live
- 👨‍🎓 Student management and oversight
- 📊 Campus-wide placement analytics & dashboards

### General
- 🌗 Dark/Light theme toggle (persisted across sessions)
- 📱 Fully responsive design
- 🔐 JWT authentication with token refresh
- 🎨 Modern SaaS-grade UI with Tailwind CSS

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory based on `.env.example`:

```env
# Django Configuration
SECRET_KEY=change-this-in-production-use-a-strong-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (sqlite or postgresql)
DB_ENGINE=sqlite
DB_NAME=campushire_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# JWT Tokens
ACCESS_TOKEN_LIFETIME_MINUTES=1440
REFRESH_TOKEN_LIFETIME_DAYS=7
```

To use **PostgreSQL** instead of SQLite, set `DB_ENGINE=postgresql` and configure the `DB_*` variables.

---

## 📄 License

This project is for educational/demonstration purposes.
