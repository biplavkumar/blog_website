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

## Deployment (Free Hosting)

### Step 1: Database — MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create a free account
2. Create a **free shared cluster**
3. Under **Database Access**, create a user with a password
4. Under **Network Access**, add `0.0.0.0/0` (allow all IPs)
5. Click **Connect** → **Drivers** → Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/blog_platform`

### Step 2: Backend — Render (Free)
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New → Web Service** → Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `MONGO_URL` | Your MongoDB Atlas connection string |
   | `DB_NAME` | `blog_platform` |
   | `ADMIN_PASSWORD` | Your secure admin password |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` (set after Vercel deploy) |
5. Click **Deploy** → Copy your backend URL (e.g. `https://blog-backend-xxxx.onrender.com`)

### Step 3: Frontend — Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New → Project** → Import your GitHub repo
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
4. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_BACKEND_URL` | Your Render backend URL (from Step 2) |
5. Click **Deploy**

### Step 4: Update CORS
Go back to Render → your backend service → Environment → Update `CORS_ORIGINS` with your Vercel frontend URL.

---

### Deployment Config Files Included
- `render.yaml` — Render backend auto-config
- `frontend/vercel.json` — Vercel frontend routing config
- `backend/.env.example` — Template for backend env vars
- `frontend/.env.example` — Template for frontend env vars
