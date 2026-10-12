# 🏫 Campus Lost & Found Portal

An enterprise-grade, full-stack **Campus Lost & Found Platform** designed for universities and colleges. Built with **Next.js 16 (App Router)**, **FastAPI**, **SQLAlchemy (Async)**, and **SQLite / PostgreSQL**.

---

## ✨ Features

- **🔍 Smart Campus Feed**: Real-time multi-criteria search and filtering by item type (*Lost* vs. *Found*), category, campus zone, and keywords.
- **📸 Report Lost or Found Items**: Multi-step reporting form with real image upload, preview, category selection, brand, color, safe custody locations, and optional reward notes.
- **🔐 Secure Proof-of-Ownership Claims**: Claimants can submit proof of ownership (lock-screen descriptions, engravings, inside contents) and contact info.
- **🛡️ Item Owner Verification Dashboard**: Post owners can review incoming claims and **Approve**, **Reject**, or confirm **Physical Handover**.
- **🏆 Student Profile & Karma Reputation**: Tracks reported items, submitted claims, and awards karma points (e.g., *Good Samaritan* ranking) when items are successfully returned.
- **⚡ Modern Async Architecture**: FastAPI async endpoints with eager-loaded relational models and TanStack React Query for snappy client-side state caching.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16 (Turbopack)](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [TanStack Query v5](https://tanstack.com/query), [Lucide Icons](https://lucide.dev/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Python 3.14+](https://python.org/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Database & ORM** | [SQLAlchemy 2.0 (Async)](https://docs.sqlalchemy.org/), [aiosqlite](https://github.com/omnilib/aiosqlite) / [asyncpg](https://github.com/MagicStack/asyncpg), [Alembic](https://alembic.sqlalchemy.org/) |
| **Storage** | Multipart Local File Uploads (`/static/uploads/`) |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Clone Repository
```bash
git clone https://github.com/Rithik-1010/LOST_AND_FOUND.git
cd LOST_AND_FOUND
```

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install email-validator

# Run database migrations
alembic upgrade head

# Seed realistic campus sample data (Zones, Categories, Items, Claims)
python seed.py

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 4. Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

- **Web Portal:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/items/` | List items with search, type, category, and zone filters |
| `POST` | `/api/v1/items/` | Post a new lost or found report |
| `GET` | `/api/v1/items/{id}` | Retrieve item details and associated claims |
| `PATCH` | `/api/v1/items/{id}/status` | Update item status (e.g. `verified`, `returned`) |
| `DELETE` | `/api/v1/items/{id}` | Delete a report |
| `POST` | `/api/v1/items/{id}/claims` | Submit proof of ownership claim |
| `GET` | `/api/v1/items/{id}/claims` | Retrieve claims on an item |
| `GET` | `/api/v1/categories/` | List all item categories |
| `GET` | `/api/v1/zones/` | List campus zones/buildings |
| `GET` | `/api/v1/claims/my-claims` | List claims filed by current user |
| `PATCH` | `/api/v1/claims/{id}/status` | Approve or reject a claim |
| `GET` | `/api/v1/users/me` | Current user profile, karma points, and activity |
| `POST` | `/api/v1/upload/` | Multipart image upload |

---

## 📂 Project Structure

```
LOST_AND_FOUND/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── api/v1/           # Modular route controllers
│   │   │   ├── items.py      # Items CRUD and filters
│   │   │   ├── categories.py # Categories endpoints
│   │   │   ├── zones.py      # Campus zones endpoints
│   │   │   ├── claims.py     # Claims management
│   │   │   ├── users.py      # User profile and karma
│   │   │   └── upload.py     # Image upload controller
│   │   ├── core/             # Database session & config
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── main.py           # FastAPI entrypoint & middleware
│   ├── static/uploads/       # Uploaded item images
│   ├── seed.py               # Database seeder script
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Feed with search & filters
│   │   ├── items/new/        # Item reporting form with image upload
│   │   ├── items/[id]/       # Item detail & claim modal
│   │   ├── profile/          # User dashboard & karma tracker
│   │   └── layout.tsx        # Responsive desktop/mobile shell
│   ├── components/ui/        # Reusable UI primitives (Button, Card, Badge)
│   ├── lib/
│   │   ├── api.ts            # Typed Axios client & interfaces
│   │   └── utils.ts          # Tailwind CSS utilities
│   └── package.json          # Node dependencies & scripts
│
└── README.md
```

---

## 🚢 Production Deployment

### Frontend (Vercel)
Set the environment variable:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

### Backend (Docker / Cloud Run / VPS)
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📄 License
MIT License. Created for campus communities.
