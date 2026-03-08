# Pull Requests

## Before Creating a PR

Checklist:
- [ ] Code compiles (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Branch is up to date with develop
- [ ] Self-reviewed the diff

## PR Title

Follow commit message format:

```
feat(visitor): add approval workflow
fix(auth): handle expired refresh tokens
docs(readme): update setup instructions
```

## PR Description

Use the template. Fill in all sections:

### Summary

What does this PR do? (1-3 bullet points)

```markdown
## Summary

- Adds visitor approval and rejection endpoints
- Sends notification to resident when visitor is processed
- Updates visitor status in database
```

### Changes

List the main changes:

```markdown
## Changes

- Added `PATCH /visitors/:id/approve` endpoint
- Added `PATCH /visitors/:id/reject` endpoint
- Added NotificationService integration
- Added unit tests for new endpoints
```

### Related Issue

Link to the issue:

```markdown
## Related Issue

Closes #123
```

### Type of Change

Check the relevant box:

```markdown
## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] Tests
```

### Testing

How did you test this?

```markdown
## Testing

- [x] Unit tests added for VisitorsService.approve()
- [x] Unit tests added for VisitorsService.reject()
- [x] Manual testing via Postman
```

### Screenshots

If UI changes (rare for backend):

```markdown
## Screenshots

N/A (backend only)
```

### Notes for Reviewers

Anything specific to review:

```markdown
## Notes for Reviewers

Please pay extra attention to the notification logic in
`visitors.service.ts:89-105`. I'm not sure if we should
await the notification or fire-and-forget.
```

## PR Size

Keep PRs small and focused:

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| Small | < 200 | < 30 min |
| Medium | 200-500 | 30-60 min |
| Large | > 500 | Split it |

Large PRs take longer to review and are more likely to have bugs.

## Requesting Review

1. Assign reviewers (usually 1-2 people)
2. Add relevant labels
3. Link to related issues

## Responding to Feedback

### When you agree:
1. Make the change
2. Commit with descriptive message
3. Push
4. Reply "Done" or explain what you changed

### When you disagree:
1. Explain your reasoning
2. Ask for clarification if needed
3. Be open to other perspectives
4. Escalate to team lead if stuck

### Don't:
- Take feedback personally
- Make excuses
- Ignore comments
- Argue without data

## After Approval

PRs are squash-merged into develop:

1. Click "Squash and merge"
2. Edit the commit message if needed
3. Delete the branch

## Example PR

```markdown
## Summary

- Adds refresh token rotation for improved security

## Changes

- Modified `AuthService.refreshTokens()` to invalidate old token
- Added `TokenStoreService.invalidateToken()` method
- Updated unit tests

## Related Issue

Closes #45

## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Refactor

## Testing

- [x] Unit tests pass
- [x] Manual testing with Postman
- [x] Verified old token is rejected after refresh

## Notes for Reviewers

This changes the refresh behavior - old refresh tokens are now
invalidated immediately. This is more secure but means clients
can't use the same refresh token twice.
```

## Common PR Issues

| Issue | Solution |
|-------|----------|
| PR too large | Split into smaller PRs |
| Missing tests | Add tests before review |
| Merge conflicts | Rebase and resolve |
| CI failing | Fix locally, push |
| Unclear description | Update PR description |
