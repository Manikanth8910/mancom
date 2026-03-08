# API Conventions

## Base URL

```
Development: http://localhost:{port}
Production: https://api.mancom.app
```

## HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Retrieve resource(s) |
| POST | Create resource |
| PATCH | Partial update |
| PUT | Full replacement (rarely used) |
| DELETE | Remove resource |

## URL Naming

- Use lowercase with hyphens: `/visitor-logs`
- Use plural nouns for collections: `/visitors`
- Use specific IDs for single resources: `/visitors/123`
- Nest for relationships: `/societies/123/flats`
- Use verbs only for actions: `/visitors/123/approve`

## Request Format

### Headers

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### Body

```json
{
  "fieldName": "value",
  "nestedObject": {
    "property": "value"
  }
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Example"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req-abc-123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Must be a valid email address"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/visitors"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Pagination

### Request

```
GET /visitors?page=1&limit=20
```

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `page` | 1 | - | Page number (1-indexed) |
| `limit` | 20 | 100 | Items per page |

### Response

Pagination metadata in `meta.pagination` object.

## Filtering

Use query parameters:

```
GET /visitors?status=approved&date=2024-01-15
```

For multiple values:

```
GET /visitors?status=approved,pending
```

For date ranges:

```
GET /visitors?dateFrom=2024-01-01&dateTo=2024-01-31
```

## Sorting

```
GET /visitors?sort=createdAt&order=desc
```

| Parameter | Values | Default |
|-----------|--------|---------|
| `sort` | Field name | `createdAt` |
| `order` | `asc`, `desc` | `desc` |

Multiple fields:

```
GET /visitors?sort=status,createdAt&order=asc,desc
```

## HTTP Status Codes

### Success

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |

### Client Errors

| Code | Meaning | Usage |
|------|---------|-------|
| 400 | Bad Request | Invalid request body |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Validation failed |
| 429 | Too Many Requests | Rate limited |

### Server Errors

| Code | Meaning | Usage |
|------|---------|-------|
| 500 | Internal Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily down |

## Dates and Times

- All dates in ISO 8601 format: `2024-01-15T10:30:00.000Z`
- Always use UTC timezone
- Store and return timestamps, not local times

## IDs

- Use UUIDs for all resource IDs
- IDs are strings in JSON responses

## Null Values

- Omit null fields from responses when possible
- Accept `null` in requests to clear optional fields
