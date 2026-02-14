# PayLock - Replit Agent Guide

## Overview

PayLock is a pay-to-unlock content platform where creators upload media (images/videos), set a price, and generate secure shareable links. Viewers see blurred previews and must pay to unlock the full content. The app features AI-powered content descriptions using Google's Gemini API and payment processing via MoneyFusion.

The project is currently in a **hybrid transition state**: it started as a client-side prototype using `localStorage` for all data, and is being migrated to a server-backed architecture with PostgreSQL. The frontend is a React SPA (Vite + TypeScript), and a basic Express.js backend exists in `server/index.js` but is not yet fully integrated — most frontend logic still reads/writes directly to `localStorage` via `services/storageService.ts`.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework:** React 19 with TypeScript, bundled by Vite
- **Routing:** React Router DOM v7 using `HashRouter` (hash-based routing for static hosting compatibility)
- **Styling:** Tailwind CSS loaded via CDN (`<script src="https://cdn.tailwindcss.com">`) plus a custom `index.css` file. The design uses a dark slate/indigo color scheme.
- **Icons:** Lucide React for all iconography
- **State Management:** Local component state with `useState`/`useEffect`. No global state library. Auth state changes are broadcast via a custom `window` event (`auth-change`).
- **Path Aliases:** `@/*` maps to project root via `tsconfig.json` paths and Vite `resolve.alias`

### Backend
- **Runtime:** Node.js with Express.js (`server/index.js`)
- **Database:** PostgreSQL via the `pg` library (connection via `DATABASE_URL` environment variable)
- **API Prefix:** All backend routes are under `/api/` (e.g., `/api/auth/signup`)
- **Proxy:** Vite dev server proxies `/api` requests to `http://localhost:3000`
- **Note:** The server file references port 5000 but Vite also uses port 5000 — this conflict needs resolution. The backend should likely run on port 3000 to match the Vite proxy config.

### Data Layer — Key Architectural Decision
- **Current State:** `services/storageService.ts` implements ALL data operations (CRUD for content, users, transactions, balances, withdrawals) using `localStorage`. This is the primary data layer the frontend actually uses.
- **Migration Target:** `server/index.js` has PostgreSQL-backed API routes that mirror some of this functionality (auth signup is partially implemented). The database schema expects tables: `users`, `content`, `transactions`, `withdrawals`.
- **Action Required:** The migration from localStorage to the PostgreSQL backend API is incomplete. When extending this app, either:
  1. Complete the backend API and update `storageService.ts` to call `/api/` endpoints instead of localStorage, OR
  2. Continue with localStorage for demo purposes
- **Database tables needed** (inferred from server code and types): `users` (id, name, email, password, role), `content` (id, title, description, price, currency, imageBase64, mimeType, createdAt, creatorId), `transactions` (id, contentId, contentTitle, amount, netAmount, currency, timestamp, buyerMasked), `withdrawals` (id, userId, userName, amount, currency, method, accountNumber, status, createdAt)

### Authentication
- **Mechanism:** Simulated JWT auth. `localStorage` stores a session object with user info and a mock token (`mock-jwt-{userId}`).
- **Roles:** Two roles — `user` and `admin`. First registered user or `admin@paylock.com` gets admin role.
- **Route Protection:** `ProtectedRoute` component in `App.tsx` checks session from localStorage. Admin pages additionally check `session.user.role === 'admin'`.
- **Auth Events:** Components listen for `window` custom event `auth-change` to reactively update auth state (e.g., Navbar).

### Content Flow
1. Creator uploads media file → converted to base64 → optionally generates AI title/description → saved with price
2. A shareable link is generated (`/view/:id`)
3. Viewer sees blurred preview → clicks unlock → payment modal appears
4. After payment, content is revealed and a transaction is recorded
5. Creator can view earnings and request withdrawals from Dashboard

### Key Pages
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page + grid of created content |
| `/create` | Create | Upload media, set price, generate AI descriptions |
| `/view/:id` | ViewLink | Public content view with payment gate |
| `/dashboard` | Dashboard | Creator earnings, transactions, withdrawal |
| `/admin` | Admin | User/content/transaction management |
| `/login` | Login | Email/password login |
| `/signup` | Signup | Account registration |
| `/features` | Features | Static marketing page |
| `/pricing` | Pricing | Static pricing page |

### Build & Run
- **Dev:** `npm run dev` (Vite on port 5000) or `npm start` (concurrent Vite + Express server)
- **Build:** `npm run build` (Vite production build)
- **Server only:** `npm run server` (Express backend)

## External Dependencies

### Google Gemini API
- **Purpose:** AI-powered content title and description generation from uploaded media
- **SDK:** `@google/genai` package
- **Model:** `gemini-3-flash-preview` for multimodal (image/video) analysis
- **Config:** API key set via `GEMINI_API_KEY` in `.env.local`, exposed to client via Vite's `define` as `process.env.API_KEY` and `process.env.GEMINI_API_KEY`
- **Graceful degradation:** If no API key, returns default placeholder text

### MoneyFusion Payment Gateway
- **Purpose:** Real payment processing for content unlocking
- **Endpoints:** `https://www.pay.moneyfusion.net/pay` (initiate) and `https://www.pay.moneyfusion.net/paiementNotif` (status check)
- **Flow:** Client-side initiated → user enters phone number → payment is pushed to mobile money → polling for payment confirmation
- **Currency:** Primarily targets XOF (CFA Franc) but supports USD and EUR display
- **Integration:** Directly from frontend (`storageService.ts` and `PaymentModal.tsx`) — no backend proxy currently

### PostgreSQL
- **Purpose:** Persistent data storage (migration target)
- **Driver:** `pg` package with connection pooling
- **Connection:** Via `DATABASE_URL` environment variable
- **Status:** Schema needs to be created; only partial route implementation exists in `server/index.js`

### Supabase
- **Package:** `@supabase/supabase-js` is listed as a dependency but does not appear to be actively used in the codebase. It may have been considered as an alternative backend.

### Other Notable Dependencies
- `concurrently` — runs Vite and Express server simultaneously
- `cors` — Express CORS middleware
- `dotenv` — environment variable loading for server