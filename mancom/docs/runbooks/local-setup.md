# Local Development Setup

## Prerequisites

| Tool | Version | Check | Install |
|------|---------|-------|---------|
| Node.js | 20+ | `node --version` | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `pnpm --version` | `npm install -g pnpm` |
| Docker | 20+ | `docker --version` | [docker.com](https://docs.docker.com/get-docker/) |
| Git | 2.30+ | `git --version` | [git-scm.com](https://git-scm.com) |

## Quick Setup

```bash
# Clone repository
git clone <repo-url>
cd mancom-backend

# Run setup script
make setup
```

The setup script will:
1. Check prerequisites
2. Install dependencies
3. Generate JWT keys
4. Create .env files
5. Start Docker containers
6. Build packages

## Manual Setup

If the script fails, follow these steps:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Generate JWT Keys

```bash
./scripts/generate-keys.sh
```

This creates `keys/private.pem` and `keys/public.pem`.

### 3. Configure Environment

```bash
cp .env.example .env
cp services/auth-service/.env.example services/auth-service/.env
```

Edit `.env` files with your Appwrite credentials:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

### 4. Start Docker Containers

```bash
make docker-up
```

This starts PostgreSQL and Redis.

### 5. Build Packages

```bash
pnpm build
```

### 6. Start Development Server

```bash
make dev
```

## Verification

### Check Services

```bash
# Auth service health
curl http://localhost:3001/health

# Expected response:
# {"success":true,"data":{"status":"ok","service":"auth-service",...}}
```

### Check Docker

```bash
docker ps

# Should show:
# mancom-postgres
# mancom-redis
```

### Check Database

```bash
docker exec -it mancom-postgres psql -U mancom -d mancom -c '\l'
```

## IDE Setup

### VS Code

Install recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker"
  ]
}
```

Configure settings:

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Troubleshooting

### pnpm install fails

```bash
# Clear cache and retry
pnpm store prune
rm -rf node_modules
pnpm install
```

### Docker containers won't start

```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.yml
```

### JWT key errors

```bash
# Regenerate keys
rm -rf keys/
./scripts/generate-keys.sh

# Verify paths in .env
cat .env | grep JWT
```

### Build errors

```bash
# Clean and rebuild
make clean
pnpm install
pnpm build
```

See [Common Issues](common-issues.md) for more troubleshooting.
