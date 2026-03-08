# Day 1: Environment Setup

Goal: Get the project running on your machine.

## Account Setup

Before starting, ensure you have access to:

- [ ] GitHub organization
- [ ] Appwrite console (ask your mentor)
- [ ] Team Slack channel

## 1. Install Prerequisites

Install these if you don't have them:

| Tool | Install Command | Verify |
|------|-----------------|--------|
| Node.js 20+ | [Download](https://nodejs.org) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |
| Docker | [Download](https://docker.com) | `docker --version` |
| VS Code | [Download](https://code.visualstudio.com) | - |

## 2. Clone the Repository

```bash
git clone <repo-url>
cd mancom-backend
```

## 3. Run Setup

```bash
make setup
```

This will:
- Install dependencies
- Generate JWT keys
- Create environment files
- Start Docker containers
- Build packages

Watch for any errors. If setup fails, see [Common Issues](../../docs/runbooks/common-issues.md).

## 4. Configure Appwrite

Edit `services/auth-service/.env`:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<get from mentor>
APPWRITE_API_KEY=<get from mentor>
```

## 5. Start Development Server

```bash
make dev
```

You should see:

```
Auth service running on http://0.0.0.0:3001
```

## 6. Verify It Works

Open a new terminal:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{"success":true,"data":{"status":"ok","service":"auth-service",...}}
```

## 7. IDE Setup

### VS Code Extensions

Install these extensions:
- ESLint
- Prettier
- Docker (optional)

### Recommended Settings

VS Code should auto-detect project settings. If not, check `.vscode/settings.json` exists.

## Checkpoint

By end of Day 1, you should have:

- [ ] All prerequisites installed
- [ ] Repository cloned
- [ ] `make setup` completed successfully
- [ ] Environment files configured
- [ ] `make dev` runs without errors
- [ ] Health endpoint responds

## Troubleshooting

### "Command not found: pnpm"

```bash
npm install -g pnpm
# Close and reopen terminal
```

### Docker permission denied

```bash
# Add yourself to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

### Port already in use

```bash
# Find what's using port 5432
lsof -i :5432
# Stop it or change port in docker-compose.yml
```

## Next

Continue to [Day 2: Codebase Tour](day-2-codebase-tour.md).
