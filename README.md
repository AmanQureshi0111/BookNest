# BookNest

BookNest is a full-stack PDF library and reader app with JWT auth, personal uploads, public library browsing, and in-browser PDF reading with progress tracking.

## Tech stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT (email/username + password)
- **Storage:** Local (dev) or AWS S3 (production)
- **PDF Rendering:** `react-pdf`

## Project structure

```text
bookNest/
  client/   # React frontend
  server/   # Express backend
```

## Backend API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Books
- `POST /api/books/upload`
- `DELETE /api/books/delete/:id`
- `GET /api/books/all`
- `GET /api/books/user`
- `GET /api/books/file/:id`
- `POST /api/books/:id/favorite`
- `POST /api/books/:id/comments`

### Progress
- `POST /api/progress/save`
- `GET /api/progress/get/:bookId`
- `GET /api/progress/recent`

## Security and production hardening

- Helmet security headers
- API rate limiting
- CORS allow-list (`CLIENT_URLS`)
- Request compression
- Input validation (`express-validator`)
- JWT-protected private routes
- PDF-only upload filter + 10MB upload limit
- Fail-fast env validation on server startup

## Environment variables

Create `server/.env` from `server/.env.example`.

Required:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL` (single frontend URL)
- `CLIENT_URLS` (comma-separated list if multiple frontends)
- `STORAGE_PROVIDER` (`local` or `s3`)

For local storage:
- `UPLOAD_DIR`

For S3 storage:
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

Frontend `client/.env`:
- `VITE_API_URL` (example: `https://api.your-domain.com/api`)

## Local development

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

## Production deployment (recommended)

### 1. MongoDB Atlas
1. Create Atlas cluster.
2. Create DB user.
3. Allow your backend host IP in Network Access.
4. Copy connection string into `MONGODB_URI`.

### 2. AWS S3 (required for durable file storage)
1. Create bucket (private).
2. Create IAM user with S3 permissions for that bucket.
3. Add `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
4. Set `STORAGE_PROVIDER=s3`.

### 3. Backend deploy (Render)
1. Create Web Service from this repo.
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add backend env vars from above.
6. Set `NODE_ENV=production`.

### 4. Frontend deploy (Vercel)
1. Import same repo in Vercel.
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_URL=https://<render-service-domain>/api`

### 5. Final wiring
1. Copy Vercel URL.
2. Set backend `CLIENT_URL` to that URL.
3. Set `CLIENT_URLS` (same URL or comma-separated list).
4. Redeploy backend.
