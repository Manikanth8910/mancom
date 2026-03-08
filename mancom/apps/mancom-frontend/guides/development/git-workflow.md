# Git Workflow

## Branch Strategy

We use a simplified Git Flow:

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/xxx
        ├── fix/xxx
        └── chore/xxx
```

### Main Branches

- **main** - Production-ready code. Only merged from develop.
- **develop** - Integration branch. All features merge here first.

### Feature Branches

Create from develop, merge back to develop:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/visitor-list
```

## Daily Workflow

### Starting Work

```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature
```

### During Development

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat: add visitor card component"

# Push to remote
git push -u origin feature/my-feature
```

### Creating a PR

1. Push your branch
2. Open GitHub and create PR to `develop`
3. Fill in the PR template
4. Request reviews

### After PR Approval

1. Squash and merge (or merge commit)
2. Delete the feature branch
3. Pull develop locally

```bash
git checkout develop
git pull origin develop
git branch -d feature/my-feature
```

## Release Process

1. Create release branch from develop
   ```bash
   git checkout develop
   git checkout -b release/1.0.0
   ```

2. Bump version, fix bugs

3. Merge to main AND develop
   ```bash
   git checkout main
   git merge release/1.0.0
   git tag v1.0.0

   git checkout develop
   git merge release/1.0.0
   ```

4. Delete release branch

## Hotfix Process

For urgent production fixes:

```bash
git checkout main
git checkout -b hotfix/critical-bug
# Fix the bug
git commit -m "fix: critical auth bug"
git checkout main
git merge hotfix/critical-bug
git tag v1.0.1
git checkout develop
git merge hotfix/critical-bug
```

## Best Practices

### Keep Branches Small

- One feature per branch
- Break large features into smaller PRs
- Delete branches after merging

### Stay Up to Date

Regularly rebase on develop:

```bash
git checkout develop
git pull origin develop
git checkout feature/my-feature
git rebase develop
```

### Resolve Conflicts Carefully

1. Understand both changes
2. Test after resolving
3. Get a second opinion if unsure

### Don't Force Push to Shared Branches

- Never force push to main or develop
- Be careful with force push on feature branches others are using
