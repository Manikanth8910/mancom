.PHONY: setup start dev dev-auth dev-visitor test test-watch test-cov lint lint-fix format \
        docker-up docker-down docker-logs clean generate-keys help

# Default target
.DEFAULT_GOAL := help

# Setup
setup: ## Run initial setup (install deps, generate keys, start docker)
	./scripts/setup.sh

generate-keys: ## Generate RS256 JWT key pair
	./scripts/generate-keys.sh

# Start all backend services (one command)
start: ## Start all backend services (auth, visitor, api-gateway)
	./scripts/start-dev.sh

# Development
dev: ## Start all services in watch mode
	pnpm dev

dev-auth: ## Start only auth-service in watch mode
	pnpm dev:auth

dev-visitor: ## Start only visitor-service in watch mode
	pnpm dev:visitor

# Testing
test: ## Run all tests
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm test:watch

test-cov: ## Run tests with coverage
	pnpm test:cov

# Linting and Formatting
lint: ## Run ESLint on all packages
	pnpm lint

lint-fix: ## Fix ESLint issues
	pnpm lint:fix

format: ## Format code with Prettier
	pnpm format

format-check: ## Check code formatting
	pnpm format:check

# Docker
docker-up: ## Start Docker containers (postgres, redis)
	docker compose -f docker/docker-compose.yml up -d

docker-down: ## Stop Docker containers
	docker compose -f docker/docker-compose.yml down

docker-logs: ## Show Docker container logs
	docker compose -f docker/docker-compose.yml logs -f

docker-test-up: ## Start test Docker containers
	docker compose -f docker/docker-compose.test.yml up -d

docker-test-down: ## Stop test Docker containers
	docker compose -f docker/docker-compose.test.yml down

# Build
build: ## Build all packages and services
	pnpm build

# Cleanup
clean: ## Remove build artifacts and node_modules
	pnpm clean
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf services/*/node_modules

# Help
help: ## Show this help message
	@echo "Mancom Backend - Available Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make setup     # First-time setup"
	@echo "  make dev       # Start development"
	@echo "  make test      # Run tests"
