# Branch Naming

## Format

```
type/ticket-short-description
```

## Types

| Type | Use For |
|------|---------|
| `feature` | New functionality |
| `fix` | Bug fixes |
| `refactor` | Code improvements (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `chore` | Maintenance (deps, config) |
| `hotfix` | Urgent production fixes |

## Rules

1. **Always include ticket number** (if exists)
2. **Use lowercase**
3. **Use hyphens** to separate words
4. **Keep it short** but descriptive
5. **Max 50 characters** total

## Good Examples

```
feature/ABC-123-visitor-approval-flow
feature/ABC-124-add-notification-service
fix/ABC-125-token-expiry-calculation
fix/ABC-126-null-check-user-context
refactor/ABC-127-extract-validation-logic
docs/ABC-128-api-documentation
test/ABC-129-visitor-service-tests
chore/ABC-130-update-dependencies
hotfix/ABC-999-security-patch
```

## Bad Examples

```
# Missing type
ABC-123-visitor-approval

# Missing ticket
feature/visitor-approval

# Too vague
feature/ABC-123-fix

# Too long
feature/ABC-123-implement-the-new-visitor-approval-workflow-with-notifications

# Wrong separator
feature/ABC_123_visitor_approval

# Uppercase
Feature/ABC-123-Visitor-Approval
```

## Without Ticket Number

For small tasks without tickets, be descriptive:

```
# Acceptable (but prefer having a ticket)
docs/update-readme-setup-instructions
chore/fix-eslint-config
test/add-missing-auth-tests
```

## Matching Commit to Branch

Branch name should match commit scope:

```
Branch: feature/ABC-123-visitor-approval
Commit: feat(visitor): add approval endpoint
```

The feature area in both should align.
