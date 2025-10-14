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

### Customization Groups

- `GET /customization-groups` - Get all customization groups
- `GET /customization-groups/active` - Get active customization groups
- `GET /customization-groups/:id` - Get customization group by ID
- `POST /customization-groups` - Create new customization group
- `PATCH /customization-groups/:id` - Update customization group
- `DELETE /customization-groups/:id` - Delete customization group
- `PATCH /customization-groups/:id/toggle-active` - Toggle customization group active status
- `POST /customization-groups/reorder` - Reorder customization groups


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