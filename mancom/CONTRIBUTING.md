# Contributing to Mancom Backend

Thank you for contributing to Mancom! This guide covers everything you need to know to contribute effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Creating Issues](#creating-issues)
- [Working on Features](#working-on-features)
- [Working on Bug Fixes](#working-on-bug-fixes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review](#code-review)
- [Style Guide](#style-guide)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Completed the [Day 1 Setup](guides/onboarding/day-1-setup.md)
2. Read the [Codebase Tour](guides/onboarding/day-2-codebase-tour.md)
3. Reviewed [Coding Standards](guides/coding-standards/typescript.md)
4. Understood the [Git Workflow](guides/development/git-workflow.md)

### Setting Up Your Environment

```bash
# Clone the repository
git clone <repo-url>
cd mancom-backend

# Run setup
make setup

# Verify everything works
make dev
curl http://localhost:3001/health
```

---

## Development Workflow

### Overview

```
1. Create Issue → 2. Create Branch → 3. Write Code → 4. Test → 5. Commit → 6. Push → 7. Create PR → 8. Review → 9. Merge
```

### Branch Strategy

| Branch | Purpose | Merges To |
|--------|---------|-----------|
| `main` | Production-ready code | - |
| `develop` | Integration branch | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `hotfix/*` | Urgent production fixes | `main` + `develop` |
| `docs/*` | Documentation only | `develop` |
| `refactor/*` | Code improvements | `develop` |
| `test/*` | Test additions | `develop` |

---

## Creating Issues

Before starting work, create or find an issue that describes the task.

### Issue Types

#### Bug Report

Use for reporting bugs. Include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Service, Node version, OS
- **Logs**: Relevant error messages or stack traces

Example:
```markdown
## Description
Refresh token endpoint returns 500 when token is expired instead of 401.

## Steps to Reproduce
1. Obtain a refresh token
2. Wait for it to expire (or manually expire it)
3. Call POST /auth/refresh with the expired token

## Expected Behavior
Should return 401 with error code `INVALID_REFRESH_TOKEN`

## Actual Behavior
Returns 500 Internal Server Error

## Environment
- Service: auth-service
- Node: 20.10.0
- OS: Ubuntu 22.04

## Logs
```
TypeError: Cannot read property 'exp' of undefined
    at AuthService.refreshTokens (auth.service.ts:85)
```
```

#### Feature Request

Use for new functionality. Include:

- **Problem**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives Considered**: Other approaches
- **Additional Context**: Mockups, examples, etc.

Example:
```markdown
## Problem
Residents cannot see a history of their past visitors.

## Proposed Solution
Add a GET /visitors/history endpoint that returns paginated list of
completed/expired visitors for the user's flat.

## Alternatives Considered
- Adding a `status` filter to existing GET /visitors endpoint
- Decided against because history needs different default sorting

## Additional Context
Should include: visitor name, purpose, entry/exit times, approved by
```

#### Task

Use for technical tasks, chores, or refactoring:

- **Description**: What needs to be done
- **Acceptance Criteria**: Checklist of requirements
- **Technical Notes**: Implementation hints

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or improvement |
| `documentation` | Documentation only |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | Should be addressed soon |
| `priority: low` | Can wait |
| `service: auth` | Related to auth-service |
| `service: visitor` | Related to visitor-service |
| `package: common` | Related to @mancom/common |

---

## Working on Features

### Step 1: Find or Create an Issue

- Check existing issues for your feature
- If none exists, create a Feature Request issue
- Get approval before starting large features

### Step 2: Create a Feature Branch

```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ABC-123-visitor-history
```

**Branch Naming Format:**
```
feature/<ticket-number>-<short-description>
```

Examples:
```
feature/ABC-123-visitor-history
feature/ABC-124-add-notification-service
feature/ABC-125-society-settings-endpoint
```

### Step 3: Implement the Feature

Follow the coding standards:

- [TypeScript Standards](guides/coding-standards/typescript.md)
- [NestJS Patterns](guides/coding-standards/nestjs-patterns.md)
- [Naming Conventions](guides/coding-standards/naming-conventions.md)
- [File Structure](guides/coding-standards/file-structure.md)

**For new endpoints**, follow the [Adding an Endpoint](guides/tutorials/adding-new-endpoint.md) tutorial.

**For new services**, follow the [Adding a New Service](guides/tutorials/adding-new-service.md) tutorial.

### Step 4: Write Tests

Every feature needs tests:

```bash
# Run tests for your service
pnpm test --filter=@mancom/visitor-service

# Run with coverage
pnpm test:cov --filter=@mancom/visitor-service
```

See [Testing Guide](guides/testing/unit-tests.md) for best practices.

### Step 5: Update Documentation

If your feature changes the API:

1. Update the service README
2. Update API docs in `docs/api/`
3. Add JSDoc to public methods

### Step 6: Verify Everything

```bash
# Run all checks
make lint        # No lint errors
make test        # All tests pass
make build       # Builds successfully
```

---

## Working on Bug Fixes

### Step 1: Reproduce the Bug

Before fixing, ensure you can reproduce the issue locally.

### Step 2: Create a Fix Branch

```bash
git checkout develop
git pull origin develop
git checkout -b fix/ABC-126-refresh-token-500-error
```

**Branch Naming Format:**
```
fix/<ticket-number>-<short-description>
```

### Step 3: Write a Failing Test

Write a test that reproduces the bug:

```typescript
it('should return 401 when refresh token is expired', async () => {
  const expiredToken = generateExpiredToken();

  await expect(service.refreshTokens(expiredToken))
    .rejects.toThrow(UnauthorizedException);
});
```

### Step 4: Fix the Bug

Make the minimal change to fix the issue.

### Step 5: Verify the Test Passes

```bash
pnpm test --filter=@mancom/auth-service
```

### Step 6: Check for Regressions

Ensure you haven't broken anything else:

```bash
make test
```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or fixing tests |
| `chore` | Maintenance (deps, config, build) |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

### Scopes

| Scope | Area |
|-------|------|
| `auth` | Auth service |
| `visitor` | Visitor service |
| `common` | @mancom/common package |
| `jwt` | @mancom/jwt-utils package |
| `config` | Configuration |
| `deps` | Dependencies |
| `ci` | CI/CD |

### Examples

```bash
# Feature
git commit -m "feat(visitor): add visitor history endpoint"

# Bug fix
git commit -m "fix(auth): handle expired refresh tokens correctly"

# Documentation
git commit -m "docs(readme): update project structure"

# Refactor
git commit -m "refactor(auth): extract token generation to separate method"

# Test
git commit -m "test(visitor): add integration tests for approval flow"

# Chore
git commit -m "chore(deps): update NestJS to v10.3"

# With body
git commit -m "feat(auth): add rate limiting to token endpoints

Implements sliding window rate limiting:
- /auth/token: 10 requests per minute
- /auth/refresh: 30 requests per minute

Closes #45"

# Breaking change
git commit -m "feat(common): rename UserContext.userId to UserContext.id

BREAKING CHANGE: UserContext.userId is now UserContext.id
Update all consumers to use the new field name."
```

### Commit Best Practices

1. **Keep commits focused**: One logical change per commit
2. **Write meaningful messages**: Explain why, not just what
3. **Use imperative mood**: "add feature" not "added feature"
4. **Reference issues**: Include `Closes #123` or `Fixes #123`

---

## Pull Request Process

### Before Creating a PR

Ensure:

- [ ] Code compiles: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] Branch is up to date with develop
- [ ] Self-reviewed the changes

### Creating the PR

1. Push your branch:
   ```bash
   git push -u origin feature/ABC-123-visitor-history
   ```

2. Go to GitHub and click "Create Pull Request"

3. Fill in the PR template:

```markdown
## Summary

- Adds GET /visitors/history endpoint for viewing past visitors
- Includes pagination and date filtering
- Returns visitor name, purpose, timestamps, approver

## Changes

- Added `VisitorsHistoryController` with GET endpoint
- Added `getHistory()` method to `VisitorsService`
- Added `ListHistoryQueryDto` for query parameters
- Added unit tests for service method
- Added integration tests for endpoint
- Updated API documentation

## Related Issue

Closes #123

## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] Tests

## Testing

- [x] Unit tests added for VisitorsService.getHistory()
- [x] Integration tests added for GET /visitors/history
- [x] Manual testing with Postman
- [x] Tested pagination with 100+ records

## Checklist

- [x] Code follows project conventions
- [x] Self-reviewed my code
- [x] Added necessary documentation
- [x] Tests pass locally
- [x] No new warnings

## Screenshots

N/A (backend only)

## Notes for Reviewers

Please check the pagination logic in `visitors.service.ts:145-160`.
I'm not sure if we should default to 30 days or require explicit date range.
```

### PR Title

Use the same format as commits:

```
feat(visitor): add visitor history endpoint
fix(auth): handle expired refresh tokens correctly
docs(api): update visitor service documentation
```

### PR Size

Keep PRs small and focused:

| Size | Lines Changed | Recommended |
|------|---------------|-------------|
| Small | < 200 | ✅ Ideal |
| Medium | 200-400 | ✅ Acceptable |
| Large | 400-800 | ⚠️ Consider splitting |
| XL | > 800 | ❌ Split into smaller PRs |

### After Creating the PR

1. Request reviewers (1-2 people)
2. Add appropriate labels
3. Link to related issues
4. Respond to CI failures immediately

---

## Code Review

### As an Author

**Responding to feedback:**

- Address all comments before requesting re-review
- Explain your reasoning if you disagree
- Ask questions if feedback is unclear
- Don't take feedback personally

**After approval:**

- Squash and merge via GitHub
- Delete the branch
- Verify the merge in develop

### As a Reviewer

**What to check:**

- [ ] Code correctness and logic
- [ ] Test coverage
- [ ] Security considerations
- [ ] Performance implications
- [ ] Adherence to coding standards
- [ ] Documentation updates

**How to give feedback:**

```
# Use prefixes
nit: minor style issue (optional to fix)
suggestion: alternative approach (optional)
question: need clarification
blocking: must fix before merge

# Be specific
❌ "This is confusing"
✅ "Consider renaming `x` to `visitorCount` for clarity"

# Explain why
❌ "Add a try/catch here"
✅ "Add try/catch because httpService.get() can throw on network errors"
```

See [Code Review Checklist](guides/development/code-review-checklist.md) for details.

---

## Style Guide

### Quick Reference

| Category | Convention |
|----------|------------|
| Files | `kebab-case.ts` |
| Classes | `PascalCase` |
| Functions | `camelCase` |
| Variables | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` |
| Interfaces | `PascalCase` (no I prefix) |
| DTOs | `*Dto` suffix |

### Code Quality

1. **Type everything**: No implicit `any`
2. **Handle errors**: Always handle promise rejections
3. **Write tests**: 80%+ coverage for services
4. **Keep it simple**: Don't over-engineer
5. **Document why**: Comments explain reasoning, not mechanics

### Detailed Guides

- [TypeScript Standards](guides/coding-standards/typescript.md)
- [NestJS Patterns](guides/coding-standards/nestjs-patterns.md)
- [Naming Conventions](guides/coding-standards/naming-conventions.md)
- [File Structure](guides/coding-standards/file-structure.md)
- [Comments and Documentation](guides/coding-standards/comments-and-documentation.md)

---

## Getting Help

- **Setup issues**: See [Common Issues](docs/runbooks/common-issues.md)
- **Code questions**: Ask in the team Slack channel
- **Stuck on a task**: Reach out to your mentor
- **Found a bug in docs**: Create an issue or fix it yourself!

---

## Recognition

Contributors are recognized in release notes. Thank you for helping improve Mancom!
