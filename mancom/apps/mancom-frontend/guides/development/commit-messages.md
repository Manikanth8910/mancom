# Commit Messages

## Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

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
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

## Scope (Optional)

The scope indicates what part of the codebase is affected:

- `auth` - Authentication
- `nav` - Navigation
- `ui` - UI components
- `store` - Redux store
- `api` - API client/services
- Screen names: `home`, `visitors`, `payments`

## Examples

### Features

```
feat(auth): add OTP verification screen

feat(visitors): implement visitor list with filters

feat(ui): add loading spinner component
```

### Bug Fixes

```
fix(auth): prevent double OTP submission

fix(nav): handle back navigation on Android

fix(home): correct welcome message display
```

### Other Types

```
docs: update README with setup instructions

style(ui): format Button component

refactor(auth): extract validation logic

test(store): add authSlice tests

chore: update React Native to 0.73
```

## Guidelines

### Subject Line

1. **Use imperative mood** ("add" not "added" or "adds")
   ```
   feat: add visitor screen     ✓
   feat: added visitor screen   ✗
   feat: adding visitor screen  ✗
   ```

2. **Don't capitalize first letter**
   ```
   feat: add feature     ✓
   feat: Add feature     ✗
   ```

3. **No period at end**
   ```
   feat: add feature     ✓
   feat: add feature.    ✗
   ```

4. **Keep under 72 characters**

### Body (Optional)

Use when the change needs explanation:

```
fix(auth): handle expired refresh token

When the refresh token is expired, the app was crashing.
Now it redirects to login screen gracefully.
```

### Breaking Changes

Use `!` for breaking changes:

```
feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase keys
instead of snake_case.
```

## Anti-Patterns

```
# Too vague
fix: bug fix
feat: updates
chore: stuff

# Not imperative
feat: added new feature
fix: fixing the bug

# Too long
feat(visitors): add new visitor list screen with search functionality and filtering options and sorting by date

# Unnecessary details
feat: add Button component (WIP, still needs styling, will finish tomorrow)
```

## Commit Frequency

- **Commit early, commit often**
- Each commit should be a logical unit
- Commits should compile and pass tests
- OK to squash commits when merging PR
