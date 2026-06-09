# AppFinancas — Backend

REST API for personal finance management. Handles user authentication, transaction tracking, categories, and payment methods.

---

## Tech Stack

| Technology | Version |
|---|---|
| Node.js | 20 (LTS) |
| Express | ^5.2.1 |
| Prisma ORM | ^7.8.0 |
| @prisma/adapter-mariadb | ^7.8.0 |
| mariadb (connector) | ^3.5.2 |
| bcryptjs | ^3.0.3 |
| jsonwebtoken | ^9.0.3 |
| dotenv | ^17.4.2 |
| nodemon (dev) | ^3.1.14 |

---

## Architecture

```
backend/
├── src/
│   ├── app.js                      # Express entry point, route registration
│   ├── lib/
│   │   └── prisma.js               # Centralized Prisma Client instance
│   ├── controllers/
│   │   ├── authController.js       # register, login
│   │   ├── transactionController.js# create, list, update, remove
│   │   ├── categoryController.js   # list, create
│   │   └── paymentMethodController.js # list, create
│   ├── middlewares/
│   │   └── auth.js                 # JWT verification middleware
│   └── routes/
│       ├── auth.js
│       ├── transactions.js
│       ├── categories.js
│       └── paymentMethods.js
├── prisma/
│   ├── schema.prisma               # Data models
│   └── seed.js                     # Default categories and payment methods
├── prisma.config.ts                # Prisma v7 configuration with MariaDB adapter
├── Dockerfile
└── .env
```

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- A running MySQL instance accessible from the container
- A `.env` file inside `backend/` (see [Environment Variables](#environment-variables))

---

## Running with Docker

From the **project root** (`AppFinancas/`):

```bash
# Build and start the backend container
docker-compose up --build

# Run in detached mode
docker-compose up --build -d

# Stop
docker-compose down
```

The API will be available at `http://localhost:3000/api`.

### Running locally (without Docker)

```bash
cd backend
npm install

# Run database migrations
npm run migrate

# Seed default categories and payment methods
npm run seed

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

---

## Environment Variables

Create a `backend/.env` file based on the following template (do not use real values here):

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3000
JWT_SECRET=your_secret_key_here
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | Port the server listens on (default: 3000) |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |

---

## API Endpoints

All routes are prefixed with `/api`.

### Authentication

#### `POST /api/auth/register`

Registers a new user. No authentication required.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response `400`** — e-mail already registered.

---

#### `POST /api/auth/login`

Authenticates a user and returns a JWT valid for 7 days.

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response `401`** — invalid credentials.

---

### Transactions

All transaction routes require `Authorization: Bearer <token>`.

#### `POST /api/transactions`

Creates a transaction for the authenticated user.

**Request body:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "description": "Supermarket",
  "categoryId": 1,
  "amount": 150.00,
  "status": "Pago",
  "paymentMethodId": 3,
  "notes": "Weekly grocery run"
}
```

> `paymentMethodId` and `notes` are optional.  
> `status` accepted values: `"Pago"`, `"Recebido"`, `"Pendente"`.

**Response `201`:** Transaction object including `category` and `paymentMethod` relations.

---

#### `GET /api/transactions`

Lists all transactions of the authenticated user, ordered by `date` descending. Includes `category` and `paymentMethod`.

**Response `200`:**
```json
[
  {
    "id": 1,
    "userId": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "description": "Supermarket",
    "amount": "150.00",
    "status": "Pago",
    "notes": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "category": { "id": 1, "name": "Alimentação", "isDefault": true },
    "paymentMethod": { "id": 3, "name": "Cartão de Débito" }
  }
]
```

---

#### `PUT /api/transactions/:id`

Updates a transaction. Only the owner can update. All fields are optional (partial update).

**Request body** (any subset of):
```json
{
  "date": "2024-01-16T00:00:00.000Z",
  "description": "Updated description",
  "categoryId": 2,
  "amount": 200.00,
  "status": "Pendente",
  "paymentMethodId": 1,
  "notes": "Updated note"
}
```

**Response `200`:** Updated transaction object.  
**Response `404`** — transaction not found or not owned by user.

---

#### `DELETE /api/transactions/:id`

Deletes a transaction. Only the owner can delete.

**Response `204`** — no content.  
**Response `404`** — transaction not found or not owned by user.

---

### Categories

All category routes require `Authorization: Bearer <token>`.

#### `GET /api/categories`

Returns all categories ordered by name.

**Response `200`:**
```json
[
  { "id": 1, "name": "Água", "isDefault": true },
  { "id": 2, "name": "Alimentação", "isDefault": true }
]
```

---

#### `POST /api/categories`

Creates a new category.

**Request body:**
```json
{
  "name": "Investimentos",
  "isDefault": false
}
```

> `isDefault` is optional, defaults to `false`.

**Response `201`:** Created category object.  
**Response `400`** — category name already exists.

---

### Payment Methods

All payment method routes require `Authorization: Bearer <token>`.

#### `GET /api/payment-methods`

Returns all payment methods ordered by name.

**Response `200`:**
```json
[
  { "id": 1, "name": "Alelo" },
  { "id": 2, "name": "Cartão de Crédito" }
]
```

---

#### `POST /api/payment-methods`

Creates a new payment method.

**Request body:**
```json
{
  "name": "Nubank"
}
```

**Response `201`:** Created payment method object.  
**Response `400`** — name already exists.

---

## Data Models

```
User         — id, name, email, passwordHash, createdAt
Category     — id, name, isDefault
PaymentMethod — id, name
Transaction  — id, userId, date, description, categoryId, amount (Decimal 10,2),
               status, paymentMethodId?, notes?, createdAt
```

---

## Technical Decisions

### Prisma v7 with MariaDB Adapter

Prisma v7 introduced a new driver adapter system. Since there is no official `@prisma/adapter-mysql`, this project uses `@prisma/adapter-mariadb` — the MariaDB connector is fully compatible with MySQL and is the officially available adapter for MySQL-compatible databases in the Prisma v7 ecosystem.

The database URL is parsed manually from `DATABASE_URL` and passed as a connection pool configuration object to `PrismaMariaDb`, avoiding known issues with connection string parsing in some environments.

Configuration is split between `prisma/schema.prisma` (model definitions) and `prisma.config.ts` (connection and migration config), following the Prisma v7 convention.

### JWT Authentication

Tokens are signed with `jsonwebtoken` using the `JWT_SECRET` environment variable and expire after 7 days. The `auth` middleware extracts the token from the `Authorization: Bearer <token>` header and attaches `userId` to the request object for use in controllers.

### Password Hashing

Passwords are hashed with `bcryptjs` at cost factor 10 before storage. Plain-text passwords are never persisted.
