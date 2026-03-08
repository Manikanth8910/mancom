# Contributing to Mancom App

Thank you for your interest in contributing to the Mancom App!

## Getting Started

1. Read the [Day 1 Setup Guide](./guides/onboarding/day-1-setup.md) to set up your environment
2. Review the [Day 2 Codebase Tour](./guides/onboarding/day-2-codebase-tour.md) to understand the project
3. Check out the [Coding Standards](./guides/coding-standards/) before writing code

## Development Workflow

### 1. Pick a Task

- Check the issue tracker for available tasks
- Look for issues labeled `good first issue` if you're new

### 2. Create a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Follow [branch naming conventions](./guides/development/branch-naming.md).

### 3. Make Changes

- Follow our [coding standards](./guides/coding-standards/)
- Write tests for new functionality
- Keep changes focused and atomic

### 4. Test Your Changes

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Run tests
npm test

# Manual testing
npm run ios  # or android
```

### 5. Commit

Follow [conventional commits](./guides/development/commit-messages.md):

```bash
git commit -m "feat(visitors): add visitor list screen"
```

### 6. Push and Create PR

```bash
git push -u origin feature/your-feature-name
```

Then create a PR on GitHub following our [PR guidelines](./guides/development/pull-requests.md).

## Code Review

- PRs require at least one approval
- Address all review comments
- Keep PRs small and focused

## Questions?

- Check the [documentation](./docs/)
- Ask in the team channel
- Open a GitHub issue

## Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Help others learn and grow
