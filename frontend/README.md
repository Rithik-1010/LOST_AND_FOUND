# Campus Lost & Found — Frontend Client

The frontend for the Campus Lost & Found Portal, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🚀 Features

- **Campus Feed (`/`)**: Live search, category filtering, zone filtering, lost/found tabs, and item status badges.
- **Report Item (`/items/new`)**: Interactive form with real image upload, preview, and campus location tagging.
- **Item Details (`/items/[id]`)**: Full item views, custody status, ownership claim modal, and owner claim approval/rejection actions.
- **Profile Dashboard (`/profile`)**: Student activity stats, Karma score tracker, and tabs for reported items and submitted claims.
- **State Management**: TanStack Query v5 with optimistic caching and refetching.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` if custom backend URL is desired (defaults to `http://localhost:8000/api/v1`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Run Dev Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Build for Production
```bash
npm run build
npm start
```
