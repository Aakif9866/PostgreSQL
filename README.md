# PERN Stack Product Manager

A full-stack product management app built with PostgreSQL, Express, React, and Node.js. Features JWT-based admin authentication, Redis caching, rate limiting, bot detection, and multiple UI themes.

---

## Tech Stack

**Backend**
- Node.js + Express 5
- PostgreSQL via [Neon](https://neon.tech) (serverless)
- Redis via [Upstash](https://upstash.com) (REST-based, serverless)
- JWT authentication with httpOnly cookies
- [Arcjet](https://arcjet.com) — rate limiting, bot detection, shield (SQLi/XSS/CSRF protection)
- Helmet, Morgan, CORS

**Frontend**
- React 19 + Vite
- Zustand (global state management)
- Axios (API calls with credentials)
- DaisyUI + Tailwind CSS (13 themes)
- React Hot Toast (notifications)

---

## Features

- Admin login/logout with JWT stored in httpOnly cookies
- Full CRUD for products (name, price, image URL)
- Redis caching on all GET routes (5 min TTL), cache invalidated on write
- Rate limiting via token bucket (30 refill / 5s interval, capacity 20)
- Bot detection — blocks all bots except search engines
- Shield middleware — protects against SQLi, XSS, CSRF
- 13 switchable UI themes persisted in localStorage
- Production-ready: Express serves the Vite build as static files

---

## Project Structure

```
PERN stack/
├── backend/
│   ├── config/db.js          # Neon PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js # login, logout, checkAuth
│   │   └── productController.js # CRUD + Redis caching
│   ├── lib/
│   │   ├── arcjet.js         # Rate limit + bot detection setup
│   │   └── redis.js          # Upstash Redis client
│   ├── middleware/auth.js    # JWT protectRoute middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── productRoutes.js
│   ├── seeds/products.js     # Seed data
│   └── server.js             # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProductCard, AddProductModal, etc.
│   │   ├── constants/        # Theme definitions
│   │   ├── pages/            # HomePage, LoginPage, ProductPage
│   │   └── store/            # Zustand stores (auth, product, theme)
│   └── vite.config.js
├── .env                      # Environment variables (never commit this)
├── .env.example              # Sample env file (safe to commit)
└── package.json              # Root — runs backend, builds frontend
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- An [Upstash](https://upstash.com) Redis database
- An [Arcjet](https://arcjet.com) account and API key

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd "PERN stack"

# 2. Copy the sample env and fill in your values
cp .env.example .env

# 3. Install dependencies and build the frontend
npm run build

# 4. Start the server
npm start
```

The app will be available at `http://localhost:5001`.

### Development

```bash
# Run backend with hot reload (nodemon)
npm run dev

# Run frontend dev server (in a separate terminal)
cd frontend && npm run dev
```

Frontend dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:5001`.

---

## API Routes

### Auth — `/api/auth`

| Method | Route      | Protected | Description          |
|--------|------------|-----------|----------------------|
| POST   | `/login`   | No        | Admin login          |
| POST   | `/logout`  | Yes       | Clear auth cookie    |
| GET    | `/check`   | Yes       | Verify current session |

### Products — `/api/products`

All product routes require authentication.

| Method | Route    | Description                        |
|--------|----------|------------------------------------|
| GET    | `/`      | Get all products (cached)          |
| POST   | `/`      | Create a product                   |
| GET    | `/:id`   | Get single product (cached)        |
| PUT    | `/:id`   | Update a product                   |
| DELETE | `/:id`   | Delete a product                   |

---

## Environment Variables

See `.env.example` for all required variables.

---

## Scripts

| Command         | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Start backend with nodemon                       |
| `npm run build` | Install deps + build frontend for production     |
| `npm start`     | Start production server (`node backend/server.js`) |

---

## Things I Learned Building This

### Backend

- **Tagged template literals for SQL** — The Neon `sql` function uses tagged template literals (`sql\`SELECT * FROM products\``) which automatically parameterises values, preventing SQL injection without any extra effort.

- **httpOnly cookies vs localStorage for JWTs** — Storing JWTs in httpOnly cookies means JavaScript can't access them, protecting against XSS attacks. localStorage is convenient but vulnerable.

- **Redis as a caching layer** — Instead of hitting the database on every request, GET routes check Redis first. On writes (create/update/delete), the relevant cache keys are deleted so the next read fetches fresh data. This pattern is called cache invalidation.

- **Token bucket vs sliding window rate limiting** — Token bucket refills at a fixed rate and allows short bursts up to capacity. Sliding window is smoother and prevents edge-case bursts at window boundaries. Both are available in Arcjet.

- **Arcjet shield** — A single middleware call that protects against SQL injection, XSS, and CSRF without writing any custom validation logic.

- **Express 5 breaking changes** — Express 5 dropped support for bare `*` wildcard routes. The correct syntax is `/{*splat}`. Also, async errors are now automatically forwarded to error handlers without needing try/catch wrappers in some cases.

- **`path.resolve()` for `__dirname` in ES modules** — ES modules don't have `__dirname` by default. Using `path.resolve()` gives you the current working directory, which works for serving static files in production.

- **`NODE_ENV=production`** — The server conditionally serves the Vite build only when `NODE_ENV` is `production`. Forgetting to set this means the frontend never gets served in production.

### Frontend

- **Zustand over Redux** — Zustand is a minimal state management library. No boilerplate, no providers, no reducers — just a `create` function with state and actions. Much simpler for small-to-medium apps.

- **`import.meta.env.MODE` for environment-aware base URLs** — In development, API calls go to `http://localhost:5001`. In production, they use a relative path (`""`) since the frontend and backend are served from the same origin.

- **`withCredentials: true` in Axios** — Required for cookies to be sent cross-origin in development. Without this, the browser won't attach the JWT cookie to API requests.

- **DaisyUI themes with `data-theme`** — DaisyUI themes are applied by setting `data-theme` on the `<html>` element. Persisting the user's choice in `localStorage` and reading it on load gives a seamless experience without flash.

- **Zustand store for form state** — Keeping form data inside the Zustand store (instead of local `useState`) makes it easy to share form state between components and reset it after submission without prop drilling.

### General

- **`.env` should never be committed** — Real credentials in version control is a serious security risk. Always add `.env` to `.gitignore` and provide a `.env.example` with placeholder values.

- **Cache invalidation is one of the hard problems** — Deciding when to invalidate cache entries requires thinking carefully about which operations affect which data. Deleting both `products` (list) and `product:{id}` (single) on every write keeps the cache consistent.

- **Serverless databases need connection pooling awareness** — Neon's serverless driver is designed for environments where you can't maintain a persistent connection (like edge functions). It uses HTTP under the hood, so each query is stateless.
