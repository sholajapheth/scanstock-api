# ScanStock Pro API

Backend API for ScanStock Pro inventory and point-of-sale management system.

## Features

- User authentication with JWT
- Product management with barcode support
- Category organization
- Sales and transaction management
- Inventory tracking
- Receipt generation
- Role-based access control

## Tech Stack

- NestJS - Progressive Node.js framework
- TypeORM - ORM for TypeScript and JavaScript
- PostgreSQL - SQL database
- JWT - JSON Web Tokens for authentication
- Class Validator - Validation library

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd scanstock-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
createdb scanstock

# Run database migrations
npm run migration:run

# Start the server in development mode
npm run start:dev
```

## API Documentation

The API documentation is available at `/api/docs` when running the server.

### Main endpoints:

- `/api/auth` - Authentication routes (register, login)
- `/api/users` - User management
- `/api/products` - Product management
- `/api/categories` - Category management
- `/api/sales` - Sales management

## Development

```bash
# Generate a resource
nest g resource [name]

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linting
npm run lint
```

## Database Schema

The database schema includes the following main entities:

- Users - Store user information
- Products - Store product information
- Categories - Organize products into categories
- Sales - Record sales transactions
- SaleItems - Individual items in a sale

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
