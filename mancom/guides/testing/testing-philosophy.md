# Testing Philosophy

## Why We Test

1. **Catch bugs early** - Before they reach production
2. **Enable refactoring** - Change code with confidence
3. **Document behavior** - Tests show how code should work
4. **Speed up development** - Automated tests are faster than manual testing

## Test Pyramid

```
        /\
       /  \         E2E Tests (few)
      /────\        - Full system tests
     /      \       - Slow, brittle
    /────────\      Integration Tests (some)
   /          \     - Component interaction
  /────────────\    - Medium speed
 /              \   Unit Tests (many)
/────────────────\  - Isolated functions
                    - Fast, reliable
```

| Level | What | How Many | Speed |
|-------|------|----------|-------|
| Unit | Single function/class | Many | Fast |
| Integration | Multiple components | Some | Medium |
| E2E | Full request flow | Few | Slow |

## What to Test

### Always Test
- Business logic (services)
- Validation rules
- Error conditions
- Edge cases

### Usually Test
- Controllers (integration)
- Guards
- Utilities

### Rarely Test
- Simple getters/setters
- Framework code
- Configuration

## What Not to Test

- Third-party libraries (they have their own tests)
- Database internals
- Framework internals
- Trivial code with no logic

## Coverage Expectations

| Area | Target |
|------|--------|
| Services | 80%+ |
| Guards | 80%+ |
| Utils | 90%+ |
| Controllers | 60%+ |
| Overall | 70%+ |

Coverage is a guide, not a goal. 100% coverage doesn't mean bug-free.

## Test Quality > Coverage

A few good tests are better than many poor tests.

Good tests:
- Test behavior, not implementation
- Are readable
- Are maintainable
- Run quickly
- Don't flake

## Test-Driven Development (Optional)

TDD can help but isn't required:

1. Write a failing test
2. Write minimal code to pass
3. Refactor
4. Repeat

Use when:
- Requirements are clear
- Building complex logic
- Fixing a bug (write test first)

## Testing New Features

When building a feature:

1. Write unit tests for service logic
2. Write integration tests for controllers
3. Manual testing for happy path
4. Consider edge cases

## Testing Bug Fixes

When fixing a bug:

1. Write a test that reproduces the bug
2. Verify test fails
3. Fix the bug
4. Verify test passes
5. This prevents regression
