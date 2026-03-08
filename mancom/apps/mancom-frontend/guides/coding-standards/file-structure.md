# File Structure

## One Component Per File

Each component should be in its own file:

```
components/
├── ui/
│   ├── Button.tsx        # One component
│   ├── TextInput.tsx     # One component
│   └── Loading.tsx       # One component
```

Exception: Small, tightly coupled components can be in the same file:

```typescript
// TabIcon is only used by MainTabs
function TabIcon({ label, focused }: TabIconProps) { ... }

export function MainTabs() {
  return (
    <Tab.Screen
      options={{
        tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
      }}
    />
  );
}
```

## Feature Organization

Group related files by feature:

```
screens/
├── auth/
│   ├── LoginScreen.tsx
│   └── OtpScreen.tsx
├── home/
│   └── HomeScreen.tsx
└── visitors/
    ├── VisitorsScreen.tsx
    ├── VisitorDetailScreen.tsx
    └── AddVisitorScreen.tsx
```

## Where to Put What

### `/src/components/`

Reusable UI components:

```
components/
├── ui/              # Basic UI elements
│   ├── Button.tsx
│   ├── TextInput.tsx
│   └── Card.tsx
├── forms/           # Form components
│   ├── FormField.tsx
│   └── OtpInput.tsx
└── common/          # Shared complex components
    ├── Avatar.tsx
    └── UserCard.tsx
```

### `/src/screens/`

Screen components (one per route):

```
screens/
├── auth/
├── home/
├── visitors/
├── payments/
└── _placeholder/    # Placeholder screens
```

### `/src/navigation/`

Navigation configuration:

```
navigation/
├── index.tsx        # Root navigator
├── AuthStack.tsx    # Auth flow
├── MainTabs.tsx     # Bottom tabs
└── types.ts         # Navigation types
```

### `/src/store/`

Redux state management:

```
store/
├── index.ts         # Store configuration
├── hooks.ts         # Typed hooks
├── rootReducer.ts   # Combined reducers
└── slices/
    ├── authSlice.ts
    └── userSlice.ts
```

### `/src/services/`

API service functions:

```
services/
├── auth.service.ts
├── user.service.ts
└── visitors.service.ts
```

### `/src/core/`

Core utilities and infrastructure:

```
core/
├── api/
│   ├── client.ts    # Axios instance
│   ├── endpoints.ts # API endpoints
│   └── types.ts     # API types
├── storage/
│   └── secure-storage.ts
└── utils/
    ├── validators.ts
    └── formatters.ts
```

### `/src/config/`

App configuration:

```
config/
├── index.ts         # Main config
├── api.ts           # API config
└── theme.ts         # Theme constants
```

### `/src/types/`

Shared TypeScript types:

```
types/
├── models.ts        # Data models
├── navigation.ts    # Nav types
└── index.ts         # Re-exports
```

## Index Files

Use index files for clean imports:

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { TextInput } from './TextInput';
export { Loading } from './Loading';

// Usage
import { Button, TextInput } from '../../components/ui';
```

## Adding a New Feature

When adding a new feature (e.g., Visitors):

1. **Screen(s)**
   ```
   screens/visitors/
   ├── VisitorsScreen.tsx
   ├── VisitorDetailScreen.tsx
   └── AddVisitorScreen.tsx
   ```

2. **Redux Slice**
   ```
   store/slices/visitorsSlice.ts
   ```

3. **Service**
   ```
   services/visitors.service.ts
   ```

4. **Types** (if needed)
   ```
   types/visitors.ts  # Or add to models.ts
   ```

5. **Navigation**
   - Add to MainTabs or create VisitorsStack
   - Update types.ts

## Test Files

Keep tests alongside source or in `__tests__`:

```
# Option 1: Alongside (preferred for components)
components/
├── ui/
│   ├── Button.tsx
│   └── Button.test.tsx

# Option 2: __tests__ folder (for slices, services)
__tests__/
├── store/
│   └── authSlice.test.ts
└── services/
    └── auth.service.test.ts
```

## Documentation

```
docs/           # Technical documentation
guides/         # Developer guides
├── onboarding/
├── coding-standards/
├── development/
├── testing/
└── tutorials/
```
