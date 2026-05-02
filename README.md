# 🛒 E-Commerce Backend Engine

A robust, secure, and fully optimized backend API for an e-commerce platform. Built with Node.js, Express, and Prisma ORM, this engine handles complex cart calculations, secure checkout transactions, and order history with historical snapshotting.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **ORM:** Prisma
* **Database:** PostgreSQL / MySQL *(Configure in `.env`)*

## Key Features

### 1. Amazon-Style Smart Shipping Logic
* Implements a "Max Fee" flat-rate shipping model (items ship together).
* Automatically waives shipping fees for carts totaling over $40.00.

### 2. Bulletproof Checkout Security
* **Never Trusts the Frontend:** Final prices are strictly recalculated on the server at the exact moment of checkout using a dedicated utility function (`utils/calculateTotals.js`).
* Prevents payload tampering and ensures 100% mathematical accuracy before touching the database.

### 3. Historical Integrity (Snapshotting)
* Order receipts do not rely on live product or shipping menus. 
* Prices and estimated delivery dates are permanently "snapshotted" into the `OrderItem` table at checkout. If a product price or shipping speed changes next year, historical order receipts remain perfectly accurate.

### 4. Optimized Database Transactions
* Eliminates N+1 query problems.
* Utilizes Prisma `$transaction` and nested writes to build complex orders and securely burn the user's cart in a single, lightning-fast database operation.

---

##  Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository and install dependencies:

        npm install

2. Set up your environment variables:
   Create a `.env` file in the root directory and add your database connection string:

        DATABASE_URL="your_database_connection_string_here"
        PORT=3000

3. Sync the database schema:

        npx prisma migrate dev --name init

4. Start the development server:

        npm run dev

---

##  API Endpoints

### Cart & Checkout
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/cart/:cartId/summary` | Returns a secure math preview of the cart (Subtotal, Taxes, Dynamic Shipping). |
| `POST` | `/api/orders` | The Checkout Route. Securely calculates totals, processes the database transaction, and deletes the active cart. Expects `{ "cartId": "uuid" }`. |

### Order History
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/orders` | Retrieves a list of all historical orders, sorted by newest first. Includes hydrated product data. |
| `GET` | `/api/orders/:orderId` | Retrieves a specific, detailed order receipt including exact delivery dates and historical prices. |

---

## Database Schema Overview

The database is mapped using Prisma and consists of the following core models:

* **Product:** The catalog items (Name, Image, Live Price).
* **DeliveryOption:** The shipping speeds available (e.g., Standard, Express).
* **Cart & CartItem:** Temporary storage for active shopping sessions.
* **Order & OrderItem:** Permanent, unalterable historical records of completed checkouts. 

---
