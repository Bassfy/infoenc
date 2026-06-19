# LED Profile Decorations — E-Commerce Platform

A full-stack e-commerce platform for architectural LED aluminum profiles and linear lighting.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) + bcrypt |
| State | Zustand (cart + wishlist, persisted to localStorage) |
| Payments | Stripe + PayPal + Cash on Delivery |

## Features

- Cinematic hero, featured products, shop by application/profile type
- Advanced 5-step product configurator with live wattage + pricing
- Cart, wishlist, checkout (multi-step wizard)
- Product gallery with masonry layout and lightbox
- Admin dashboard with Recharts analytics
- JWT authentication (register/login/refresh)
- Coupon validation, free-shipping threshold, tax calculation
- PostgreSQL schema with full-text search, UUID keys, triggers

## Quick Start

### Option A — Docker (recommended, includes PostgreSQL)

```bash
docker-compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Option B — Manual

#### 1. Database (PostgreSQL)

**Mac / Linux / WSL:**
```bash
psql -U postgres -c "CREATE DATABASE ledprofiledecorations;"
psql -U postgres -d ledprofiledecorations -f database/schema.sql
```

**Windows PowerShell** (use `Get-Content` — PowerShell does not support `<` redirection):
```powershell
Get-Content database\schema.sql | psql -U postgres -d ledprofiledecorations
```

#### 2. Backend

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run dev
```

#### 3. Frontend

```bash
cd frontend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

## Project Structure

```
infoenc/
├── docker-compose.yml
├── database/
│   └── schema.sql              # PostgreSQL schema + seed data
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/database.js  # PostgreSQL (pg) connection
│       ├── middleware/          # Auth (JWT), validation
│       ├── data/products.js    # Mock product data
│       └── routes/             # products, orders, auth, coupons…
└── frontend/
    ├── app/                    # Next.js App Router pages
    │   ├── page.tsx            # Homepage
    │   ├── shop/               # Shop listing + product detail
    │   ├── cart/               # Cart page
    │   ├── wishlist/           # Wishlist page
    │   ├── checkout/           # 3-step checkout
    │   ├── configurator/       # Product configurator
    │   ├── gallery/            # Project gallery
    │   ├── auth/               # Login + register
    │   └── admin/              # Admin dashboard
    ├── components/
    │   ├── home/               # Hero, FeaturedProducts, Gallery…
    │   ├── layout/             # Header, Footer
    │   └── shop/               # ProductCard, CartDrawer
    ├── lib/                    # types.ts, utils.ts, constants.ts
    └── store/                  # cartStore.ts, wishlistStore.ts
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (firstName, lastName, email, password) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List (filter by category, price, search, sort, paginate) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | List orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Order detail |
| PUT | `/api/orders/:id/status` | Update order status |

### Coupons
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/coupons/validate` | Validate coupon code |
| GET | `/api/coupons` | List coupons (admin) |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reviews` | List reviews (filter by productId) |
| POST | `/api/reviews` | Submit review |
| POST | `/api/reviews/:id/helpful` | Mark review helpful |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required configuration.

### Key backend variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/ledprofiledecorations
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
```
