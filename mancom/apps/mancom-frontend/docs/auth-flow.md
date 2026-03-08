# Authentication Flow

## Overview

Mancom uses phone-based OTP authentication via Appwrite, proxied through our backend. The flow involves:
1. Requesting OTP via our backend (which proxies to Appwrite)
2. Verifying OTP via our backend (which proxies to Appwrite)
3. Getting Appwrite JWT
4. Exchanging Appwrite JWT for our backend tokens
5. Using our tokens for all subsequent API calls

## Sequence Diagram

```
┌──────────┐          ┌──────────────┐          ┌──────────────┐
│  App     │          │  Our Backend │          │   Appwrite   │
└────┬─────┘          └──────┬───────┘          └──────┬───────┘
     │                       │                         │
     │ 1. POST /auth/appwrite/account/sessions/phone   │
     │   { phone: "+91..." } │                         │
     │──────────────────────>│                         │
     │                       │ (proxy)                 │
     │                       │─────────────────────────>
     │                       │                         │
     │                       │<─────────────────────────
     │<──────────────────────│ { userId }              │
     │                       │                         │
     │ 2. PUT /auth/appwrite/account/sessions/phone    │
     │   { userId, secret }  │                         │
     │──────────────────────>│                         │
     │                       │ (proxy)                 │
     │                       │─────────────────────────>
     │                       │                         │
     │                       │<─────────────────────────
     │<──────────────────────│ { sessionId }           │
     │                       │                         │
     │ 3. POST /auth/appwrite/account/jwt              │
     │──────────────────────>│                         │
     │                       │ (proxy)                 │
     │                       │─────────────────────────>
     │                       │                         │
     │                       │<─────────────────────────
     │<──────────────────────│ { jwt }                 │
     │                       │                         │
     │ 4. POST /auth/session │                         │
     │   { appwriteJwt }     │                         │
     │──────────────────────>│                         │
     │                       │ (verify & create)       │
     │<──────────────────────│                         │
     │ { accessToken, refreshToken, user }             │
     │                       │                         │
```

## Token Storage

Tokens are stored securely:
- `accessToken` and `refreshToken` stored in Keychain
- Never stored in AsyncStorage or Redux persist
- Cleared on logout

## Token Refresh

When access token expires:
1. API client interceptor catches 401
2. Attempts refresh using refresh token
3. If refresh succeeds, retries original request
4. If refresh fails, clears tokens and redirects to login

```
┌──────────┐          ┌──────────────┐
│  App     │          │  Our Backend │
└────┬─────┘          └──────┬───────┘
     │                       │
     │ API Request (expired) │
     │──────────────────────>│
     │                       │
     │<──────────────────────│ 401 Unauthorized
     │                       │
     │ POST /auth/session/refresh
     │   { refreshToken }    │
     │──────────────────────>│
     │                       │
     │<──────────────────────│ { new tokens }
     │                       │
     │ Retry original request│
     │──────────────────────>│
     │                       │
     │<──────────────────────│ Success
```

## Session Restoration

On app launch:
1. Check for stored tokens
2. If tokens exist and valid, restore session
3. If tokens expired, try refresh
4. If refresh fails, show login screen

## Logout

1. Call revoke endpoint (optional, ignore errors)
2. Clear tokens from secure storage
3. Clear Redux state
4. Navigate to login screen

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/appwrite/account/sessions/phone` | POST | Request OTP |
| `/auth/appwrite/account/sessions/phone` | PUT | Verify OTP |
| `/auth/appwrite/account/jwt` | POST | Get Appwrite JWT |
| `/auth/session` | POST | Exchange for our tokens |
| `/auth/session/refresh` | POST | Refresh tokens |
| `/auth/session/revoke` | POST | Logout/revoke session |
| `/auth/me` | GET | Get current user |

## Implementation Details

### Redux State

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  otpUserId: string | null;
  error: string | null;
}
```

### Key Thunks

- `requestOtp(phone)` - Request OTP for phone number
- `verifyOtpAndLogin({ userId, otp })` - Complete login flow
- `restoreSession()` - Restore session on app launch
- `refreshTokens()` - Refresh access token
- `logout()` - Clear session and logout
