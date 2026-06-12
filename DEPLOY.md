# Deployment Guide

## Option A — Railway (backend) + Vercel (frontend) [Recommended]

### Step 1 — Deploy the backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** → select `bassfy/infoenc`
3. Set the **Root Directory** to `backend`
4. Add a **MySQL** plugin (click + → Database → MySQL)
5. In your backend service → **Variables**, add:

```
NODE_ENV=production
JWT_SECRET=<generate a 64-char random string>
JWT_REFRESH_SECRET=<generate another 64-char random string>
FRONTEND_URL=https://YOUR_VERCEL_APP.vercel.app
```

Railway auto-injects `DATABASE_URL` from the MySQL plugin — update `backend/src/config/database.js` if you want to use that instead of individual vars.

6. In the MySQL plugin → **Query** tab, run the contents of `database/schema.sql`
7. Copy your Railway backend URL (e.g. `https://infoenc-production.up.railway.app`)

---

### Step 2 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `bassfy/infoenc` from GitHub
3. Set **Root Directory** to `frontend`
4. Add this **Environment Variable**:

```
VITE_API_URL=https://YOUR_RAILWAY_BACKEND_URL
```

5. Click **Deploy** → Vercel builds and publishes automatically

6. Copy your Vercel URL and paste it back into Railway's `FRONTEND_URL` variable

---

## Option B — Docker Compose (self-hosted / VPS)

Runs everything locally or on any VPS (DigitalOcean, Hetzner, etc.):

```bash
git clone https://github.com/bassfy/infoenc
cd infoenc

# Set secrets in docker-compose.yml (JWT_SECRET, JWT_REFRESH_SECRET)
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000
- MySQL:    localhost:3306

To run on a domain, put Nginx or Caddy in front with SSL.

---

## Option C — Local development

```bash
# 1. Start MySQL and run schema
mysql -u root -p < database/schema.sql

# 2. Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default 3306) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`infoenc_academy`) |
| `JWT_SECRET` | 64+ char random secret for access tokens |
| `JWT_REFRESH_SECRET` | 64+ char random secret for refresh tokens |
| `FRONTEND_URL` | Frontend origin for CORS |
| `SMTP_*` | Email config (optional) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL in production (leave empty for local proxy) |
