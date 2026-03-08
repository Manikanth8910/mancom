# Code Review Checklist

## As a Reviewer

Check these areas when reviewing code:

### Correctness
- [ ] Does the code do what it's supposed to?
- [ ] Are edge cases handled?
- [ ] Are errors handled appropriately?

### Security
- [ ] No SQL injection vulnerabilities
- [ ] Input is validated
- [ ] Sensitive data not logged
- [ ] Authorization checks in place

### Tests
- [ ] Tests exist for new code
- [ ] Tests cover happy path and edge cases
- [ ] Tests are readable and maintainable

### Code Quality
- [ ] Follows project conventions
- [ ] No unnecessary complexity
- [ ] No code duplication
- [ ] Clear naming
- [ ] Appropriate comments (why, not what)

### Performance
- [ ] No N+1 queries
- [ ] Appropriate use of async/await
- [ ] No memory leaks (unclosed streams, etc.)

### Documentation
- [ ] Public APIs have JSDoc
- [ ] README updated if needed
- [ ] Breaking changes documented

## How to Give Feedback

### Be Specific

```
# Bad
"This is confusing"

# Good
"The variable name `x` doesn't convey what it stores.
Consider renaming to `pendingVisitorCount`."
```

### Explain Why

```
# Bad
"Add a try/catch here"

# Good
"Add a try/catch here because this.httpService.get() can
throw on network errors, and we want to return a friendly
error to the client instead of a 500."
```

### Suggest Alternatives

```
# Bad
"Don't do it this way"

# Good
"Instead of looping through all visitors, consider using
a single query with a WHERE clause:
`repository.find({ where: { status: 'pending' } })`"
```

### Use Conventional Prefixes

| Prefix | Meaning |
|--------|---------|
| `nit:` | Minor style issue, optional |
| `suggestion:` | Alternative approach, optional |
| `question:` | Need clarification |
| `blocking:` | Must fix before merge |

```
nit: extra blank line here

suggestion: could simplify with optional chaining

question: why do we need this timeout?

blocking: this creates a SQL injection vulnerability
```

## As an Author

### Receiving Feedback

1. **Read carefully** - Understand what's being asked
2. **Don't take it personally** - It's about the code
3. **Ask questions** - If unclear, ask for clarification
4. **Thank reviewers** - They're helping improve your code

### Responding

```
# Good responses
"Good catch, fixed in abc123"
"Done - renamed to `visitorCount`"
"Discussed offline - keeping as is because [reason]"
"Question: should this also handle [edge case]?"

# Bad responses
"Whatever"
"I don't see why"
(no response)
```

## Common Review Comments

These comments appear frequently. Avoid them:

| Comment | How to Avoid |
|---------|--------------|
| "Add types" | Always add explicit types |
| "Handle the error" | Always handle promise rejections |
| "Add a test" | Write tests before submitting |
| "Too complex" | Keep functions small and focused |
| "Magic number" | Use named constants |
| "Unclear name" | Use descriptive names |

## Approval

### When to Approve

- Code is correct and secure
- Tests pass
- No blocking issues
- Minor issues can be addressed later

### When to Request Changes

- Security vulnerability
- Bug that will break functionality
- Missing critical tests
- Major architectural concern

## Review Timeline

- Respond to review requests within 1 business day
- If blocked, prioritize unblocking others
- If you can't review, say so and suggest someone else
