# BookNest

BookNest is a full-stack PDF library and reader app with JWT auth, uploads, public library browsing, and in-browser PDF reading with progress tracking.

## Stack

- Frontend: React + Tailwind + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- File storage: Local (dev) or Cloudinary (free-tier production)

## Environment

Create `server/.env` from `server/.env.example`.

### Required server vars

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `CLIENT_URLS`
- `STORAGE_PROVIDER` (`local` or `cloudinary`)

If `STORAGE_PROVIDER=local`:
- `UPLOAD_DIR`

If `STORAGE_PROVIDER=cloudinary`:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend `client/.env`:
- `VITE_API_URL` (example: `https://your-backend.onrender.com/api`)

## Local run

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

## Free deployment (recommended)

1. MongoDB Atlas (free M0 cluster)
   - Create cluster, DB user, allow network access.
   - Copy connection string to `MONGODB_URI`.

2. Cloudinary (free tier)
   - Create account.
   - From dashboard copy:
     - Cloud name
     - API key
     - API secret

3. Deploy backend on Render (free tier)
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `npm start`
   - Set env:
     - `NODE_ENV=production`
     - `MONGODB_URI=...`
     - `JWT_SECRET=...`
     - `JWT_EXPIRES_IN=7d`
     - `CLIENT_URL=https://<your-vercel-app>.vercel.app`
     - `CLIENT_URLS=https://<your-vercel-app>.vercel.app`
     - `STORAGE_PROVIDER=cloudinary`
     - `CLOUDINARY_CLOUD_NAME=...`
     - `CLOUDINARY_API_KEY=...`
     - `CLOUDINARY_API_SECRET=...`

4. Deploy frontend on Vercel (free tier)
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Env:
     - `VITE_API_URL=https://<your-render-backend>.onrender.com/api`

5. Final wiring
   - Update Render `CLIENT_URL` and `CLIENT_URLS` with exact Vercel URL.
   - Redeploy backend once.

6. Verify
   - Register/login, upload PDF, open reader, refresh, open again.
