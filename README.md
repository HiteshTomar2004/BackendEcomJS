# E-Commerce Backend API

## Note:
The frontend code for this library lies in: https://github.com/HiteshTomar2004/React-ecommerce-frontend/tree/main/ecommerce-project

A Node.js, Express, Prisma, and SQLite backend for an e-commerce application. The API supports product catalog browsing, delivery options, guest and authenticated carts, secure checkout calculations, order history, and cookie-based authentication.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database and Seeding](#database-and-seeding)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Checkout Rules](#checkout-rules)
- [Database Models](#database-models)
- [Development Notes](#development-notes)

## Features

- Product catalog with keyword and name search.
- Delivery option API with optional estimated delivery timestamps.
- Guest cart support.
- User registration, login, logout, and logout from all devices.
- Cookie-based JWT sessions using HTTP-only cookies.
- Guest cart attachment when a user registers or logs in.
- Protected order routes for authenticated order history.
- Server-side cart summary and checkout totals.
- Prisma relational data modeling for products, carts, users, and orders.
- Static image serving from the `images` directory.

## Tech Stack

- Runtime: Node.js
- Framework: Express.js
- ORM: Prisma
- Database: SQLite through `better-sqlite3`
- Authentication: JSON Web Tokens and bcrypt
- Cookies: `cookie-parser`
- CORS: configured for `http://localhost:5173`

## Project Structure

```text
src/
  config/
    db.js
  controllers/
    auth.js
    cart.js
    deliveryOptions.js
    orders.js
    products.js
  middleware/
    authMiddleware.js
  routes/
    auth.js
    cart.js
    deliveryOptions.js
    orders.js
    products.js
  utils/
    calculateTotals.js
  server.js

prisma/
  migrations/
  schema.prisma
  seed.js

backend-data/
default-Data/
images/
postman/
```

## Getting Started

### Prerequisites

Install Node.js and npm.

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
JWT_SECRET="replace_with_a_long_random_secret"
NODE_ENV="development"
REQUIRE_AUTH="true"
CLIENT_ORIGIN="http://localhost:5173"
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Seed products and delivery options:

```bash
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | No | `file:./prisma/dev.db` | SQLite database location used by Prisma and the SQLite adapter. |
| `PORT` | No | `3000` | Port used by the Express server. |
| `JWT_SECRET` | Yes | None | Secret used to sign and verify JWT session cookies. |
| `NODE_ENV` | No | None | Use `development` locally. Cookies are marked secure when this is not `development`. |
| `REQUIRE_AUTH` | No | `true` behavior | Set to `false` to bypass protected auth middleware during local testing. |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Frontend origin allowed by CORS when sending cookies. |

## Database and Seeding

The Prisma schema uses SQLite. The database file is created from `DATABASE_URL`.

Useful commands:

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

The seed script loads:

- Products from `default-Data/defaultProducts.js`
- Delivery options from `backend-data/deliveryOptions.json`

## Authentication

Authentication is handled through JWTs stored in an HTTP-only cookie named `jwt`.

### Session Flow

1. `POST /api/auth/register` creates a user, hashes the password with bcrypt, optionally attaches a guest cart, and sets the `jwt` cookie.
2. `POST /api/auth/login` verifies credentials, optionally attaches a guest cart, and sets the `jwt` cookie.
3. `POST /api/auth/logout` clears the current browser cookie.
4. `POST /api/auth/logout-all` increments the user's `tokenVersion`, invalidating existing tokens across devices.

### Guest Cart Attachment

Both register and login accept an optional `guestCartId`. If the cart exists and is not already owned by another user, it is attached to the authenticated user.

Example:

```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "guestCartId": "cart-uuid"
}
```

### Auth Middleware

- `protect` requires a valid `jwt` cookie and checks the token version against the current user.
- `optionalAuth` reads a valid cookie when present, but still allows guest requests.
- Order routes use `protect`.
- Cart routes use `optionalAuth`.

When calling the API from a frontend, send requests with credentials enabled so the cookie is included.

```js
fetch("http://localhost:3000/api/orders", {
  credentials: "include"
});
```

## API Reference

### Health

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Basic server health response. |
| `GET` | `/api/status` | API status response. |

### Auth

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Creates a user, sets the session cookie, and can attach a guest cart. |
| `POST` | `/api/auth/login` | Public | Logs in a user, sets the session cookie, and can attach a guest cart. |
| `POST` | `/api/auth/logout` | Public | Clears the current session cookie. |
| `POST` | `/api/auth/logout-all` | Required | Invalidates all existing sessions for the current user. |

Register request:

```json
{
  "name": "Hitesh",
  "email": "hitesh@example.com",
  "password": "secure-password",
  "guestCartId": "optional-cart-id"
}
```

Login request:

```json
{
  "email": "hitesh@example.com",
  "password": "secure-password",
  "guestCartId": "optional-cart-id"
}
```

Successful auth response:

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "name": "Hitesh",
    "email": "hitesh@example.com"
  }
}
```

### Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Returns all products. Supports `?search=value` for name and keyword filtering. |
| `POST` | `/api/products` | Creates a product. |

Create product request:

```json
{
  "image": "images/products/example.jpg",
  "name": "Example Product",
  "rating": {
    "stars": 4.5,
    "count": 87
  },
  "priceCents": 1999,
  "keywords": ["example", "product"]
}
```

### Delivery Options

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/deliveryOptions` | Returns delivery options. |
| `GET` | `/api/deliveryOptions?expand=estimatedDeliveryTime` | Includes `estimatedDeliveryTimeMs` for each delivery option. |

### Cart

Cart routes allow guest usage. If a valid session cookie is present, the cart can be associated with the logged-in user.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart/:cartId` | Optional | Returns a cart with product and delivery option details. |
| `POST` | `/api/cart` | Optional | Adds a product to an existing cart or creates a new cart. |
| `PUT` | `/api/cart/:cartId/items/:productId` | Optional | Updates item quantity. If quantity is `0` or less, the item is removed. |
| `DELETE` | `/api/cart/:cartId/items/:productId` | Optional | Removes one product from the cart. |
| `GET` | `/api/cart/:cartId/summary` | Optional | Returns server-calculated totals for the cart. |

Add to cart request:

```json
{
  "cartId": "optional-existing-cart-id",
  "productId": "product-id",
  "quantity": 2,
  "deliveryOptionId": "1"
}
```

If `cartId` is omitted, the API creates a cart. The response includes the generated `cartId`.

Update cart item request:

```json
{
  "quantity": 3
}
```

### Orders

Order routes require authentication unless `REQUIRE_AUTH=false` is set for local testing.

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Required | Places an order from a cart, recalculates totals, creates order records, and deletes the cart. |
| `GET` | `/api/orders` | Required | Returns order history for the logged-in user. |
| `GET` | `/api/orders/:orderId` | Required | Returns one order by ID. |

Place order request:

```json
{
  "cartId": "cart-id"
}
```

## Checkout Rules

Checkout totals are calculated on the server in `src/utils/calculateTotals.js`.

Current rules:

- Product cost is calculated from database product prices, not frontend totals.
- Shipping uses the highest selected delivery option price across cart items.
- Shipping is free when product cost is at least `3999` cents.
- Tax is `10%` of product cost plus shipping.
- Final total is product cost plus shipping plus tax.

## Database Models

### User

Stores login identity, hashed password, token version, and relations to carts and orders.

### Product

Stores catalog data, rating fields, image path, current price, keywords, cart items, and order items.

### Keyword

Stores searchable product keywords.

### DeliveryOption

Stores shipping speed and price.

### Cart and CartItem

Stores active shopping sessions. A cart may belong to a user or remain anonymous as a guest cart.

### Order and OrderItem

Stores completed checkout records. Orders can belong to a user and contain purchased product references, quantities, and estimated delivery dates.

## Development Notes

- The API serves static files from `/images`.
- CORS allows `CLIENT_ORIGIN` with credentials enabled.
- Use `credentials: "include"` on frontend requests that need login state.
- Keep `JWT_SECRET` private and use a strong value outside local development.
- The `postman` directory contains request definitions that can help with manual testing.
- `src/controllers/orders.js` currently filters the order list by the logged-in user. The single-order route fetches by order ID, so add an ownership check there before exposing this API beyond local development.
