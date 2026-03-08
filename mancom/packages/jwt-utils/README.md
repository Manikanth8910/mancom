# @mancom/jwt-utils

JWT signing and verification utilities using RS256 (asymmetric) algorithm.

## Installation

This package is internal to the monorepo. Add it as a dependency:

```json
{
  "dependencies": {
    "@mancom/jwt-utils": "workspace:*"
  }
}
```

## Setup

Generate RSA key pair:

```bash
make generate-keys
```

Configure environment variables:

```env
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
JWT_ISSUER=mancom-auth
JWT_AUDIENCE=mancom-services
```

## Usage

### Auth Service (Signing Tokens)

```typescript
import { JwtService } from '@mancom/jwt-utils';

const jwtService = new JwtService({
  privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'mancom-auth',
  audience: 'mancom-services',
});

// Generate token pair
const tokens = jwtService.generateTokenPair({
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
  roles: ['resident'],
  societyId: 'society-456',
  flatId: 'flat-789',
});

console.log(tokens.accessToken);
console.log(tokens.refreshToken);
console.log(tokens.expiresIn); // seconds until expiry
```

### Other Services (Verifying Tokens)

```typescript
import { JwtService } from '@mancom/jwt-utils';

// Only public key needed for verification
const jwtService = new JwtService({
  privateKeyPath: '', // Not needed
  publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
});

// Verify access token
const payload = await jwtService.verifyAccessToken(token);
console.log(payload.sub); // user ID
console.log(payload.roles); // user roles
```

## Token Structure

### Access Token Payload

```typescript
{
  sub: string;       // User ID
  email: string;     // User email
  name: string;      // User display name
  roles: string[];   // User roles
  societyId: string; // Society ID
  flatId?: string;   // Flat ID (optional)
  type: 'access';    // Token type
  iat: number;       // Issued at (Unix timestamp)
  exp: number;       // Expiration (Unix timestamp)
  iss: string;       // Issuer
  aud: string;       // Audience
}
```

### Refresh Token Payload

Same as access token but with `type: 'refresh'`.

## Security Notes

- Private key should only be available to auth-service
- Public key can be distributed to all services
- Never expose private key in logs or error messages
- Rotate keys periodically (see runbooks)
