# Pull Requests

## Creating a PR

### Before Creating

1. **Ensure all checks pass locally**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

2. **Test your changes manually**
   - Run on iOS simulator
   - Run on Android emulator
   - Test edge cases

3. **Rebase on latest develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/my-feature
   git rebase develop
   ```

### PR Title

Use conventional commit format:

```
feat(visitors): add visitor list screen
fix(auth): handle token refresh failure
chore: update dependencies
```

### PR Description

Use the template:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Specific change 1
- Specific change 2
- Specific change 3

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Testing
- [x] Manually tested on iOS
- [x] Manually tested on Android
- [x] Unit tests added

## Screenshots
(If applicable)
```

## Code Review

### As an Author

1. **Respond to all comments**
   - Resolve if addressed
   - Explain if you disagree

2. **Keep the PR small**
   - Easier to review
   - Fewer conflicts
   - Faster to merge

3. **Don't take it personally**
   - Feedback is about code, not you

### As a Reviewer

1. **Be kind and constructive**
   ```
   # Good
   "Consider using useMemo here for performance"

   # Bad
   "This is wrong"
   ```

2. **Explain why, not just what**
   ```
   # Good
   "This could cause a memory leak because the listener isn't removed. Consider adding cleanup in useEffect."

   # Bad
   "Add cleanup"
   ```

3. **Distinguish must-fix from nice-to-have**
   ```
   [blocker] This will crash on Android
   [nit] Typo in comment
   [suggestion] Could use a custom hook here
   ```

## Review Checklist

### Code Quality

- [ ] Follows coding standards
- [ ] No TypeScript errors
- [ ] No eslint warnings
- [ ] Appropriate error handling
- [ ] No hardcoded values

### Logic

- [ ] Correct behavior
- [ ] Edge cases handled
- [ ] No obvious bugs
- [ ] Performance considered

### Testing

- [ ] Unit tests for new logic
- [ ] Existing tests pass
- [ ] Manual testing documented

### Security

- [ ] No sensitive data exposed
- [ ] Inputs validated
- [ ] Tokens handled securely

## Merging

### Who Merges

- Author merges after approval
- Or reviewer if author requests

### Merge Strategy

Use "Squash and merge" for:
- Multiple small commits
- WIP commits during development

Use "Merge commit" for:
- Feature branches with meaningful commit history
- Release branches

### After Merging

1. Delete the feature branch
2. Pull develop locally
3. Celebrate 🎉

## Stale PRs

PRs without activity for 7+ days will be marked stale:

1. Update or close stale PRs
2. If blocked, comment explaining why
3. Don't let PRs linger
