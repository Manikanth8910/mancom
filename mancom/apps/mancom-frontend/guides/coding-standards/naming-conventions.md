# Naming Conventions

## Files

### Components (PascalCase)

```
Button.tsx
UserCard.tsx
LoginScreen.tsx
MainTabs.tsx
```

### Non-components (camelCase)

```
auth.service.ts
authSlice.ts
validators.ts
formatters.ts
```

### Types (camelCase or models.ts)

```
models.ts
navigation.ts
```

### Config/Constants (camelCase)

```
api.ts
theme.ts
endpoints.ts
```

## Components

### Component Names (PascalCase)

```typescript
export function UserProfile() { ... }
export function PaymentCard() { ... }
export function VisitorListItem() { ... }
```

### Props Interfaces

Use `Props` suffix or component name:

```typescript
interface ButtonProps { ... }
interface UserCardProps { ... }
interface Props { ... } // When in same file
```

## Functions

### Regular Functions (camelCase)

```typescript
function validatePhone(phone: string): boolean { ... }
function formatCurrency(amount: number): string { ... }
```

### Event Handlers

Use `handle` prefix:

```typescript
const handlePress = () => { ... }
const handleSubmit = () => { ... }
const handleTextChange = (text: string) => { ... }
```

### Boolean Getters

Use `is`, `has`, `can`, `should` prefix:

```typescript
function isValidPhone(phone: string): boolean { ... }
function hasPermission(user: User): boolean { ... }
function canEdit(item: Item): boolean { ... }
```

## Redux

### Slice Names (feature)

```typescript
// File: authSlice.ts
name: 'auth'

// File: userSlice.ts
name: 'user'

// File: visitorsSlice.ts
name: 'visitors'
```

### Thunks (verbNoun)

```typescript
export const fetchItems = createAsyncThunk('feature/fetchItems', ...)
export const createVisitor = createAsyncThunk('visitors/createVisitor', ...)
export const updateProfile = createAsyncThunk('user/updateProfile', ...)
export const deletePayment = createAsyncThunk('payments/deletePayment', ...)
```

### Selectors (selectNoun)

```typescript
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectVisitors = (state: RootState) => state.visitors.items;
export const selectActiveVisitors = createSelector(...);
```

### Actions (verbNoun)

```typescript
export const { clearError, setFilter, resetState } = slice.actions;
```

## Constants

### Regular Constants (UPPER_SNAKE_CASE)

```typescript
const API_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const DEFAULT_PAGE_SIZE = 20;
```

### Object Constants (camelCase keys)

```typescript
const theme = {
  colors: { ... },
  spacing: { ... },
};

const ENDPOINTS = {
  SESSION: '/auth/session',
  VISITORS: '/visitors',
};
```

## Types & Interfaces

### Interfaces (PascalCase)

```typescript
interface User { ... }
interface AuthState { ... }
interface ApiResponse<T> { ... }
```

### Types (PascalCase)

```typescript
type Status = 'pending' | 'approved' | 'rejected';
type UserId = string;
type AsyncHandler = () => Promise<void>;
```

### Generic Type Parameters

Use descriptive names for complex generics:

```typescript
// Simple - single letter
function identity<T>(value: T): T { ... }

// Complex - descriptive
interface Repository<Entity, CreateData, UpdateData> { ... }
```

## Navigation

### Screen Names (PascalCase)

```typescript
type AuthStackParamList = {
  Login: undefined;
  Otp: { phoneNumber: string };
  ForgotPassword: undefined;
};
```

### Navigator Names (PascalCase)

```typescript
function AuthStack() { ... }
function MainTabs() { ... }
function RootNavigator() { ... }
```

## CSS/Styles

### Style Names (camelCase)

```typescript
const styles = StyleSheet.create({
  container: { ... },
  headerTitle: { ... },
  primaryButton: { ... },
  errorText: { ... },
});
```

## Test Files

### Test Files (.test.ts suffix)

```
authSlice.test.ts
auth.service.test.ts
Button.test.tsx
```

### Test Descriptions

```typescript
describe('authSlice', () => {
  describe('requestOtp', () => {
    it('should set loading state when pending', () => {
      ...
    });

    it('should store userId on success', () => {
      ...
    });
  });
});
```
