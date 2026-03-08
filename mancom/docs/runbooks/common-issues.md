# Common Issues

## Setup Issues

### Q: `pnpm install` fails with EACCES error

**Cause:** Permission issues with npm global directory.

**Solution:**
```bash
# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall pnpm
npm install -g pnpm
```

### Q: Docker containers won't start - port already in use

**Cause:** Another process is using port 5432 or 6379.

**Solution:**
```bash
# Find what's using the port
lsof -i :5432

# Option 1: Stop the conflicting service
sudo systemctl stop postgresql

# Option 2: Change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 externally
```

### Q: "Cannot find module '@mancom/common'"

**Cause:** Packages not built or linked.

**Solution:**
```bash
pnpm build
```

### Q: Keys not found error on startup

**Cause:** JWT keys not generated or wrong path.

**Solution:**
```bash
# Generate keys
./scripts/generate-keys.sh

# Verify paths in .env
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# Check keys exist
ls -la keys/
```

## Runtime Issues

### Q: "INVALID_TOKEN" error on all requests

**Possible causes:**

1. Token expired - check `exp` claim
2. Wrong issuer/audience - check JWT config
3. Public key mismatch - regenerate keys

**Debug:**
```bash
# Decode token (without verification)
echo "<token>" | cut -d'.' -f2 | base64 -d | jq
```

### Q: "INVALID_APPWRITE_SESSION" on token exchange

**Possible causes:**

1. Appwrite JWT expired (15 min default)
2. Wrong Appwrite project ID
3. Invalid Appwrite API key

**Solution:**
1. Get fresh JWT from Appwrite
2. Check APPWRITE_* env vars match your project
3. Regenerate API key in Appwrite console

### Q: Redis connection refused

**Cause:** Redis not running or wrong host.

**Solution:**
```bash
# Start Redis
make docker-up

# Check it's running
docker ps | grep redis

# Test connection
docker exec -it mancom-redis redis-cli ping
```

### Q: Database connection timeout

**Cause:** PostgreSQL not running or wrong credentials.

**Solution:**
```bash
# Start database
make docker-up

# Check credentials match docker-compose.yml
DATABASE_USER=mancom
DATABASE_PASSWORD=mancom_dev_password
DATABASE_NAME=mancom
```

## Development Issues

### Q: Changes not reflecting after save

**Cause:** Watch mode not running or build cache.

**Solution:**
```bash
# Make sure you're running in watch mode
make dev

# If still not working, restart
# Ctrl+C then make dev
```

### Q: TypeScript errors after pulling changes

**Cause:** Dependencies changed or build out of sync.

**Solution:**
```bash
pnpm install
pnpm build
```

### Q: Tests fail with "Cannot find module"

**Cause:** Jest not finding built packages.

**Solution:**
```bash
# Build packages first
pnpm build

# Run tests
pnpm test
```

### Q: ESLint errors on unchanged files

**Cause:** ESLint cache out of date.

**Solution:**
```bash
# Clear ESLint cache
rm -rf .eslintcache
pnpm lint
```

## Git Issues

### Q: Pre-commit hook fails

**Cause:** Lint or format errors.

**Solution:**
```bash
# Fix automatically
make lint-fix
make format

# Check what's wrong
pnpm lint
```

### Q: Cannot push - branch out of date

**Solution:**
```bash
git fetch origin
git rebase origin/develop
# Resolve conflicts if any
git push
```

## Performance Issues

### Q: Service using too much memory

**Cause:** Memory leak or large data processing.

**Solution:**
1. Check for unclosed connections
2. Review database queries (pagination)
3. Add memory limits:

```bash
# Run with memory limit
NODE_OPTIONS="--max-old-space-size=512" make dev
```

### Q: Slow startup time

**Cause:** Many dependencies loading.

**Solution:**
- This is normal for development
- Production builds are faster
- Use `--watch` to keep server running

## Getting Help

1. Check this page first
2. Search existing GitHub issues
3. Ask in team Slack channel
4. Create an issue with:
   - Error message
   - Steps to reproduce
   - Environment details
