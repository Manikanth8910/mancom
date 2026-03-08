# Architecture

## Overview

Mancom is a React Native application for residential society management. This document describes the high-level architecture and key design decisions.

## Folder Structure

```
src/
├── App.tsx              # Root component with providers
├── config/              # App configuration (API URLs, theme)
├── core/                # Core utilities (API client, storage, helpers)
│   ├── api/             # Axios client, endpoints, types
│   ├── storage/         # Secure storage wrapper
│   └── utils/           # Validators, formatters
├── store/               # Redux store configuration
│   ├── slices/          # Redux Toolkit slices
│   ├── hooks.ts         # Typed useDispatch/useSelector
│   └── index.ts         # Store configuration
├── services/            # API service functions
├── navigation/          # React Navigation setup
├── screens/             # Screen components
├── components/          # Reusable UI components
└── types/               # TypeScript type definitions
```

## Data Flow

```
┌─────────────┐
│   Screen    │  ← UI only, dispatches actions, selects state
└──────┬──────┘
       │ dispatch(action)
       ▼
┌─────────────┐
│   Redux     │  ← State management, async thunks
│   Slice     │
└──────┬──────┘
       │ call service
       ▼
┌─────────────┐
│  Service    │  ← Pure TypeScript, API calls only
└──────┬──────┘
       │ axios request
       ▼
┌─────────────┐
│ API Client  │  ← Token injection, error handling
└──────┬──────┘
       │
       ▼
   Backend API
```

## Key Principles

### 1. Screens are Dumb

Screens should only:
- Render UI based on state
- Dispatch actions in response to user input
- Use `useAppSelector` to access state
- Use `useAppDispatch` to dispatch actions

Screens should NOT:
- Make direct API calls
- Contain business logic
- Transform data

### 2. Services are Pure

Services are plain TypeScript modules that:
- Make API calls using the API client
- Return API responses directly
- Have no knowledge of React or Redux

### 3. Slices Handle Logic

Redux slices:
- Define state shape
- Create async thunks that call services
- Handle loading/error states
- Transform data when needed

### 4. Single Source of Truth

- Auth state lives in `authSlice`
- User data lives in `userSlice`
- Feature-specific data lives in feature slices
- No duplicate state across slices

## Technology Choices

### React Navigation

We use React Navigation with:
- Native stack for auth flow
- Bottom tabs for main navigation
- Type-safe navigation props

### Redux Toolkit

Redux Toolkit provides:
- Simplified store setup
- `createSlice` for reducers
- `createAsyncThunk` for async operations
- RTK Query (future) for data fetching

### Axios

Axios is configured with:
- Base URL from config
- Request interceptor for token injection
- Response interceptor for 401 handling and token refresh

### React Native Keychain

Secure storage for:
- Access tokens
- Refresh tokens
- Never stored in AsyncStorage

## State Persistence

- Redux state is persisted using `redux-persist`
- Only `auth` slice is persisted
- Tokens are stored securely in Keychain
- User preferences could be persisted separately

## Error Handling

1. API errors are caught in services
2. Thunks use `rejectWithValue` to pass errors to reducers
3. Slices store error messages in state
4. Screens display errors using `ErrorMessage` component

## Testing Strategy

- **Unit tests**: Slices, services, utilities
- **Integration tests**: Navigation flows
- **E2E tests**: Critical user journeys (future)
