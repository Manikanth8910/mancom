# Day 3: First Task

Goal: Make your first code contribution.

## Pick a Starter Task

Your mentor will assign a starter task. Typical first tasks:

- Add a new field to an existing DTO
- Add a simple utility function
- Fix a documentation typo
- Add a test case

These tasks are small but touch the full workflow.

## Workflow Overview

```
1. Create branch → 2. Make changes → 3. Test → 4. Commit → 5. Push → 6. Create PR → 7. Address feedback → 8. Merge
```

## Step-by-Step

### 1. Create a Branch

```bash
# Update main branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ABC-123-short-description
```

Branch naming: `type/ticket-description`

See [Branch Naming](../development/branch-naming.md) for details.

### 2. Make Your Changes

Open the relevant file and make your change.

Tips:
- Keep changes small and focused
- Follow existing patterns in the file
- Don't change unrelated code

### 3. Write/Run Tests

```bash
# Run tests for the changed package
pnpm test --filter=@mancom/auth-service

# Run all tests
make test
```

If you added new functionality, add a test. See [Unit Tests](../testing/unit-tests.md).

### 4. Check Linting

```bash
make lint
```

Fix any errors:

```bash
make lint-fix
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat(auth): add phone field to user context"
```

Use conventional commits. See [Commit Messages](../development/commit-messages.md).

### 6. Push to Remote

```bash
git push -u origin feature/ABC-123-short-description
```

### 7. Create Pull Request

Go to GitHub and create a PR.

Fill in the template:
- Summary of changes
- Link to issue
- How you tested it

See [Pull Requests](../development/pull-requests.md).

### 8. Address Feedback

Reviewers may request changes:

```bash
# Make requested changes
# Commit them
git add .
git commit -m "fix: address review feedback"
git push
```

Don't worry about multiple commits - they'll be squashed.

### 9. Merge

Once approved, the PR will be merged. Congratulations!

## What to Expect in Code Review

Reviewers check:

- Code follows project conventions
- Tests exist and pass
- No security issues
- Clear naming
- No unnecessary complexity

Common feedback for new contributors:

| Feedback | What It Means |
|----------|---------------|
| "Add a test" | Need test coverage |
| "Follow existing pattern" | Look at similar code |
| "Simplify this" | Solution is over-engineered |
| "Add type" | Missing TypeScript type |

Don't take feedback personally - it's how we all improve.

## Example: Adding a Field

Let's say you're adding a `phone` field to `UserContext`.

### 1. Update Interface

`packages/common/src/interfaces/user-context.interface.ts`:

```typescript
export interface UserContext {
  id: string;
  email: string;
  name: string;
  roles: string[];
  societyId: string;
  flatId?: string;
  phone?: string;  // Add this
}
```

### 2. Update JWT Payload

`packages/common/src/interfaces/jwt-payload.interface.ts`:

```typescript
export interface JwtPayload {
  // ... existing fields
  phone?: string;  // Add this
}
```

### 3. Update Mapping

`services/auth-service/src/auth/auth.service.ts`:

Find where UserContext is created and add the field.

### 4. Run Tests

```bash
make test
```

### 5. Commit and PR

```bash
git add .
git commit -m "feat(common): add phone field to user context"
git push -u origin feature/ABC-123-add-phone-field
```

## Checkpoint

By end of Day 3, you should have:

- [ ] Picked a starter task
- [ ] Created a feature branch
- [ ] Made changes following conventions
- [ ] Run tests successfully
- [ ] Created a pull request
- [ ] Received and addressed feedback

## What's Next?

You're now ready for real tasks! Continue learning:

- Read [Coding Standards](../coding-standards/typescript.md)
- Review [NestJS Patterns](../coding-standards/nestjs-patterns.md)
- Check [Tutorials](../tutorials/adding-new-endpoint.md) when building features

Ask your mentor when you're stuck. Everyone was new once.
