# Visitor Service

Visitor management service for the Mancom platform.

## Status

**Not Implemented** - This service is a placeholder. See [Adding a New Service](../../guides/tutorials/adding-new-service.md) for implementation guide.

## Planned Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /visitors | Required | resident+ | Create visitor entry |
| GET | /visitors | Required | resident+ | List visitors |
| GET | /visitors/:id | Required | resident+ | Get visitor details |
| PATCH | /visitors/:id/approve | Required | security+ | Approve visitor entry |
| DELETE | /visitors/:id | Required | resident+ | Cancel visitor |
| GET | /health | Public | - | Health check |

## Implementation Notes

When implementing this service:

1. Copy the structure from `auth-service`
2. Use `@mancom/common` for guards and decorators
3. Use `@mancom/jwt-utils` for token verification
4. Follow patterns in [NestJS Patterns Guide](../../guides/coding-standards/nestjs-patterns.md)
5. Add tests following [Testing Guide](../../guides/testing/unit-tests.md)

## Configuration

```env
PORT=3002
HOST=0.0.0.0
JWT_PUBLIC_KEY_PATH=../../keys/public.pem
DATABASE_URL=postgresql://...
```

## See Also

- [Adding a New Service](../../guides/tutorials/adding-new-service.md)
- [Adding a New Endpoint](../../guides/tutorials/adding-new-endpoint.md)
- [Role Definitions](../../guides/references/role-definitions.md)
