# HDSS — AI-Powered Healthcare Decision Support System

A premium MERN dashboard for clinician-facing decision support. It combines patient records, time-series vitals, alerts, analytics, medication safety checks, and an explainable mock-AI diagnostic assistant.

> **Clinical safety:** Decision support only — not a substitute for clinical judgment. All patient data in this repository is fictional/demo data.

## Stack
- React + Vite + Tailwind CSS + Framer Motion + Recharts + Lucide React
- Node.js + Express + Mongoose
- JWT authentication + Doctor/Nurse/Admin roles
- Axios + TanStack React Query
- Socket.io for live vitals/alerts
- Mock AI service by default; optional LLM adapter can be added behind the same service interface

## Run
Requirements: Node.js 18+. MongoDB is optional for local development. If the configured database is unavailable and `ALLOW_MEMORY_FALLBACK=true`, the server uses an in-memory demo database outside production. Data in memory is temporary and is not written to Atlas.

```bash
npm install
npm run install:all
```

Create `server/.env` from `server/.env.example` and set `MONGO_URI` to your local MongoDB or MongoDB Atlas connection string, then start both apps:

```bash
npm run dev
```

Client: http://localhost:5173  | API: http://localhost:5003

When the database has no users, the server initializes fictional demo accounts at startup. It initializes fictional demo patients, vitals, and alerts whenever the database has no patients. The persistent seed command is safe to rerun and does not clear existing records:

```bash
npm run seed
```

Demo credentials (the same password is used for each role):
- doctor@hdss.local / Demo@123
- nurse@hdss.local / Demo@123
- admin@hdss.local / Demo@123

The seed command requires a reachable persistent MongoDB server and will fail if `MONGO_URI` is missing or the database cannot be reached. The app can still start in temporary in-memory demo mode when `ALLOW_MEMORY_FALLBACK=true`; data in that mode is lost when the server stops. This setting is ignored in production.

## Troubleshooting
- Start `npm run dev` from this project root so both the API and frontend run. Starting only the client leaves the dashboard without its data API.
- If the API is unavailable, the dashboard displays a connection warning; use **Retry connection** after the server is running.
- The in-memory demo database is recreated and seeded whenever the server starts, so local demo changes are temporary. Use a reachable MongoDB instance in `MONGO_URI` for data that must persist across restarts.

## Structure
```
client/     React UI, pages, components, context, API client
server/     Express MVC API, MongoDB models, AI service, Socket.io
```

## API
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/patients`
- GET `/api/patients/:id`
- POST `/api/patients`
- GET `/api/vitals/:patientId`
- POST `/api/vitals`
- POST `/api/ai/diagnose`
- POST `/api/ai/chat`
- POST `/api/medications/check-interaction`
- GET `/api/alerts`
- PATCH `/api/alerts/:id/acknowledge`
- PATCH `/api/alerts/:id/escalate`
- GET `/api/analytics/overview`

## Production notes
Use a managed MongoDB instance, HTTPS, secret rotation, audit logging, stronger request schemas, encrypted PHI storage, clinical validation, and a validated medical knowledge source before any real clinical deployment.

## Render and Vercel deployment
`render.yaml` defines the Express API as a Render Docker web service. `client/vercel.json` configures the Vite single-page app for Vercel.

1. Import this GitHub repository in Render as a Blueprint and create the `hdss-api` service. Set the prompted `MONGO_URI` to a dedicated MongoDB database reachable by Render, `JWT_SECRET` to a new random secret, and `CLIENT_URL` to the deployed Vercel site origin. The service starts with mock AI mode and fictional demo data. Never use real patient data for this demo.
2. Import the same repository in Vercel and set the project root directory to `client`. Set the build-time environment variable `VITE_API_URL` to the Render API URL ending in `/api` (for example, `https://hdss-api.onrender.com/api`), then deploy.
3. Copy the resulting Vercel production origin into Render's `CLIENT_URL` environment variable and redeploy the API. This allows the browser app to call the API and connect to its Socket.IO endpoint.

Keep database and JWT secrets in the hosting provider's environment settings, not in Git. Render's free web service may sleep while idle and take longer to respond on the first request. For a production healthcare service, select an appropriate paid service and complete the security, privacy, clinical validation, and compliance work described above.
