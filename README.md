# Mancom - Residential Society Management Platform

Welcome to **Mancom**, a modern, production-ready platform designed to streamline management for residential societies. This monorepo contains the complete ecosystem, including high-performance microservices and a feature-rich mobile application.

---

## 🏗 Project Structure

The project is organized as a monorepo using **pnpm workspaces** and **Turborepo** for optimal development workflow.

```
.
├── mancom/                    # Core project directory
│   ├── apps/                  # Client applications
│   │   └── mancom-frontend/   # React Native mobile app (iOS/Android)
│   ├── services/              # Backend microservices (NestJS)
│   │   ├── api-gateway/       # Central entry point
│   │   ├── auth-service/      # Authentication & Authorization
│   │   ├── visitor-service/   # Visitor management
│   │   └── parking-service/   # Parking slot management
│   ├── packages/              # Shared libraries
│   │   ├── common/            # Shared utilities, guards, and interfaces
│   │   ├── database/          # Prisma schema and database clients
│   │   └── jwt-utils/         # RS256 JWT signing and verification
│   ├── docker/                # Infrastructure (PostgreSQL, Redis)
│   └── scripts/               # Automation and setup scripts
└── README.md                  # This file
```

---

## ⚡️ Quick Start

### 📋 Prerequisites

Ensure you have the following installed:
- **Node.js**: `v20.0.0+`
- **pnpm**: `v8.0.0+`
- **Docker & Docker Compose**: For running databases and cache.
- **iOS/Android Setup**: (For frontend) CocoaPods for iOS, Android SDK for Android.

### 🚀 Setup Instructions

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repo-url>
   cd mancom
   ```

2. **Initialize the Project**:
   Run the automated setup script which installs dependencies, generates security keys, starts Docker containers, and builds the project.
   ```bash
   # From the core directory
   cd mancom
   make setup
   ```

3. **Generate Security Keys**:
   Mancom uses RS256 for secure JWT signing. Generate your own key pair:
   ```bash
   make generate-keys
   ```

4. **Environment Configuration**:
   Copy the example environment file and update your variables:
   ```bash
   cp .env.example .env
   ```

5. **Run the Services**:
   Start all backend services in development mode:
   ```bash
   make dev
   ```

6. **Launch the Mobile App**:
   Navigate to the frontend directory and start the application:
   ```bash
   cd apps/mancom-frontend
   pnpm install
   # For iOS
   pnpm pod-install
   pnpm ios
   # For Android
   pnpm android
   ```

---

## 🛠 Tech Stack

| Domain | Technology |
|---|---|
| **Monorepo Management** | pnpm, Turborepo |
| **Backend Framework** | NestJS (Node.js) |
| **Mobile App** | React Native (TypeScript) |
| **Databases** | PostgreSQL (Relational), Redis (Cache) |
| **Authentication** | Hybrid (Appwrite + Custom RS256 JWTs) |
| **ORMs** | Prisma |
| **Security** | Helmet.js, JWT (RS256), Rate Limiting |

---

## 🔐 Security & Environment

- **Strict Environment Security**: Actual `.env` files are ignored by git to prevent sensitive data leaks.
- **Asymmetric Encryption**: We use private/public key pairs (RS256) for secure token-based authentication.
- **Microservices Isolation**: Services communicate securely, with the API Gateway acting as the single entry point.

---

## 📜 Available Commands (Makefile)

| Command | Description |
|---|---|
| `make setup` | Full initial setup for development |
| `make dev` | Start all backend services in watch mode |
| `make start` | Run all production-build services |
| `make test` | Run all unit and integration tests |
| `make docker-up` | Spin up infrastructure (PostgreSQL, Redis) |
| `make clean` | Remove all build artifacts and node_modules |

---

## 🤝 Contributing

We welcome contributions! Please refer to the `CONTRIBUTING.md` file in each respective directory for coding standards and PR processes.

---

## 📄 License

**UNLICENSED** - Proprietary software. All rights reserved.
