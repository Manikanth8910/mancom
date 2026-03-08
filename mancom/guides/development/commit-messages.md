# Commit Messages

## Format

```
type(scope): description

[optional body]

[optional footer]
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `refactor` | Code change (no new feature or fix) |
| `test` | Adding or fixing tests |
| `chore` | Maintenance (deps, config, build) |

## Scope

The area of the codebase affected:

| Scope | Area |
|-------|------|
| `auth` | Auth service/module |
| `visitor` | Visitor service/module |
| `common` | @mancom/common package |
| `jwt` | @mancom/jwt-utils package |
| `config` | Configuration |
| `deps` | Dependencies |

## Description Rules

1. **Use imperative mood**: "add" not "added" or "adds"
2. **Don't capitalize** first letter
3. **No period** at the end
4. **Max 72 characters**
5. **Focus on why**, not what

## Good Examples

```
feat(auth): add refresh token endpoint

fix(visitor): handle null phone number in validation

docs(readme): update setup instructions for M1 Macs

refactor(auth): extract token generation into separate service

test(visitor): add unit tests for approval flow

chore(deps): update NestJS to v10.3
```

## Bad Examples

```
# Missing type
add new feature

# Missing scope
feat: add endpoint

# Past tense
feat(auth): added refresh endpoint

# Too vague
fix(visitor): fix bug

# Period at end
feat(auth): add refresh endpoint.

# Capitalized
feat(auth): Add refresh endpoint

# Too long
feat(auth): add a new endpoint for refreshing tokens that validates the old token and issues a new pair
```

## Body (Optional)

Use body for context that doesn't fit in the description:

```
feat(visitor): add visitor limit per flat

Residents are limited to 10 pending visitors at a time
to prevent abuse of the pre-registration system.

Limit is configurable via VISITOR_LIMIT env variable.
```

## Footer (Optional)

Reference issues or breaking changes:

```
feat(auth): change token response format

BREAKING CHANGE: tokenType field renamed to type

Closes #123
```

## Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in footer:

```
refactor(common): rename JwtPayload userId to sub

BREAKING CHANGE: JwtPayload.userId renamed to JwtPayload.sub
to align with JWT spec. Update all consumers.
```

## Multiple Changes

If a commit has multiple changes, it's probably too big. Split it.

If you must include related changes:

```
feat(visitor): add approval workflow

- Add approve endpoint
- Add reject endpoint
- Send notification on status change
```

## Commit Frequency

Commit often, but keep commits logical:

```
# Good - logical units
feat(visitor): add visitor entity
feat(visitor): add visitor repository
feat(visitor): add visitor service
feat(visitor): add visitor controller

# Bad - too granular
feat: add id field
feat: add name field
feat: add phone field

# Bad - too large
feat: add entire visitor feature
```

## Quick Reference

```
feat(scope): add new feature
fix(scope): fix specific bug
docs(scope): update documentation
style(scope): format code
refactor(scope): restructure without changing behavior
test(scope): add or fix tests
chore(scope): update deps, config, build
```
