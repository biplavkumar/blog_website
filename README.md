# Blog Platform — The Journal

A professional, dark-themed blog platform built with React + FastAPI + MongoDB.

## Features
- Public blog listing with grid tiles, search, and category filtering
- Full blog detail pages with hero images
- Password-protected admin panel
- Rich text editor (react-quill) for blog creation/editing
- Image upload with auto-crop/resize to 4:3 aspect ratio
- Fully responsive (mobile + desktop)

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI, React Router
- **Backend**: FastAPI, Motor (async MongoDB), Pillow (image processing)
- **Database**: MongoDB

---

## Quick Start

### Prerequisites
- Node.js 18+ & Yarn
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create/edit `backend/.env`:
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="blog_platform"
ADMIN_PASSWORD="your_secure_password"
CORS_ORIGINS="http://localhost:3000"
```

Start the backend:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend Setup
```bash
cd frontend
yarn install
```

Create/edit `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

Start the frontend:
```bash
yarn start
```

### 3. Open in Browser
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin (use the password you set in ADMIN_PASSWORD)

---

## Project Structure
```
├── backend/
│   ├── server.py          # FastAPI app (all routes + image processing)
│   ├── requirements.txt   # Python dependencies
│   └── .env               # MongoDB URL, admin password
├── frontend/
│   ├── src/
│   │   ├── App.js         # Router setup
│   │   ├── pages/         # 5 pages (Home, BlogDetail, AdminLogin, Dashboard, Editor)
│   │   ├── components/    # Header, BlogCard + Shadcn UI
│   │   ├── index.css      # Dark theme CSS variables + Quill styles
│   │   └── App.css        # Animations
│   ├── package.json
│   └── .env               # Backend URL
└── README.md
```

## Deployment
For production deployment (e.g., Vercel + Railway/Render):
- Deploy `frontend/` to Vercel (set `REACT_APP_BACKEND_URL` env var)
- Deploy `backend/` to Railway/Render (set `MONGO_URL`, `DB_NAME`, `ADMIN_PASSWORD`)
- Use MongoDB Atlas for a cloud database
