# Auth Service API

Base URL: `http://localhost:3001`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/token | Public | Exchange Appwrite JWT |
| POST | /auth/refresh | Public | Refresh token pair |
| POST | /auth/logout | Public | Invalidate refresh token |
| GET | /auth/me | Required | Get current user |
| GET | /health | Public | Health check |

---

## POST /auth/token

Exchange an Appwrite JWT for Mancom tokens.

### Request

```http
POST /auth/token
Content-Type: application/json

{
  "appwriteJwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appwriteJwt` | string | Yes | JWT from Appwrite SDK after login |

### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | string | JWT for API authentication |
| `refreshToken` | string | JWT for obtaining new tokens |
| `expiresIn` | number | Access token expiry in seconds |
| `tokenType` | string | Always "Bearer" |

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `INVALID_APPWRITE_SESSION` | 401 | Invalid or expired Appwrite JWT |
| `VALIDATION_ERROR` | 400 | Missing or invalid request body |

---

## POST /auth/refresh

Refresh the token pair using a valid refresh token.

### Request

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | Yes | Valid refresh token |

### Response

**Success (200):** Same as `/auth/token`.

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `INVALID_REFRESH_TOKEN` | 401 | Token invalid or expired |
| `REFRESH_TOKEN_REVOKED` | 401 | Token was revoked (logout) |

---

## POST /auth/logout

Invalidate a refresh token to log out.

### Request

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Response

**Success (204):** No content.

The endpoint succeeds even if the token is already invalid.

---

## GET /auth/me

Get the current authenticated user's information.

### Request

```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["resident", "committee"],
    "societyId": "society-456",
    "flatId": "flat-789"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `MISSING_TOKEN` | 401 | No Authorization header |
| `INVALID_TOKEN` | 401 | Token invalid or expired |

---

## GET /health

Health check endpoint for monitoring.

### Request

```http
GET /health
```

### Response

**Success (200):**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "auth-service",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /auth/token | 10 | 1 minute |
| POST /auth/refresh | 30 | 1 minute |
| GET /auth/me | 60 | 1 minute |
