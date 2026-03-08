# Branch Naming

## Format

```
<type>/<short-description>
```

## Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature` | New features | `feature/visitor-list` |
| `fix` | Bug fixes | `fix/login-crash` |
| `chore` | Maintenance tasks | `chore/update-deps` |
| `docs` | Documentation only | `docs/api-guide` |
| `refactor` | Code refactoring | `refactor/auth-flow` |
| `test` | Adding tests | `test/auth-slice` |

## Rules

1. **Use lowercase**
   ```
   feature/add-payments     ✓
   feature/Add-Payments     ✗
   ```

2. **Use hyphens, not underscores or spaces**
   ```
   feature/visitor-list     ✓
   feature/visitor_list     ✗
   feature/visitor list     ✗
   ```

3. **Keep it short but descriptive**
   ```
   feature/visitors         ✓ (if obvious)
   feature/visitor-list     ✓
   feature/add-visitor-list-with-filtering-and-sorting     ✗ (too long)
   ```

4. **Include ticket number if applicable**
   ```
   feature/MAN-123-visitor-list
   fix/MAN-456-login-crash
   ```

## Examples

### Feature Branches

```
feature/visitor-management
feature/payment-history
feature/otp-resend
feature/dark-mode
```

### Bug Fix Branches

```
fix/login-validation
fix/token-refresh
fix/keyboard-overlap
```

### Chore Branches

```
chore/update-react-native
chore/add-linting
chore/clean-unused-code
```

### Documentation Branches

```
docs/setup-guide
docs/api-docs
docs/contributing
```

## Anti-Patterns

```
# Too vague
feature/updates
fix/bug

# Too long
feature/add-new-visitor-screen-with-form-validation-and-api-integration

# Wrong separator
feature/add_visitor
feature/add.visitor

# No type prefix
visitor-list
updates

# Personal naming
my-branch
wip
test-branch
```
