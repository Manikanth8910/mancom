# Error Codes

## Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/resource"
  }
}
```

## Authentication Errors (401)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `MISSING_TOKEN` | Authorization token is required | No Bearer token in header | Add token to request |
| `INVALID_TOKEN` | Invalid or expired token | Token malformed or expired | Refresh or re-login |
| `INVALID_APPWRITE_SESSION` | Invalid or expired Appwrite session | Appwrite JWT invalid | Re-login via Appwrite |
| `INVALID_REFRESH_TOKEN` | Invalid or expired refresh token | Refresh token malformed/expired | Re-login |
| `REFRESH_TOKEN_REVOKED` | Refresh token has been revoked | Token was invalidated | Re-login |

## Authorization Errors (403)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `INSUFFICIENT_PERMISSIONS` | You do not have permission to access this resource | User lacks required role | Show permission error to user |
| `NO_USER_CONTEXT` | User context not found | Guard misconfiguration | Report bug |
| `SOCIETY_ACCESS_DENIED` | You do not have access to this society | Wrong society context | Check society selection |

## Validation Errors (400/422)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `VALIDATION_ERROR` | Validation failed | Request body invalid | Check `details` for field errors |
| `BAD_REQUEST` | Invalid request | Request malformed | Check request format |
| `INVALID_ID` | Invalid ID format | ID not a valid UUID | Check ID parameter |

**Validation Error Details:**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "email": ["Must be a valid email"],
    "phone": ["Must be a valid phone number"]
  }
}
```

## Resource Errors (404/409)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `NOT_FOUND` | Resource not found | ID doesn't exist | Check ID is correct |
| `VISITOR_NOT_FOUND` | Visitor not found | Visitor ID invalid | Check visitor ID |
| `SOCIETY_NOT_FOUND` | Society not found | Society ID invalid | Check society ID |
| `CONFLICT` | Resource already exists | Duplicate creation | Use existing resource |
| `VISITOR_ALREADY_APPROVED` | Visitor is already approved | Re-approval attempt | Skip approval |

## Rate Limiting (429)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `RATE_LIMITED` | Too many requests | Exceeded rate limit | Wait and retry |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705312800
Retry-After: 60
```

## Server Errors (5xx)

| Code | Message | Cause | Client Action |
|------|---------|-------|---------------|
| `INTERNAL_ERROR` | An unexpected error occurred | Server bug | Retry, report if persistent |
| `DOWNSTREAM_ERROR` | An internal service error occurred | Dependent service failed | Retry later |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Maintenance/overload | Retry later |

## Error Handling Best Practices

### Client-Side

```typescript
async function apiCall(url: string) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await response.json();

  if (!body.success) {
    switch (body.error.code) {
      case 'INVALID_TOKEN':
      case 'MISSING_TOKEN':
        // Attempt refresh or redirect to login
        await refreshTokens();
        return apiCall(url);

      case 'REFRESH_TOKEN_REVOKED':
      case 'INVALID_REFRESH_TOKEN':
        // Must re-login
        redirectToLogin();
        break;

      case 'INSUFFICIENT_PERMISSIONS':
        // Show permission error
        showError('You do not have permission for this action');
        break;

      case 'VALIDATION_ERROR':
        // Show field-level errors
        showFieldErrors(body.error.details);
        break;

      case 'RATE_LIMITED':
        // Wait and retry
        const retryAfter = response.headers.get('Retry-After');
        await delay(retryAfter * 1000);
        return apiCall(url);

      default:
        // Generic error
        showError(body.error.message);
    }
    throw new ApiError(body.error);
  }

  return body.data;
}
```

### Logging

Log error codes for debugging:

```typescript
logger.error({
  code: error.code,
  message: error.message,
  path: request.url,
  userId: user?.id,
  requestId: request.id,
});
```
