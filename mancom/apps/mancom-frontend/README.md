# Mancom Mobile App

React Native mobile application for Mancom - a modern residential society management platform.

## Overview

This is the resident-facing mobile app that provides a beautiful, fully functional experience for:
- Phone-based OTP authentication
- Real-time Dashboard
- **Visitor Management:** Pre-approve Expected Guests (QR Codes) & Track active Daily Staff
- **Payments:** Auto-Invoicing, Balance calculation & Automated Late fees
- **Helpdesk:** Create tickets with media attachments & SLA lifecycle tracking 
- **Community Hub:** Digital notices, Facility amenity booking, and resident Opinion Polls.
- User profile (coming soon)

## Tech Stack

- **React Native** 0.83+
- **TypeScript** 5+
- **Redux Toolkit** with redux-persist
- **React Navigation** (native-stack + bottom-tabs)
- **Vanilla StyleSheet** for styling featuring a modern Blue/Slate UI
- **Axios** for API calls
- **React Native Keychain** for secure storage

## Quick Start

### Prerequisites

- Node.js 20+
- Watchman (macOS)
- Xcode (for iOS)
- Android Studio (for Android)

### Setup

```bash
# Move to frontend directory
cd apps/mancom-frontend

# Install dependencies (or use `make setup`)
npm install

# Install iOS Pods
cd ios && pod install && cd ..
```

### Running the App

Depending on your environment, you will need two terminal windows for mobile development.

**Terminal 1 (Metro Bundler Dev Server):**
```bash
# From the apps/mancom-frontend directory
npm start
```

**Terminal 2 (Build application to Emulator):**
Leave Terminal 1 running, and in a new terminal run:
```bash
# For iOS Simulator
npm run ios

# For Android Emulator
npm run android
```
*(Alternatively, you can just press `i` or `a` inside the Metro Bundler terminal once it's running)*

### Testing

```bash
# Run Jest tests
npm run test

# Run Typecheck
npm run typecheck
```

## Project Structure

```
src/
├── App.tsx              # Root component with providers
├── config/              # Configuration (API, Blue & Slate Theme)
├── core/                # Core utilities
│   ├── api/             # Axios client, endpoints
│   ├── storage/         # Secure storage wrapper
│   └── utils/           # Validators, formatters
├── store/               # Redux store
│   ├── slices/          # Feature slices
│   ├── hooks.ts         # Typed hooks
│   └── index.ts         # Store config
├── services/            # API service functions (mocked functionality)
├── navigation/          # React Navigation setup (MainTabs & Stack)
├── screens/             # Screen components (Home, Visitors, Payments, Community, etc)
├── components/          # Reusable UI components
└── types/               # TypeScript models & nav types
```

## Current State & Recent Upgrades

This project was recently upgraded from a basic starter-kit wireframe into a fully styled application:
- **Design System:** Upgraded to a modern, vibrant Blue and Slate design scheme replacing the original black-and-white placeholders.
- **Visitor Tab:** Split into "Expected Guests" (QR Generation) and "Daily Staff" (Active tracking).
- **Billing Tab:** Complete logic for tracking Sub-Totals vs Auto-Penalties for overdue bills.
- **Community Hub:** A brand new tab adding Notice Boards, Facility Bookings, and Polls.
- **Mock Data Integration:** Currently, features handle complex logic but sit on top of heavily mocked `service` layer objects (`visitor.service.ts`, `payment.service.ts`, etc). 

To connect these to real databases, simply wire up the Axios calls in `config/api.ts` to your new microservices!

## License

Proprietary - Mancom
