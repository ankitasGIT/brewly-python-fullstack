# Coffee Order Hub

A full-stack, production-grade coffee shop order management system with a modern React frontend and a robust FastAPI backend. The application supports customer ordering, manager dashboards, real-time status tracking, payment processing, and customer notifications — all secured with JWT-based authentication and role-based access control.

<div align="center">

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-blue)](./coffee-order-hub-main)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20PostgreSQL-green)](./coffee-store-backend)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Setup with Docker](#local-setup-with-docker)
  - [Manual Setup](#manual-setup)
- [Frontend (React)](#frontend-react)
  - [Architecture](#frontend-architecture)
  - [Project Structure](#frontend-project-structure)
  - [Available Scripts](#available-scripts-frontend)
  - [Environment Variables (Frontend)](#environment-variables-frontend)
  - [Routing](#routing)
  - [State Management](#state-management)
  - [Authentication & Authorization](#authentication--authorization)
  - [Testing](#testing-frontend)
- [Backend (FastAPI)](#backend-fastapi)
  - [Architecture](#backend-architecture)
  - [Project Structure](#backend-project-structure)
  - [Database Schema](#database-schema)
  - [API Endpoints](#api-endpoints)
  - [Order Status Flow](#order-status-flow)
  - [Idempotency](#idempotency)
  - [Payment & Notifications](#payment--notifications)
  - [Testing](#testing-backend)
  - [Environment Variables (Backend)](#environment-variables-backend)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Coffee Order Hub** is a comprehensive solution for coffee shop order management, designed with separation of concerns and production-ready standards in mind. The system enables customers to browse products, manage shopping carts, place orders with idempotent request support, and track order status in real-time. Managers can oversee all orders, update statuses through a defined workflow, and manage the product catalog dynamically.

**Key Highlights:**
-  **Secure**: JWT authentication with role-based access control (RBAC)
-  **Reliable**: Idempotent order creation, atomic transactions, payment integration
-  **Performant**: Async FastAPI backend, optimized React frontend with Vite
-  **Integrated**: Payment processing and customer notifications
-  **Containerized**: Docker & Docker Compose for consistent environments

---

##  Problem Statement

Build a production-grade, full-stack order management system for a coffee shop that:

1. **Supports two user roles** with distinct capabilities (Customer & Manager)
2. **Manages product catalogs** with variations (sizes, flavors) and dynamic pricing
3. **Handles order placement** with idempotency to prevent duplicate charges
4. **Processes payments** and integrates with external services
5. **Tracks orders** through a strict status workflow (waiting → preparation → ready → delivered)
6. **Sends notifications** on order status changes
7. **Enforces role-based access** at both API and UI levels
8. **Provides comprehensive testing** with unit and integration tests
9. **Deploys easily** with containerization

---

##  Features

### Customer Capabilities
-  **Self-Service Registration** — Sign up with email and password
-  **Menu Browsing** — Explore products with variations, prices, and descriptions
-  **Shopping Cart** — Add/remove items, adjust quantities, view real-time totals
-  **Order Placement** — Submit orders with automatic idempotency key generation
-  **Order Tracking** — View order history with live status updates (auto-polling every 10s)
-  **Payment Processing** — Secure integration with external payment provider

### Manager Capabilities
-  **All Customer Features**
-  **Order Dashboard** — View all customer orders system-wide (auto-refresh every 15s)
-  **Status Management** — Transition orders through the defined workflow
-  **Product Management** — Create, update, and delete products and variations
-  **User Management** — Create additional manager accounts
-  **Manager Portal** — Dedicated manager dashboard with charts and analytics

---

##  Tech Stack

### Frontend

| Category            | Technology                                              |
|---------------------|-------------------------------------------------------- |
| **Framework**       | React 18 with TypeScript                                |
| **Build Tool**      | Vite 5 with SWC (`@vitejs/plugin-react-swc`)           |
| **Styling**         | Tailwind CSS 3 with custom design tokens               |
| **UI Components**   | shadcn/ui (Radix UI primitives)                        |
| **State Management**| Zustand (client state) + TanStack React Query (server) |
| **HTTP Client**     | Axios with auth interceptors                           |
| **Routing**         | React Router DOM v6                                    |
| **Forms**           | React Hook Form + Zod validation                       |
| **Notifications**   | Sonner toast + shadcn/ui Toaster                       |
| **Charts**          | Recharts (manager dashboard)                           |
| **Testing**         | Vitest + React Testing Library + jsdom                 |

### Backend

| Category            | Technology                     |
|---------------------|------------------------------|
| **Language**        | Python 3.11+                 |
| **Framework**       | FastAPI (async)              |
| **Database**        | PostgreSQL 14+               |
| **ORM**             | SQLAlchemy (async)           |
| **Migrations**      | Alembic                      |
| **Authentication**  | JWT (PyJWT) + Argon2         |
| **API Client**      | HTTPX (async)                |
| **Validation**      | Pydantic                     |
| **Testing**         | Pytest + fixtures            |
| **Containerization**| Docker & Docker Compose      |

---

##  Repository Structure

```
coffee-store/
├── README.md                      # This file — unified documentation
├── coffee-order-hub-main/         # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/                   # HTTP API layer
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Route-level pages
│   │   ├── routes/                # Route guards
│   │   ├── store/                 # Zustand stores
│   │   ├── utils/                 # Utilities and constants
│   │   ├── App.tsx                # Root component
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── README.md                  # Frontend-specific docs
│
└── coffee-store-backend/          # Backend (FastAPI + PostgreSQL)
    ├── app/
    │   ├── api/                   # FastAPI routers
    │   ├── core/                  # Auth, security, logging
    │   ├── models/                # SQLAlchemy ORM models
    │   ├── schemas/               # Pydantic schemas
    │   ├── services/              # Business logic
    │   ├── repositories/          # Database queries
    │   ├── config.py              # Configuration
    │   ├── db.py                  # Database setup
    │   └── main.py                # App entry point
    ├── scripts/
    │   ├── seed_catalog.py        # Seed products
    │   └── seed_users.py          # Seed default users
    ├── tests/
    │   ├── unit/                  # Unit tests
    │   └── integration/           # Integration tests
    ├── alembic/                   # Database migrations
    ├── Dockerfile
    ├── docker-compose.yml
    ├── pyproject.toml
    ├── requirements.txt
    └── README.md                  # Backend-specific docs
```

---

##  Quick Start

### Prerequisites

- **Node.js** ≥ 18.x (for frontend)
- **Python** 3.11+ (for backend)
- **Docker** & **Docker Compose** (optional, for containerized setup)
- **PostgreSQL** 14+ (if running without Docker)
- **Git** for version control

### Local Setup with Docker

This is the fastest way to get the entire stack running locally.

```bash
# 1. Navigate to the backend directory
# IMPORTANT: All docker compose commands must run from this directory
cd coffee-store-backend

# 2. Start PostgreSQL and FastAPI backend with Docker
docker compose up -d --build

# 3. In the SAME directory (coffee-store-backend), run migrations
# Wait a few seconds for the database to be ready
sleep 10
docker compose --profile tools run --rm migrate

# Optional: Seed products and users (run from coffee-store-backend)
docker compose exec app python scripts/seed_catalog.py
docker compose exec app python scripts/seed_users.py

# 4. Backend is now running at http://localhost:8000
# API Docs at http://localhost:8000/docs

# 5. In another terminal, set up the frontend
cd ../coffee-order-hub-main

# 6. Install dependencies and start dev server
npm install
npm run dev

# Frontend is now running at http://localhost:5173
```

**Important Notes:**
- ⚠️ All `docker compose` commands must be run from the `coffee-store-backend/` directory
- The `-d` flag runs containers in the background
- The database takes a few seconds to become healthy, so wait before running migrations
- To stop all services: `docker compose down` (run from `coffee-store-backend/`)

**Default Credentials (Development):**
- **Customer:** `customer@example.com` / `customer123`
- **Manager:** `manager@example.com` / `manager123`

### Manual Setup

#### Backend Setup

```bash
cd coffee-store-backend

# 1. Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://coffee_user:coffee_pass@localhost:5432/coffee_shop
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_ENV=development
LOG_LEVEL=INFO
PAYMENT_SERVICE_URL=https://challenge.trio.dev/api/v1/payment
NOTIFICATION_SERVICE_URL=https://challenge.trio.dev/api/v1/notification
EOF

# 4. Create PostgreSQL database and user
createuser -P coffee_user  # When prompted, enter: coffee_pass
createdb -O coffee_user coffee_shop

# 5. Run database migrations
alembic upgrade head

# 6. Seed catalog and users (optional)
python scripts/seed_catalog.py
python scripts/seed_users.py

# 7. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd coffee-order-hub-main

# 1. Install dependencies
npm install

# 2. Create .env file (if backend is not at default location)
cat > .env << EOF
VITE_API_URL=http://localhost:8000/api/v1
EOF

# 3. Start development server
npm run dev

# Frontend runs at http://localhost:5173
```

---

##  Frontend (React)

### Frontend Architecture

The frontend follows a **layered, component-driven architecture** with clear separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│                    Pages (Route Views)                │
├──────────────────────────────────────────────────────┤
│              Components (Presentational)              │
├──────────────────────────────────────────────────────┤
│     Hooks (useAuth, useOrders, useMenu)              │
│     ┌──────────────────┐  ┌──────────────────────┐  │
│     │  React Query     │  │  Zustand Stores      │  │
│     │  (server state)  │  │  (client state)      │  │
│     └────────┬─────────┘  └──────────────────────┘  │
├──────────────┼──────────────────────────────────────┤
│         API Layer (Axios with Interceptors)         │
│         ├── Auth token injection (Bearer)           │
│         └── Auto 401 handling (redirect to login)   │
├──────────────────────────────────────────────────────┤
│              Backend REST API                        │
│              (http://localhost:8000/api/v1)          │
└──────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

1. **Dual State Management**
   - **Zustand** → Client state (auth tokens, cart contents, UI state)
   - **React Query** → Server state (menu, orders, status) with caching & auto-refetch

2. **Centralized Axios Instance** (`src/api/axios.ts`)
   - Auto-injects JWT Bearer token from `localStorage`
   - Global 401 interceptor for auto-logout + redirect
   - Configurable base URL via environment

3. **Client-Side JWT Decoding**
   - Extracts `role` and `email` from JWT for UI-level RBAC
   - No token verification (signature validation on backend)
   - Token expiry checked on app startup

4. **Idempotent Order Creation**
   - Auto-generates unique `Idempotency-Key` header per order
   - Prevents duplicate charges from network retries

### Frontend Project Structure

```
src/
├── api/                    # API layer (HTTP calls)
│   ├── axios.ts            # Configured Axios instance
│   ├── authApi.ts          # Login & signup endpoints
│   ├── menuApi.ts          # Menu fetch
│   ├── orderApi.ts         # Order CRUD
│   └── adminApi.ts         # Manager endpoints
│
├── store/                  # Zustand state
│   ├── authStore.ts        # Auth state & actions
│   └── cartStore.ts        # Cart state & actions
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Login/signup mutations
│   ├── useMenu.ts          # Menu query
│   ├── useOrders.ts        # Order queries & mutations
│   ├── use-mobile.tsx      # Responsive breakpoints
│   └── use-toast.ts        # Toast notifications
│
├── pages/                  # Route components
│   ├── Index.tsx           # Home page
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MenuPage.tsx
│   ├── CartPage.tsx
│   ├── OrdersPage.tsx
│   ├── OrderDetailPage.tsx
│   ├── ManagerDashboardPage.tsx
│   ├── ManagerProductsPage.tsx
│   └── NotFound.tsx
│
├── routes/                 # Route guards
│   ├── ProtectedRoute.tsx  # Requires auth
│   └── RoleProtectedRoute.tsx  # Requires role
│
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # App layout
│   ├── cart/               # Cart components
│   ├── menu/               # Menu components
│   ├── orders/             # Order components
│   ├── manager/            # Manager components
│   └── NavLink.tsx
│
├── utils/                  # Utilities
│   ├── constants.ts        # API_URL, enums, status colors
│   ├── jwt.ts              # JWT decoding
│   └── price.ts            # Price formatting
│
├── lib/
│   └── utils.ts            # Tailwind merge (cn helper)
│
├── test/                   # Testing
│   ├── setup.ts            # Vitest config
│   └── example.test.ts
│
├── App.tsx                 # Root component
├── main.tsx                # Entry point
├── index.css
└── App.css
```

### Available Scripts (Frontend)

```bash
cd coffee-order-hub-main

npm run dev          # Start dev server (Vite, port 5173)
npm run build        # Production build
npm run build:dev    # Dev build (unminified, source maps)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Run Vitest once
npm run test:watch   # Run Vitest in watch mode
```

### Environment Variables (Frontend)

| Variable       | Default                        | Description                  |
|----------------|--------------------------------|------------------------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL         |

Variables prefixed with `VITE_` are exposed to the client at build time via Vite's `import.meta.env`.

### Routing

The frontend uses **React Router v6** with role-based access control:

| Path                   | Component              | Access           |
|------------------------|------------------------|------------------|
| `/`                    | `Index`                | Public           |
| `/login`               | `LoginPage`            | Public           |
| `/signup`              | `SignupPage`           | Public           |
| `/menu`                | `MenuPage`             | Authenticated    |
| `/cart`                | `CartPage`             | Authenticated    |
| `/orders`              | `OrdersPage`           | Authenticated    |
| `/orders/:id`          | `OrderDetailPage`      | Authenticated    |
| `/manager/dashboard`   | `ManagerDashboardPage` | Manager only     |
| `/manager/products`    | `ManagerProductsPage`  | Manager only     |
| `*`                    | `NotFound`             | Public (404)     |

Route protection via:
- **`ProtectedRoute`** — Requires any authenticated user
- **`RoleProtectedRoute`** — Requires authentication + specific role

### State Management

#### Zustand Stores

**`authStore.ts`** — Authentication state
- **State:** `token`, `role`, `email`, `isAuthenticated`
- **Actions:** `login()`, `logout()`, `checkAuth()`, `setFromToken()`
- **Persistence:** Token stored in `localStorage`, hydrated on app start

**`cartStore.ts`** — Shopping cart
- **State:** `items[]` (product variations with quantity), computed totals
- **Actions:** `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`
- **Totals:** `totalCents()`, `totalItems()`, `formatted()`
- **Persistence:** In-memory (resets on page refresh)

#### React Query (Server State)

All data fetching built on TanStack React Query for:
-  Auto-caching with configurable stale times
-  Background refetching (orders every 10s customer / 15s manager)
-  Cache invalidation on mutations
-  Built-in retry logic (2 retries by default)

### Authentication & Authorization

**Auth Flow:**

1. User submits email + password to `POST /auth/token` (OAuth2 form-encoded)
2. Backend returns JWT
3. Frontend stores token in `localStorage` and decodes to extract `role` + `email`
4. Axios interceptor injects `Authorization: Bearer <token>` on every request
5. On app load, `AuthInitializer` validates token hasn't expired
6. On 401 response, interceptor clears token and redirects to `/login`

**Role-Based Access Control:**

| Role            | Accessible Routes                                         |
|-----------------|-----------------------------------------------------------|
| **Customer**    | `/menu`, `/cart`, `/orders`, `/orders/:id`               |
| **Manager**     | All customer + `/manager/dashboard`, `/manager/products` |
| **Unauthenticated** | `/`, `/login`, `/signup`                            |

### Testing (Frontend)

```bash
cd coffee-order-hub-main

# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

Uses:
- **Vitest** — Test runner (modern, Vite-native)
- **React Testing Library** — Component testing utilities
- **jsdom** — DOM environment

---

##  Backend (FastAPI)

### Backend Architecture

The backend follows a **strict 4-layer architecture** with clear boundaries:

```
┌────────────────────────────────────┐
│     API Layer (HTTP Routing)       │
│  (routers, auth, input validation) │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   Service Layer (Business Logic)  │
│  (order flow, status transitions) │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│  Repository Layer (Data Access)   │
│  (database queries via SQLAlchemy)│
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   Database (PostgreSQL + Async)   │
└────────────────────────────────────┘

External Integrations (Payment, Notifications)
- Thin HTTP wrappers only
- No business logic
- Easy to swap providers
```

**Layer Responsibilities:**

- **API Layer** — HTTP handling, input validation (Pydantic), auth enforcement, immediate delegation to services
- **Service Layer** — All business logic (order placement, status transitions, payment flows, notifications)
- **Repository Layer** — All database queries; services communicate in business terms
- **External Integrations** — Thin wrappers around payment & notification providers

This design makes services independently testable (mock repositories, no DB needed).

### Backend Project Structure

```
app/
├── api/                       # FastAPI routers
│   ├── auth.py                # Login, signup
│   ├── menu.py                # Product catalog
│   ├── orders.py              # Order CRUD
│   ├── admin.py               # Manager endpoints
│   └── __init__.py
│
├── core/                      # Core utilities
│   ├── auth.py                # JWT handling, password hashing
│   ├── security.py            # Security helpers
│   ├── logging.py             # Structured logging
│   └── __init__.py
│
├── models/                    # SQLAlchemy ORM
│   ├── user.py                # User model
│   ├── product.py             # Product & variation models
│   ├── order.py               # Order & order_item models
│   ├── payment.py             # Payment model
│   ├── notification.py        # Notification model
│   ├── idempotency.py         # Idempotency key model
│   └── __init__.py
│
├── schemas/                   # Pydantic schemas
│   ├── auth.py                # Request/response for auth
│   ├── menu.py                # Menu schemas
│   ├── order.py               # Order schemas
│   └── __init__.py
│
├── services/                  # Business logic
│   ├── order_service.py       # Order placement, status transitions
│   ├── payment_client.py      # Payment provider integration
│   ├── notification_client.py # Notification provider integration
│   └── __init__.py
│
├── repositories/              # Database queries
│   ├── user_repo.py           # User queries
│   ├── product_repo.py        # Product queries
│   ├── order_repo.py          # Order queries
│   ├── idempotency_repo.py    # Idempotency queries
│   └── __init__.py
│
├── config.py                  # Environment config
├── db.py                      # Async DB session/engine
├── main.py                    # FastAPI app entry point
└── __init__.py

scripts/
├── seed_catalog.py            # Seed products & variations
├── seed_users.py              # Seed default users
└── __pycache__/

tests/
├── unit/                      # Service & repo unit tests
├── integration/               # Full request-cycle tests
├── conftest.py                # Pytest fixtures
└── __init__.py

alembic/                        # Database migrations
├── versions/
│   └── 001_initial_schema.py
├── env.py
├── script.py.mako
└── __init__.py
```

### Database Schema

Prices are stored as **integers (cents)** throughout to avoid floating-point precision issues.

**Core Tables:**

| Table                | Purpose                                                    |
|----------------------|-----------------------------------------------------------|
| **users**            | Email, hashed password (Argon2), role (customer/manager)  |
| **products**         | Product name, base price in cents                         |
| **product_variations** | Variation (size/flavor), price delta, linked to product |
| **orders**           | Customer order, status, total in cents, timestamps        |
| **order_items**      | Line items (variation + quantity), unit price snapshotted |
| **payments**         | One-to-one with order, full request & response logged     |
| **notifications**    | One per status change, response stored for debugging       |
| **idempotency_keys** | SHA-256 hash of client key, order/payment IDs, 24h TTL   |

**Indexes:** Foreign keys, order status, `created_at` timestamps
**Constraints:** Unique on idempotency key hash

### API Endpoints

| Method | Endpoint                                              | Auth    | Description                              |
|--------|-------------------------------------------------------|---------|------------------------------------------|
| GET    | `/`                                                   | No      | Root endpoint (API info)                 |
| GET    | `/api/v1/menu`                                        | No      | Catalog (products + variations + prices) |
| POST   | `/api/v1/auth/token`                                  | No      | Login (OAuth2 form-encoded)              |
| POST   | `/api/v1/auth/signup`                                 | No      | Customer self-registration               |
| POST   | `/api/v1/orders`                                      | Customer| Place order                              |
| GET    | `/api/v1/orders/{id}`                                 | User    | Order details (customer: own only)       |
| PATCH  | `/api/v1/orders/{id}/status`                          | Manager | Update order status                      |
| GET    | `/api/v1/admin/orders`                                | Manager | List all orders                          |
| POST   | `/api/v1/admin/products`                              | Manager | Create product                           |
| PATCH  | `/api/v1/admin/products/{product_id}`                 | Manager | Update product                           |
| DELETE | `/api/v1/admin/products/{product_id}`                 | Manager | Delete product                           |
| PATCH  | `/api/v1/admin/products/{product_id}/variations/{vid}`| Manager | Update variation                         |
| DELETE | `/api/v1/admin/products/{product_id}/variations/{vid}`| Manager | Delete variation                         |
| POST   | `/api/v1/admin/managers`                              | Manager | Create manager account                   |

Interactive API docs available at `http://localhost:8000/docs` (Swagger UI)

### Order Status Flow

Orders transition through a **strict, linear sequence** with no skipping or reversals:

```
waiting → preparation → ready → delivered
```

Valid transitions enforced server-side with 400 error on invalid transitions.

### Idempotency

**Purpose:** Prevent duplicate orders and charges from network retries or client uncertainty.

**Implementation:**

1. Client includes optional `Idempotency-Key` header with order creation request
2. Server hashes the key (SHA-256) and checks database
3. **First request:** Process order & payment normally, store key + result, return `201 Created`
4. **Retry with same key:** Return stored result with `200 OK`
5. **No key:** Every request treated as new order

**Benefits:**
- Safe to retry failed requests without double-charging
- Handles network timeouts gracefully
- Improves client UX (no errors on uncertain retries)

### Payment & Notifications

**Payment Flow:**
- On `POST /orders`, call `PAYMENT_SERVICE_URL` with `{"value": total_cents}`
- Order created **only if payment succeeds (2xx)**
- Full response logged (secrets redacted) and stored in `payments.response_payload`
- On failure, return **402 Payment Required** with provider response

**Notification Flow:**
- On successful status change (`PATCH /orders/{id}/status`), post to `NOTIFICATION_SERVICE_URL`
- Response logged and stored in `notifications` table
- **Notification failure does NOT revert order** — logged for manual retry/debugging

**Concurrency Safety:**
- Status updates use `SELECT ... FOR UPDATE` row lock
- Ensures strict ordering of transitions, no race conditions

### Environment Variables (Backend)

| Variable                          | Description                          | Default                                    |
|-----------------------------------|--------------------------------------|--------------------------------------------|
| `DATABASE_URL`                    | Postgres URL (async: `postgresql+asyncpg://...`) | `postgresql+asyncpg://coffee_user:coffee_pass@localhost:5432/coffee_shop` |
| `JWT_SECRET_KEY`                  | JWT signing secret (min 32 chars)    | _(must be set in production)_              |
| `JWT_ALGORITHM`                   | JWT algorithm                        | `HS256`                                    |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (minutes)               | `30`                                       |
| `PAYMENT_SERVICE_URL`             | External payment service endpoint    | `https://challenge.trio.dev/api/v1/payment`|
| `NOTIFICATION_SERVICE_URL`        | External notification endpoint       | `https://challenge.trio.dev/api/v1/notification` |
| `APP_ENV`                         | Environment name                    | `development`                              |
| `LOG_LEVEL`                       | Logging level                       | `INFO`                                     |
| `API_PREFIX`                      | API path prefix                     | `/api/v1`                                  |

### Testing (Backend)

```bash
cd coffee-store-backend

# Setup test database
createdb coffee_shop_test

# Run migrations on test DB
export DATABASE_URL="postgresql+asyncpg://coffee_user:coffee_pass@localhost:5432/coffee_shop_test"
export JWT_SECRET_KEY=test-secret
alembic upgrade head

# Run all tests
pytest tests -v

# Run with coverage
pytest --cov=. --cov-report=term-missing
```

**Test Coverage:**
- Unit tests for services and repositories (mocked DB)
- Integration tests for full request cycles (mocked payment/notification)
- Test fixtures in `conftest.py`

---

##  Development Workflow

### Starting Both Services Locally

**Option 1: With Docker (Recommended)**

```bash
# Terminal 1: Start backend + database
cd coffee-store-backend
docker compose up --build

# Terminal 2: Run migrations (one-off)
docker compose --profile tools run --rm migrate

# Terminal 3: Start frontend
cd coffee-order-hub-main
npm install
npm run dev
```

**Option 2: Manual Setup**

```bash
# Terminal 1: Backend
cd coffee-store-backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd coffee-order-hub-main
npm run dev
```

### Making API Calls

**Interactive Docs (Swagger UI):**
```
http://localhost:8000/docs
```

**Example cURL for Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=customer@example.com&password=customer123"
```

### Database Migrations

When making schema changes:

```bash
cd coffee-store-backend

# Auto-generate migration
alembic revision --autogenerate -m "describe your change"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

### Code Style & Linting

**Frontend:**
```bash
cd coffee-order-hub-main
npm run lint          # Check for issues
npm run lint --fix    # Auto-fix issues
```

**Backend:**
```bash
cd coffee-store-backend
# Configure your IDE to use black, isort, flake8
# or run manually:
black app tests
isort app tests
flake8 app tests
```

---

## Troubleshooting

### Frontend Issues

**Port Already in Use:**
```bash
# Change Vite dev port
npm run dev -- --port 3000
```

**API Connection Errors:**
- Verify backend is running: `http://localhost:8000/docs`
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

**Login/Auth Issues:**
- Clear browser `localStorage`: F12 → Application → Storage → localStorage → Clear
- Check token in `localStorage` is valid JWT
- Verify backend JWT_SECRET_KEY is set

### Backend Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
psql -U coffee_user -d coffee_shop -c "SELECT 1;"

# Recreate DB if needed
dropdb coffee_shop
createdb -O coffee_user coffee_shop
alembic upgrade head
```

**Migration Errors:**
```bash
# Downgrade to previous migration
alembic downgrade -1

# Check current revision
alembic current
```

**Port 8000 Already in Use:**
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

**Docker Issues:**

**"no configuration file provided: not found"**
```bash
# This error means you're not in the coffee-store-backend directory
# Solution: Always run docker compose from the backend directory
cd coffee-store-backend

# Then run your docker compose command
docker compose --profile tools run --rm migrate
```

**General Docker troubleshooting:**
```bash
# Make sure you're in coffee-store-backend directory
cd coffee-store-backend

# Rebuild containers
docker compose down
docker compose up --build -d

# Check logs
docker compose logs app      # FastAPI logs
docker compose logs db       # PostgreSQL logs
docker compose logs -f app   # Follow app logs in real-time

# Restart services
docker compose restart

# Remove all containers and volumes (fresh start)
docker compose down -v
docker compose up --build -d
```

**Database not ready:**
```bash
# If migrations fail, wait for database to be healthy
docker compose logs db | grep "database system is ready"

# If needed, manually wait and retry
sleep 15
docker compose --profile tools run --rm migrate
```

---

##  Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes with clear commits
4. **Test** your changes (run `npm run test` for frontend, `pytest` for backend)
5. **Lint** your code (`npm run lint` for frontend)
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request with a clear description

### Commit Message Format

```
type(scope): brief description

Optional longer explanation of the change.

Fixes #issue-number
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

##  License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

##  Additional Resources

- **Frontend README:** See [coffee-order-hub-main/README.md](./coffee-order-hub-main/README.md) for frontend-specific documentation
- **Backend README:** See [coffee-store-backend/README.md](./coffee-store-backend/README.md) for backend-specific documentation
- **FastAPI Docs:** [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **React Docs:** [https://react.dev](https://react.dev)
- **Vite Docs:** [https://vitejs.dev](https://vitejs.dev)
- **SQLAlchemy Docs:** [https://docs.sqlalchemy.org](https://docs.sqlalchemy.org)

---

