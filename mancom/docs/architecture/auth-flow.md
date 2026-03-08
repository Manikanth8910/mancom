# Authentication Flow

## Overview

Mancom uses a hybrid authentication model:

1. **Appwrite** handles user login (OTP, email/password, OAuth)
2. **Auth Service** exchanges Appwrite sessions for Mancom JWTs
3. **Other Services** validate Mancom JWTs independently

This design keeps services decoupled from Appwrite at runtime.

## Authentication Sequence

```
┌────────┐     ┌─────────┐     ┌─────────────┐     ┌─────────────┐
│ Client │     │ Appwrite│     │ Auth Service│     │Other Service│
└───┬────┘     └────┬────┘     └──────┬──────┘     └──────┬──────┘
    │               │                 │                   │
    │  1. Login     │                 │                   │
    │──────────────>│                 │                   │
    │               │                 │                   │
    │  Appwrite JWT │                 │                   │
    │<──────────────│                 │                   │
    │               │                 │                   │
    │  2. POST /auth/token            │                   │
    │  {appwriteJwt}│                 │                   │
    │────────────────────────────────>│                   │
    │               │                 │                   │
    │               │  3. Verify JWT  │                   │
    │               │<────────────────│                   │
    │               │                 │                   │
    │               │  User data      │                   │
    │               │────────────────>│                   │
    │               │                 │                   │
    │  4. Mancom tokens               │                   │
    │  {accessToken, refreshToken}    │                   │
    │<────────────────────────────────│                   │
    │               │                 │                   │
    │  5. API call with accessToken   │                   │
    │─────────────────────────────────────────────────────>
    │               │                 │                   │
    │               │                 │  6. Verify JWT    │
    │               │                 │  (using public key)
    │               │                 │                   │
    │  7. Response  │                 │                   │
    │<─────────────────────────────────────────────────────
```

## Token Exchange (Step 2-4)

**Request:**
```http
POST /auth/token
Content-Type: application/json

{
  "appwriteJwt": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
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

## JWT Payload Structure

### Access Token

```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["resident", "committee"],
  "societyId": "society-456",
  "flatId": "flat-789",
  "type": "access",
  "iat": 1705312200,
  "exp": 1705313100,
  "iss": "mancom-auth",
  "aud": "mancom-services"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `sub` | string | User's unique identifier |
| `email` | string | User's email address |
| `name` | string | User's display name |
| `roles` | string[] | User's roles for authorization |
| `societyId` | string | Society the user belongs to |
| `flatId` | string? | Flat within the society (optional) |
| `type` | string | Token type: "access" or "refresh" |
| `iat` | number | Issued at timestamp (Unix) |
| `exp` | number | Expiration timestamp (Unix) |
| `iss` | string | Token issuer |
| `aud` | string | Token audience |

### Refresh Token

Same structure as access token, but:
- `type`: "refresh"
- `exp`: 7 days from `iat` (vs 15 minutes for access)

## Token Refresh Flow

```
┌────────┐     ┌─────────────┐
│ Client │     │ Auth Service│
└───┬────┘     └──────┬──────┘
    │                 │
    │  POST /auth/refresh
    │  {refreshToken} │
    │────────────────>│
    │                 │
    │                 │ Verify refresh token
    │                 │ Check not revoked
    │                 │ Generate new pair
    │                 │ Revoke old refresh token
    │                 │
    │  New token pair │
    │<────────────────│
```

**Request:**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:** Same as token exchange.

## Logout

Logout invalidates the refresh token in Redis.

```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:** 204 No Content

## Token Storage (Redis)

Refresh tokens are tracked in Redis for revocation:

```
Key: refresh_token:{userId}:{tokenId}
Value: "valid"
TTL: 7 days
```

On logout or refresh, the old token key is deleted.

## Security Considerations

### RS256 Algorithm

Tokens are signed with RS256 (RSA + SHA-256):
- **Private key**: Only auth-service can sign tokens
- **Public key**: All services can verify tokens

### Token Expiry

| Token | Expiry | Rationale |
|-------|--------|-----------|
| Access | 15 minutes | Short-lived, limits damage if stolen |
| Refresh | 7 days | Convenience vs security balance |

### Refresh Token Rotation

Each refresh generates a new token pair and invalidates the old refresh token. This limits the window for token theft.

### Rate Limiting

Auth endpoints should be rate-limited:
- `/auth/token`: 10 requests/minute per IP
- `/auth/refresh`: 30 requests/minute per user

## Client Implementation

### Storage

- **Access token**: Memory only (not localStorage)
- **Refresh token**: Secure HTTP-only cookie or encrypted storage

### Refresh Strategy

1. Check access token expiry before API calls
2. If expired (or <1 min remaining), refresh first
3. If refresh fails, redirect to login

### Error Handling

| Error Code | Action |
|------------|--------|
| `INVALID_APPWRITE_SESSION` | Redirect to Appwrite login |
| `INVALID_REFRESH_TOKEN` | Redirect to login |
| `REFRESH_TOKEN_REVOKED` | Redirect to login |
| `INVALID_TOKEN` | Refresh or redirect to login |
