# Coffee Order Hub — Frontend

A single-page application for a coffee shop ordering system built with **React 18**, **TypeScript**, and **Vite**. The app supports two user roles — **Customer** and **Manager** — each with distinct views and capabilities, all secured behind JWT-based authentication with role-based access control (RBAC).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Authentication & Authorization](#authentication--authorization)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Routing](#routing)
- [Testing](#testing)

---

## Features

### Customer Facing
- **Account Registration** — Self-service signup with email and password
- **Menu Browsing** — View all available coffee products and their size/variation options
- **Shopping Cart** — Add items with quantity management, real-time price calculation, persistent cart state
- **Order Placement** — Submit orders with idempotency-key support to prevent duplicate submissions
- **Order Tracking** — View order history and real-time status updates (waiting → preparation → ready → delivered) with automatic polling every 10 seconds

### Manager Dashboard
- **Order Management** — View all customer orders across the system with 15-second auto-refresh, update order statuses through the workflow
- **Product Management (CRUD)** — Create, update, and delete products and their variations (sizes, flavors) with price adjustments
- **Manager Account Creation** — Create additional manager accounts (manager-only privilege)

---

## Tech Stack

| Category            | Technology                                                                 |
|---------------------|---------------------------------------------------------------------------|
| **Framework**       | React 18 with TypeScript                                                   |
| **Build Tool**      | Vite 5 (with SWC for fast compilation via `@vitejs/plugin-react-swc`)      |
| **Styling**         | Tailwind CSS 3 with custom coffee-themed design tokens                     |
| **UI Components**   | shadcn/ui (built on Radix UI primitives)                                   |
| **State Management**| Zustand (auth store, cart store)                                           |
| **Server State**    | TanStack React Query (data fetching, caching, mutations)                   |
| **HTTP Client**     | Axios (with request/response interceptors for auth token injection)        |
| **Routing**         | React Router DOM v6                                                        |
| **Form Handling**   | React Hook Form + Zod schema validation                                    |
| **Notifications**   | Sonner toast + shadcn/ui Toaster                                           |
| **Charts**          | Recharts (used in manager dashboard)                                       |
| **Testing**         | Vitest + React Testing Library + jsdom                                     |

---

## Project Structure

```
src/
├── api/                    # API layer — all HTTP calls to the backend
│   ├── axios.ts            # Axios instance with base URL, auth interceptor, 401 redirect
│   ├── authApi.ts          # Login (OAuth2 form-encoded) and signup endpoints
│   ├── menuApi.ts          # GET /menu — fetch all products with variations
│   ├── orderApi.ts         # Create, fetch, update order status
│   └── adminApi.ts         # Manager-only: all orders, CRUD products/variations, create managers
│
├── store/                  # Zustand state stores
│   ├── authStore.ts        # Auth state: token, role, email, login/logout/checkAuth actions
│   └── cartStore.ts        # Cart state: items, quantities, add/remove/clear, totals
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # useLogin(), useSignup() — React Query mutations with nav + toast
│   ├── useMenu.ts          # useMenu() — React Query wrapper for menu fetch
│   ├── useOrders.ts        # useOrder(), useAllOrders(), useCreateOrder(), useUpdateOrderStatus(), useCreateManager()
│   ├── use-mobile.tsx      # Responsive breakpoint detection
│   └── use-toast.ts        # Toast notification hook (shadcn/ui)
│
├── pages/                  # Route-level page components
│   ├── Index.tsx            # Landing / home page
│   ├── LoginPage.tsx        # Login form (email + password → OAuth2 token)
│   ├── SignupPage.tsx       # Customer self-registration form
│   ├── MenuPage.tsx         # Product catalog with add-to-cart functionality
│   ├── CartPage.tsx         # Cart review, quantity editing, checkout
│   ├── OrdersPage.tsx       # Customer order history list
│   ├── OrderDetailPage.tsx  # Single order detail with live status tracking
│   ├── ManagerDashboardPage.tsx  # Manager dashboard — all orders overview
│   ├── ManagerProductsPage.tsx   # Manager product/variation CRUD interface
│   └── NotFound.tsx         # 404 fallback page
│
├── routes/                 # Route guard components
│   ├── ProtectedRoute.tsx       # Redirects unauthenticated users to /login
│   └── RoleProtectedRoute.tsx   # Restricts access by role (e.g., manager-only routes)
│
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui primitives (button, dialog, input, toast, etc.)
│   ├── layout/             # App layout wrapper (header, navigation)
│   ├── cart/               # Cart-specific components
│   ├── menu/               # Menu display components
│   ├── orders/             # Order list and detail components
│   ├── manager/            # Manager dashboard components
│   └── NavLink.tsx         # Navigation link component
│
├── utils/                  # Utility functions and constants
│   ├── constants.ts        # API_URL, order status enums, status labels/colors
│   ├── jwt.ts              # JWT decoding (base64) and expiration checking
│   └── price.ts            # Price formatting utilities (cents → display)
│
├── lib/                    # Library utilities
│   └── utils.ts            # cn() helper — Tailwind class merging (clsx + tailwind-merge)
│
├── test/                   # Test configuration
│   ├── setup.ts            # Vitest global setup
│   └── example.test.ts     # Example test file
│
├── App.tsx                 # Root component — providers, router, route definitions
├── main.tsx                # Application entry point — renders App into DOM
├── index.css               # Global styles and Tailwind directives
└── App.css                 # App-level styles
```

---

## Architecture Overview

The application follows a **layered architecture** with clear separation of concerns:

```
┌──────────────────────────────────────────────────────┐
│                    Pages (Route Views)                 │
├──────────────────────────────────────────────────────┤
│              Components (Presentational)              │
├──────────────────────────────────────────────────────┤
│     Hooks (useAuth, useOrders, useMenu)               │
│     ┌─────────────────┐  ┌─────────────────────┐     │
│     │  React Query     │  │  Zustand Stores     │     │
│     │  (server state)  │  │  (client state)     │     │
│     └────────┬─────────┘  └─────────────────────┘     │
├──────────────┼───────────────────────────────────────┤
│         API Layer (Axios)                             │
│         ├── Auth interceptor (Bearer token injection) │
│         └── 401 interceptor (auto-logout + redirect)  │
├──────────────────────────────────────────────────────┤
│              Backend REST API                         │
│              (http://localhost:8000/api/v1)            │
└──────────────────────────────────────────────────────┘
```

**Key design decisions:**

1. **Dual state management** — Zustand handles synchronous client state (auth tokens, cart contents) while React Query manages async server state (menu data, orders) with automatic caching, background refetching, and cache invalidation on mutations.

2. **Centralized Axios instance** — A single Axios instance (`src/api/axios.ts`) configures the base URL, auto-injects the JWT Bearer token from `localStorage` on every request, and globally intercepts 401 responses to clear the token and redirect to login.

3. **Client-side JWT decoding** — The auth store decodes the JWT payload (base64, no verification) to extract `role` and `email` for UI-level RBAC decisions. Actual authorization is enforced server-side.

4. **Idempotent order creation** — The `createOrder` function generates a unique `Idempotency-Key` header per request to prevent duplicate orders from network retries.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** ≥ 9.x (bundled with Node.js)
- **Backend API** running at `http://localhost:8000` (or configure via `VITE_API_URL`)

### Installation & Running

```bash
# 1. Clone the repository
git clone <repository-url>
cd coffee-order-hub

# 2. Install dependencies
npm install

# 3. (Optional) Configure the backend API URL
#    Create a .env file if the backend is not at http://localhost:8000/api/v1
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env

# 4. Start the development server
npm run dev
```

The dev server starts on **http://localhost:8080** with hot module replacement (HMR) enabled.

---

## Environment Variables

| Variable       | Default                            | Description                          |
|----------------|------------------------------------|--------------------------------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1`     | Base URL of the backend REST API     |

Environment variables prefixed with `VITE_` are exposed to the client bundle at build time via Vite's `import.meta.env`.

---

## Available Scripts

| Command            | Description                                               |
|--------------------|-----------------------------------------------------------|
| `npm run dev`      | Start the Vite dev server with HMR on port 8080           |
| `npm run build`    | Create a production build in `dist/`                      |
| `npm run build:dev`| Create a development build (unminified, with source maps) |
| `npm run preview`  | Serve the production build locally for testing            |
| `npm run lint`     | Run ESLint across the project                             |
| `npm run test`     | Run the test suite once via Vitest                        |
| `npm run test:watch` | Run Vitest in watch mode                                |

---

## Authentication & Authorization

The app uses **JWT (JSON Web Token)** authentication with an **OAuth2-compatible** token endpoint.

### Auth Flow

1. **Login** — User submits email + password via `POST /auth/token` (form-encoded, OAuth2 format). The backend returns an `access_token`.
2. **Token Storage** — The JWT is stored in `localStorage` and the Zustand `authStore` decodes it client-side to extract `role` (customer/manager) and `email`.
3. **Request Auth** — The Axios interceptor automatically attaches `Authorization: Bearer <token>` to every API request.
4. **Session Validation** — On app load, `AuthInitializer` component calls `checkAuth()` to verify the stored token hasn't expired.
5. **Auto-Logout** — If any API call returns a `401 Unauthorized`, the response interceptor clears the token and redirects to `/login`.

### Role-Based Access Control

| Role       | Accessible Routes                                                   |
|------------|---------------------------------------------------------------------|
| **Customer** | `/menu`, `/cart`, `/orders`, `/orders/:id`                        |
| **Manager**  | All customer routes + `/manager/dashboard`, `/manager/products`   |
| *Unauthenticated* | `/`, `/login`, `/signup`                                   |

Route protection is implemented via two guard components:
- `ProtectedRoute` — requires any authenticated user
- `RoleProtectedRoute` — requires authentication **and** a specific role (e.g., `manager`)

---

## API Integration

All API communication goes through a centralized Axios instance configured in `src/api/axios.ts`. The API layer is organized into domain-specific modules:

| Module         | Endpoints                                                                                    |
|----------------|----------------------------------------------------------------------------------------------|
| `authApi.ts`   | `POST /auth/token` (login), `POST /auth/signup` (register)                                  |
| `menuApi.ts`   | `GET /menu` (fetch product catalog)                                                          |
| `orderApi.ts`  | `POST /orders`, `GET /orders/:id`, `PATCH /orders/:id/status`                                |
| `adminApi.ts`  | `GET /admin/orders`, `POST /admin/managers`, `POST /admin/products`, `PATCH /admin/products/:id`, `DELETE /admin/products/:id`, `PATCH /admin/products/:id/variations/:vid`, `DELETE /admin/products/:id/variations/:vid` |

Each API module exports typed functions with proper TypeScript interfaces for request/response payloads, ensuring type safety across the entire data flow.

---

## State Management

### Zustand Stores (Client State)

- **`authStore`** — Manages authentication state (`token`, `role`, `email`, `isAuthenticated`). Provides `login()`, `logout()`, and `checkAuth()` actions. The token is persisted in `localStorage` and the store is re-hydrated on app initialization.

- **`cartStore`** — Manages the shopping cart with `items[]`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, and computed getters `totalCents()` / `totalItems()`. Cart is kept in-memory (resets on page refresh).

### React Query (Server State)

All data-fetching hooks are built on TanStack React Query:

- Auto-caching with configurable stale times
- Background refetching — orders auto-refresh every **10s** (customer) / **15s** (manager)
- Cache invalidation on mutations — e.g., placing an order invalidates the admin orders list
- Built-in retry logic (2 retries by default)

---

## Routing

The app uses **React Router v6** with the following route configuration:

| Path                   | Component              | Access            |
|------------------------|------------------------|-------------------|
| `/`                    | `Index`                | Public            |
| `/login`               | `LoginPage`            | Public            |
| `/signup`              | `SignupPage`           | Public            |
| `/menu`                | `MenuPage`             | Authenticated     |
| `/cart`                | `CartPage`             | Authenticated     |
| `/orders`              | `OrdersPage`           | Authenticated     |
| `/orders/:id`          | `OrderDetailPage`      | Authenticated     |
| `/manager/dashboard`   | `ManagerDashboardPage` | Manager only      |
| `/manager/products`    | `ManagerProductsPage`  | Manager only      |
| `*`                    | `NotFound`             | Public (404)      |

---

## Testing

The project uses **Vitest** as the test runner with **React Testing Library** and **jsdom** as the DOM environment.

```bash
# Run all tests once
npm run test

# Run tests in watch mode during development
npm run test:watch
```

Test files are co-located in `src/test/` with a global setup in `src/test/setup.ts`.
