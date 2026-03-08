# Git Workflow

## Branch Strategy

```
main ─────────────────────────────────────────────────► (production)
  │
  └─► develop ────────────────────────────────────────► (staging)
        │
        ├─► feature/ABC-123-visitor-approval ──► merge
        │
        ├─► feature/ABC-124-notifications ─────► merge
        │
        └─► fix/ABC-125-token-expiry ──────────► merge
```

### Branches

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production code | Production |
| `develop` | Integration branch | Staging |
| `feature/*` | New features | - |
| `fix/*` | Bug fixes | - |
| `hotfix/*` | Urgent production fixes | - |

## Daily Workflow

### 1. Start a New Task

```bash
# Update develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ABC-123-short-description
```

### 2. Work on Your Task

Make commits as you work:

```bash
git add .
git commit -m "feat(visitors): add approval endpoint"
```

Keep commits small and focused.

### 3. Keep Your Branch Updated

Regularly sync with develop:

```bash
git fetch origin
git rebase origin/develop
```

If conflicts occur:
1. Resolve conflicts in your editor
2. `git add .`
3. `git rebase --continue`

### 4. Push and Create PR

```bash
git push -u origin feature/ABC-123-short-description
```

Create PR on GitHub targeting `develop`.

### 5. After Approval

The PR will be squash-merged into develop.

```bash
# Clean up local branch
git checkout develop
git pull origin develop
git branch -d feature/ABC-123-short-description
```

## Merge vs Rebase

### Use Rebase for:
- Keeping feature branches up to date with develop
- Cleaning up local commit history before PR

```bash
# Update feature branch with develop
git rebase origin/develop
```

### Use Merge for:
- PRs are squash-merged via GitHub

### Never:
- Rebase public/shared branches
- Force push to main or develop

## Handling Conflicts

When conflicts occur during rebase:

1. Git will pause and show conflicting files
2. Open each file and look for conflict markers:
   ```
   <<<<<<< HEAD
   your changes
   =======
   their changes
   >>>>>>> branch-name
   ```
3. Edit to keep the correct code (remove markers)
4. Stage resolved files: `git add <file>`
5. Continue rebase: `git rebase --continue`
6. If stuck: `git rebase --abort` to start over

## Workflow Diagram

```
┌─────────────┐
│ Pick task   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Create      │
│ branch      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Write code  │────►│ Commit      │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │◄──────────────────┘
       │
       ▼
┌─────────────┐
│ Push +      │
│ Create PR   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ Code review │────►│ Address     │
│ feedback    │     │ feedback    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       │◄──────────────────┘
       │
       ▼
┌─────────────┐
│ Squash      │
│ merge       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Delete      │
│ branch      │
└─────────────┘
```

## Hotfixes

For urgent production fixes:

```bash
# Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/ABC-999-critical-fix

# Make fix, commit, push
git push -u origin hotfix/ABC-999-critical-fix

# Create PR to main (not develop)
# After merge to main, also merge to develop
```

## Common Commands

```bash
# View branch status
git status

# View commit history
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- <file>

# Stash changes temporarily
git stash
git stash pop

# View all branches
git branch -a
```
