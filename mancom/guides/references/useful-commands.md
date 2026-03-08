# Useful Commands

Quick reference for common development commands.

## Make Commands

```bash
make setup          # First-time setup
make dev            # Start all services
make dev-auth       # Start auth service only
make dev-visitor    # Start visitor service only
make test           # Run all tests
make test-watch     # Run tests in watch mode
make test-cov       # Run tests with coverage
make lint           # Run linter
make lint-fix       # Auto-fix lint issues
make format         # Format code with Prettier
make docker-up      # Start Docker containers
make docker-down    # Stop Docker containers
make docker-logs    # View Docker logs
make clean          # Remove build artifacts
make generate-keys  # Generate JWT keys
make help           # Show all commands
```

## pnpm Commands

```bash
pnpm install        # Install dependencies
pnpm build          # Build all packages
pnpm dev            # Start all services
pnpm test           # Run all tests
pnpm lint           # Run linter
pnpm format         # Format code

# Filter to specific package
pnpm test --filter=@mancom/auth-service
pnpm build --filter=@mancom/common
pnpm dev --filter=@mancom/auth-service
```

## Turborepo Commands

```bash
turbo run build                    # Build all
turbo run build --filter=auth-*    # Build auth packages
turbo run test --parallel          # Run tests in parallel
turbo run dev --filter=!visitor-*  # Exclude visitor service
```

## Git Commands

```bash
# Branching
git checkout -b feature/ABC-123-desc  # Create branch
git checkout develop                   # Switch to develop
git branch -d feature/ABC-123-desc     # Delete local branch

# Syncing
git fetch origin                       # Fetch remote changes
git pull origin develop                # Pull develop
git rebase origin/develop              # Rebase on develop

# Committing
git add .                              # Stage all changes
git commit -m "feat(scope): message"   # Commit
git push -u origin feature/ABC-123     # Push and set upstream

# Undoing
git reset --soft HEAD~1                # Undo commit (keep changes)
git checkout -- <file>                 # Discard file changes
git stash                              # Stash changes
git stash pop                          # Restore stashed changes
```

## Docker Commands

```bash
# Container management
docker ps                              # List running containers
docker ps -a                           # List all containers
docker logs mancom-postgres            # View container logs
docker logs -f mancom-postgres         # Follow logs

# Docker Compose
docker compose -f docker/docker-compose.yml up -d
docker compose -f docker/docker-compose.yml down
docker compose -f docker/docker-compose.yml logs -f

# Cleanup
docker system prune                    # Remove unused data
docker volume prune                    # Remove unused volumes
```

## Database Commands

```bash
# Connect to PostgreSQL
docker exec -it mancom-postgres psql -U mancom -d mancom

# Common psql commands
\l                     # List databases
\dt                    # List tables
\d visitors            # Describe table
\q                     # Quit

# Run SQL
docker exec -it mancom-postgres psql -U mancom -d mancom -c "SELECT * FROM visitors LIMIT 5;"
```

## Redis Commands

```bash
# Connect to Redis
docker exec -it mancom-redis redis-cli

# Common redis-cli commands
KEYS *                 # List all keys
GET key               # Get value
DEL key               # Delete key
FLUSHDB               # Clear database
```

## Testing Commands

```bash
# Run specific test file
pnpm test -- visitors.service.spec.ts

# Run tests matching pattern
pnpm test -- --testNamePattern="should approve"

# Run with verbose output
pnpm test -- --verbose

# Update snapshots
pnpm test -- -u
```

## Debugging Commands

```bash
# Check what's using a port
lsof -i :3001

# Watch a file for changes
tail -f logs/app.log

# Check Node.js version
node --version

# Check pnpm version
pnpm --version

# List installed packages
pnpm list --depth=0
```

## API Testing (curl)

```bash
# Health check
curl http://localhost:3001/health

# With authentication
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/auth/me

# POST request
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"appwriteJwt":"..."}' \
  http://localhost:3001/auth/token

# Pretty print JSON
curl http://localhost:3001/health | jq
```

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `make dev` |
| Run tests | `make test` |
| Fix lint errors | `make lint-fix` |
| Start containers | `make docker-up` |
| View logs | `make docker-logs` |
| Create branch | `git checkout -b feature/ABC-123-desc` |
| Commit changes | `git commit -m "type(scope): message"` |
| Push branch | `git push -u origin <branch>` |
