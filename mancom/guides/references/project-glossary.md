# Project Glossary

Domain terms and technical terminology used in Mancom.

## Domain Terms

### Society

A residential housing complex (apartment building, gated community, etc.). Each society has:
- Multiple flats/units
- Common amenities
- Management committee
- Security staff

### Flat / Unit

An individual residence within a society. Has:
- Unique number (e.g., A-101, B-205)
- One or more residents
- Owner information

### Resident

A person living in a flat. Can be:
- Owner (property owner)
- Tenant (renting)
- Family member

### Visitor

A person coming to visit a resident. Types:
- **Guest**: Personal visitors
- **Delivery**: Package/food delivery
- **Service**: Plumber, electrician, etc.
- **Other**: Miscellaneous

### Committee

The management body of a society. Roles:
- Chairman
- Secretary
- Treasurer
- Members

### Security

Staff managing society entry/exit:
- Guards at gate
- Control room operators
- Patrol staff

## Technical Terms

### JWT (JSON Web Token)

A token format for authentication. Contains:
- Header (algorithm)
- Payload (user data)
- Signature (verification)

### Access Token

Short-lived JWT (15 min) used for API authentication. Sent in Authorization header.

### Refresh Token

Long-lived JWT (7 days) used to get new access tokens without re-login.

### RS256

RSA + SHA-256 signing algorithm. Uses:
- Private key for signing
- Public key for verification

### DTO (Data Transfer Object)

A class defining request/response structure. Used for validation and typing.

### Guard

NestJS component that determines if a request can proceed. Used for auth/authorization.

### Interceptor

NestJS component that transforms requests/responses. Used for logging, caching.

### Filter

NestJS component that handles exceptions. Formats error responses.

### Pipe

NestJS component that transforms or validates input data.

## Abbreviations

| Abbr | Full Form |
|------|-----------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DTO | Data Transfer Object |
| E2E | End-to-End |
| HTTP | Hypertext Transfer Protocol |
| JWT | JSON Web Token |
| OTP | One-Time Password |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| UUID | Universally Unique Identifier |

## Status Values

### Visitor Status

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting security approval |
| `approved` | Approved, can enter |
| `rejected` | Denied entry |
| `completed` | Visit finished |
| `expired` | Auto-expired (>24h) |

### User Roles

| Role | Description |
|------|-------------|
| `resident` | Regular society member |
| `committee` | Management committee member |
| `security` | Security staff |
| `admin` | System administrator |
