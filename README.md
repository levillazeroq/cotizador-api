# Cotizador API

A NestJS API for managing payment methods with Drizzle ORM and PostgreSQL.

## Features

- Payment Methods CRUD operations
- Drizzle ORM integration
- PostgreSQL database
- TypeScript support
- Validation with class-validator

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
# Create .env file
DATABASE_URL=postgresql://username:password@localhost:5432/cotizador_db
PORT=3000
```

3. Generate and run database migrations:
```bash
pnpm run db:generate
pnpm run db:migrate
```

4. Start the development server:
```bash
pnpm run start:dev
```

## API Endpoints

### Payment Methods

- `GET /payment-methods` - Get all payment methods
- `GET /payment-methods/:id` - Get payment method by ID
- `POST /payment-methods` - Create new payment method
- `PATCH /payment-methods/:id` - Update payment method
- `DELETE /payment-methods/:id` - Delete payment method
- `PATCH /payment-methods/:id/toggle-active` - Toggle payment method active status
- `POST /payment-methods/reorder` - Reorder payment methods

### Payment Method Types

- `webpay` - WebPay payment method
- `transfer` - Bank transfer payment method
- `check` - Check payment method

## Database Schema

The payment methods table includes:
- `id` - UUID primary key
- `name` - Unique name identifier
- `type` - Payment method type (webpay, transfer, check)
- `displayName` - Display name for UI
- `icon` - Icon identifier
- `isActive` - Active status
- `requiresProof` - Whether proof is required
- `sortOrder` - Sort order for display
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Development

- `pnpm run start:dev` - Start development server with hot reload
- `pnpm run build` - Build the application
- `pnpm run test` - Run tests
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## Database Commands

- `pnpm run db:generate` - Generate migration files
- `pnpm run db:migrate` - Run migrations
- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:studio` - Open Drizzle Studio