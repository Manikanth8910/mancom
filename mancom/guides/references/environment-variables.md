# Environment Variables

All configuration variables used in Mancom backend.

## Root Variables

Set in `.env` at repository root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment: development, staging, production |
| `LOG_LEVEL` | No | `debug` | Logging level: error, warn, log, debug, verbose |

## JWT Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_PRIVATE_KEY_PATH` | Yes | - | Path to RSA private key file |
| `JWT_PUBLIC_KEY_PATH` | Yes | - | Path to RSA public key file |
| `JWT_ACCESS_TOKEN_EXPIRY` | No | `15m` | Access token expiry (e.g., 15m, 1h) |
| `JWT_REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token expiry (e.g., 7d, 30d) |
| `JWT_ISSUER` | No | `mancom-auth` | JWT issuer claim |
| `JWT_AUDIENCE` | No | `mancom-services` | JWT audience claim |

## Appwrite Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APPWRITE_ENDPOINT` | Yes | - | Appwrite API endpoint URL |
| `APPWRITE_PROJECT_ID` | Yes | - | Appwrite project ID |
| `APPWRITE_API_KEY` | Yes | - | Appwrite API key (server-side) |

## Service Variables

### Auth Service

Set in `services/auth-service/.env`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | HTTP server port |
| `HOST` | No | `0.0.0.0` | HTTP server host |

### Visitor Service

Set in `services/visitor-service/.env`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3002` | HTTP server port |
| `HOST` | No | `0.0.0.0` | HTTP server host |

## Database Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | No | `localhost` | PostgreSQL host |
| `DATABASE_PORT` | No | `5432` | PostgreSQL port |
| `DATABASE_NAME` | No | `mancom` | Database name |
| `DATABASE_USER` | No | `mancom` | Database user |
| `DATABASE_PASSWORD` | Yes | - | Database password |
| `DATABASE_SSL` | No | `false` | Enable SSL connection |
| `DATABASE_POOL_MIN` | No | `2` | Min connection pool size |
| `DATABASE_POOL_MAX` | No | `10` | Max connection pool size |

## Redis Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | No | - | Redis password (if set) |
| `REDIS_DB` | No | `0` | Redis database number |

## Setting Variables

### Local Development

1. Copy example files:
   ```bash
   cp .env.example .env
   cp services/auth-service/.env.example services/auth-service/.env
   ```

2. Edit `.env` files with your values

### CI/CD

Set as secrets in GitHub Actions or your CI platform.

### Production

Use environment-specific configuration:
- Kubernetes: ConfigMaps and Secrets
- Docker: Environment files or orchestration config
- Cloud: Platform-specific secret management

## Validation

Services validate required variables on startup:

```typescript
// configuration.ts
export default () => {
  const config = {
    appwrite: {
      endpoint: process.env.APPWRITE_ENDPOINT,
      projectId: process.env.APPWRITE_PROJECT_ID,
      apiKey: process.env.APPWRITE_API_KEY,
    },
  };

  // Validation happens in service constructors
  if (!config.appwrite.projectId) {
    throw new Error('APPWRITE_PROJECT_ID is required');
  }

  return config;
};
```

## Security Notes

- Never commit `.env` files
- Use strong passwords in production
- Rotate API keys periodically
- Use read-only database credentials where possible
- Keep private keys secure (restricted file permissions)
