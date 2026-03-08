# Role Definitions

User roles and their permissions in Mancom.

## Role Hierarchy

```
admin
  └── committee
        └── security
        └── resident
```

Higher roles inherit lower role permissions.

## Roles

### resident

Base role for society members.

**Permissions:**
- View own flat's visitors
- Create visitor pre-registrations
- Cancel own pending visitors
- View own profile
- Update own profile

**Assigned to:**
- All registered society members
- Default role for new users

### security

Security staff at society gates.

**Permissions:**
- All resident permissions
- View all pending visitors (society-wide)
- Approve/reject visitor entries
- Mark visitors as checked-in/out
- View visitor history

**Assigned to:**
- Security guards
- Control room operators

### committee

Management committee members.

**Permissions:**
- All security permissions
- View all visitors (any status)
- View society reports
- Manage resident profiles
- Send society announcements

**Assigned to:**
- Chairman
- Secretary
- Treasurer
- Committee members

### admin

System administrators.

**Permissions:**
- All committee permissions
- Manage multiple societies
- Manage user roles
- System configuration
- Access admin dashboard

**Assigned to:**
- Mancom platform administrators
- Technical support staff

## Role Assignment

Roles are stored as Appwrite labels:

```json
{
  "labels": ["resident", "committee"]
}
```

Users can have multiple roles. The most permissive role applies.

## Using Roles in Code

### Require Specific Roles

```typescript
@Roles('security', 'committee', 'admin')
@Get('pending')
listPending() {
  // Only security, committee, or admin can access
}
```

### Check Roles in Service

```typescript
if (user.roles.includes('admin')) {
  // Admin-specific logic
}
```

### Role Guard Flow

```
Request → JwtAuthGuard → RolesGuard → Controller
              │              │
              │              └── Check @Roles() decorator
              └── Verify token, attach user
```

## Common Role Patterns

### Resident-Only Endpoints

```typescript
@Roles('resident')  // Also allows committee, admin
@Post('visitors')
createVisitor() {}
```

### Security-Only Endpoints

```typescript
@Roles('security')  // Also allows committee, admin
@Patch('visitors/:id/approve')
approveVisitor() {}
```

### Committee-Only Endpoints

```typescript
@Roles('committee')  // Also allows admin
@Get('reports')
getReports() {}
```

### Admin-Only Endpoints

```typescript
@Roles('admin')
@Post('societies')
createSociety() {}
```

## Role Changes

Users request role changes through:
1. Committee approval (for committee role)
2. Admin assignment (for security, admin roles)

Role changes update Appwrite labels, and new tokens reflect the change.
