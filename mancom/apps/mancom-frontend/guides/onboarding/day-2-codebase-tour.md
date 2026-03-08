# Day 2: Codebase Tour

Now that your environment is set up, let's explore the codebase.

## Project Structure Overview

```
mancom-app/
├── src/                    # All source code
│   ├── App.tsx            # Root component
│   ├── config/            # Configuration
│   ├── core/              # Core utilities
│   ├── store/             # Redux store
│   ├── services/          # API services
│   ├── navigation/        # Navigation setup
│   ├── screens/           # Screen components
│   ├── components/        # Reusable components
│   └── types/             # TypeScript types
├── __tests__/             # Test files
├── docs/                  # Documentation
├── guides/                # Developer guides
├── ios/                   # iOS native code
└── android/               # Android native code
```

## Key Files to Understand

### Entry Point

**`index.js`** - App entry, registers the root component

**`src/App.tsx`** - Root component with providers:
- Redux Provider
- PersistGate for state persistence
- SafeAreaProvider
- RootNavigator

### Configuration

**`src/config/index.ts`** - App-wide settings
**`src/config/api.ts`** - API configuration
**`src/config/theme.ts`** - Colors, spacing, typography

### State Management

**`src/store/index.ts`** - Store configuration with persist
**`src/store/hooks.ts`** - Typed dispatch and selector hooks
**`src/store/slices/authSlice.ts`** - Authentication state

### Navigation

**`src/navigation/index.tsx`** - Root navigator (switches Auth/Main)
**`src/navigation/AuthStack.tsx`** - Login/OTP screens
**`src/navigation/MainTabs.tsx`** - Bottom tab navigator

### API Layer

**`src/core/api/client.ts`** - Axios instance with interceptors
**`src/core/api/endpoints.ts`** - API endpoint constants
**`src/services/auth.service.ts`** - Auth API calls

## Tracing the Auth Flow

Let's trace what happens when a user logs in:

### 1. User enters phone number (LoginScreen.tsx)

```typescript
const handleSendOtp = async () => {
  const result = await dispatch(requestOtp(phoneNumber));
  if (requestOtp.fulfilled.match(result)) {
    navigation.navigate('Otp', { phoneNumber, otpUserId: result.payload.userId });
  }
};
```

### 2. Thunk calls service (authSlice.ts)

```typescript
export const requestOtp = createAsyncThunk(
  'auth/requestOtp',
  async (phone: string, { rejectWithValue }) => {
    const response = await authService.requestOtp({ phone });
    return response.data;
  }
);
```

### 3. Service makes API call (auth.service.ts)

```typescript
export async function requestOtp(payload: RequestOtpPayload) {
  const response = await apiClient.post(
    ENDPOINTS.APPWRITE_PHONE_SESSION,
    { phone: `+91${payload.phone}` }
  );
  return response.data;
}
```

### 4. State updates trigger navigation (navigation/index.tsx)

```typescript
// RootNavigator checks auth state
const isAuthenticated = useAppSelector(selectIsAuthenticated);

// Shows different stack based on auth state
{isAuthenticated ? (
  <Stack.Screen name="Main" component={MainTabs} />
) : (
  <Stack.Screen name="Auth" component={AuthStack} />
)}
```

## Exercise: Find Where These Are Defined

1. Where is the API base URL configured?
2. Where are the bottom tab icons defined?
3. Where is the access token stored?
4. Where is the logout button?

<details>
<summary>Answers</summary>

1. `src/config/api.ts` - `API_CONFIG.BASE_URL`
2. `src/navigation/MainTabs.tsx` - `TabIcon` component
3. `src/core/storage/secure-storage.ts` - Uses react-native-keychain
4. `src/screens/home/HomeScreen.tsx` and `src/screens/_placeholder/ProfileScreen.tsx`

</details>

## Using Redux DevTools

1. Install Flipper: https://fbflipper.com/
2. Install Redux Debugger plugin in Flipper
3. Run the app and open Flipper
4. You can now inspect:
   - Current state
   - Action history
   - State diffs

## Understanding the Data Flow

```
User Action → Screen dispatches action
           → Thunk calls service
           → Service makes API call
           → API client handles auth
           → Response comes back
           → Thunk updates state
           → Screen re-renders with new data
```

## Next Steps

- Proceed to [Day 3: First Feature](./day-3-first-feature.md)
- Deep dive into [Auth Flow](../../docs/auth-flow.md)
- Review [Redux Patterns](../../docs/redux-patterns.md)
