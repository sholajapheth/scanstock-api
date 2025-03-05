# Swagger Documentation for ScanStock Pro API

## Accessing the Documentation

The API documentation is available at the following URL when the server is running:

```
http://localhost:3000/api/docs
```

## Using Swagger UI

Swagger UI provides an interactive interface to explore and test the API endpoints.

### Authentication

To use authenticated endpoints:

1. First, use the `/api/auth/register` endpoint to create a new user
2. Then, use the `/api/auth/login` endpoint to get an authentication token
3. Click the "Authorize" button at the top of the page
4. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
5. Click "Authorize" and close the popup

Now all your requests will include the authentication token.

### Exploring Endpoints

The documentation is organized by tags:

- **auth** - Authentication endpoints
- **users** - User management endpoints
- **products** - Product management endpoints
- **categories** - Category management endpoints
- **sales** - Sales management endpoints

For each endpoint, you can see:

- The HTTP method (GET, POST, PATCH, DELETE)
- The endpoint path and description
- Required and optional parameters
- Example request body schemas
- Possible response codes and their meanings

### Testing Endpoints

To test an endpoint:

1. Click on the endpoint to expand it
2. Fill in the required parameters
3. Click "Execute"
4. View the response below

For endpoints that require a request body, Swagger UI provides an editor where you can modify the example schema provided.

### Schema Models

At the bottom of the page, you can find the schema definitions for all data models used in the API, including:

- User
- Product
- Category
- Sale
- SaleItem
- Various DTOs (Data Transfer Objects) used for requests

These schemas show all the properties and their data types, helping you understand the structure of the data you'll be working with.

## API Documentation JSON

If you need the raw OpenAPI specification in JSON format, it's available at:

```
http://localhost:3000/api/docs-json
```

This can be useful for generating client libraries or importing into other API tools.