#!/bin/bash

# Setup script for Mancom backend development environment
# Run from repository root: ./scripts/setup.sh

set -e

echo "=========================================="
echo "  Mancom Backend Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

check_version() {
    local cmd=$1
    local required=$2
    local version=$($cmd --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)

    if [ -n "$version" ]; then
        echo "  Version: $version (required: $required+)"
    fi
}

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

MISSING_DEPS=0

if ! check_command "node"; then
    echo "  Install Node.js 20+: https://nodejs.org/"
    MISSING_DEPS=1
else
    check_version "node" "20"
fi

if ! check_command "pnpm"; then
    echo "  Install pnpm: npm install -g pnpm"
    MISSING_DEPS=1
else
    check_version "pnpm" "8"
fi

if ! check_command "docker"; then
    echo "  Install Docker: https://docs.docker.com/get-docker/"
    MISSING_DEPS=1
fi

if ! check_command "openssl"; then
    echo "  Install OpenSSL (usually pre-installed)"
    MISSING_DEPS=1
fi

echo ""

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "${RED}Please install missing dependencies and run this script again.${NC}"
    exit 1
fi

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
pnpm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 3: Generate JWT keys
echo "Step 3: Generating JWT keys..."
if [ -f "./keys/private.pem" ] && [ -f "./keys/public.pem" ]; then
    echo -e "${YELLOW}!${NC} Keys already exist, skipping generation"
else
    ./scripts/generate-keys.sh
fi
echo ""

# Step 4: Setup environment files
echo "Step 4: Setting up environment files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env from .env.example"
else
    echo -e "${YELLOW}!${NC} .env already exists, skipping"
fi

if [ ! -f "services/auth-service/.env" ]; then
    cp services/auth-service/.env.example services/auth-service/.env
    echo -e "${GREEN}✓${NC} Created services/auth-service/.env"
else
    echo -e "${YELLOW}!${NC} services/auth-service/.env already exists, skipping"
fi

echo ""

# Step 5: Start Docker containers
echo "Step 5: Starting Docker containers..."
docker compose -f docker/docker-compose.yml up -d
echo -e "${GREEN}✓${NC} Docker containers started"
echo ""

# Step 6: Build packages
echo "Step 6: Building packages..."
pnpm build
echo -e "${GREEN}✓${NC} Packages built"
echo ""

# Done
echo "=========================================="
echo -e "${GREEN}  Setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Update .env files with your Appwrite credentials"
echo "  2. Run 'make dev' to start development servers"
echo "  3. Auth service will be available at http://localhost:3001"
echo ""
echo "Useful commands:"
echo "  make dev        - Start all services"
echo "  make test       - Run tests"
echo "  make docker-up  - Start Docker containers"
echo ""
echo "See docs/runbooks/local-setup.md for detailed instructions."
