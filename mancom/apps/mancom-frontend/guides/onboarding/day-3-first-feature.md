# Day 3: Your First Feature

Today you'll make your first code change and create a pull request.

## The Task

Add a "Last Login" timestamp display to the Home screen.

This is a simple task that will teach you:
1. How to modify a screen
2. How to work with Redux state
3. Our git workflow
4. How to create a PR

## Step 1: Create a Branch

```bash
# Make sure you're on develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/home-last-login
```

## Step 2: Understand the Current Code

Open `src/screens/home/HomeScreen.tsx`:

```typescript
export function HomeScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  // ...
}
```

The screen already has access to user data from Redux.

## Step 3: Make the Change

Add a "Last Login" text below the welcome message.

### 3.1 Add the import

```typescript
import { formatDate, formatTime } from '../../core/utils';
```

### 3.2 Add the display

Find the `welcomeText` and add below it:

```typescript
<Text style={styles.welcomeText}>Welcome, {displayName}!</Text>

{/* Add this */}
<Text style={styles.lastLogin}>
  Last login: {formatDate(new Date())} at {formatTime(new Date())}
</Text>
```

### 3.3 Add the style

Add to the styles object:

```typescript
lastLogin: {
  fontSize: theme.fontSize.sm,
  color: theme.colors.text.secondary,
  marginBottom: theme.spacing.lg,
},
```

## Step 4: Test Your Change

1. Run the app: `npm run ios` or `npm run android`
2. Log in (the login is mocked, any phone number works)
3. Verify you see "Last login: [date] at [time]"

## Step 5: Run Checks

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm test
```

All should pass.

## Step 6: Commit Your Changes

```bash
# Stage changes
git add src/screens/home/HomeScreen.tsx

# Commit with conventional message
git commit -m "feat(home): add last login timestamp display"
```

## Step 7: Push and Create PR

```bash
# Push your branch
git push -u origin feature/home-last-login
```

Then create a PR on GitHub with:

**Title:** `feat(home): add last login timestamp display`

**Description:**
```markdown
## Summary
Adds a "Last login" timestamp display to the Home screen below the welcome message.

## Changes
- Added last login text to HomeScreen
- Used existing formatDate and formatTime utilities

## Testing
- [x] Manually tested on iOS simulator
- [x] TypeScript check passes
- [x] Lint passes
```

## Understanding What You Did

1. **Created a branch** - Following our naming convention
2. **Made a small, focused change** - One feature per PR
3. **Used existing utilities** - Reused `formatDate` and `formatTime`
4. **Followed styling patterns** - Used theme constants
5. **Ran checks** - Ensured code quality
6. **Wrote a good commit message** - Conventional commits format
7. **Created a descriptive PR** - Helps reviewers understand the change

## Next Steps

Now that you've completed onboarding:

1. Review the [Coding Standards](../coding-standards/)
2. Learn about [Redux Patterns](../coding-standards/redux-patterns.md)
3. Check the [Tutorials](../tutorials/) for more complex tasks
4. Pick up a task from the issue tracker

## Tips for Success

- **Ask questions** - Don't spend hours stuck on something
- **Make small PRs** - Easier to review and less risky
- **Test your changes** - Manual testing catches obvious issues
- **Read existing code** - Learn patterns from what's already there
- **Follow conventions** - Consistency helps everyone
