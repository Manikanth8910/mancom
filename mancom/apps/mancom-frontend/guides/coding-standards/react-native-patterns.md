# React Native Patterns

## Functional Components Only

Always use functional components with hooks:

```typescript
// Good
export function UserCard({ user }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

// Bad - class component
class UserCard extends React.Component { ... }
```

## Component Structure

Follow this order in components:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// 1. React/RN imports

import { Button } from '../../components/ui';
// 2. Internal imports

import { useAppSelector } from '../../store/hooks';
// 3. Store imports

import { theme } from '../../config/theme';
// 4. Config imports

interface Props {
  // 5. Props interface
}

export function MyComponent({ prop1, prop2 }: Props) {
  // 6. Hooks
  const [state, setState] = useState();
  const data = useAppSelector(selectData);

  // 7. Effects
  useEffect(() => {
    // ...
  }, []);

  // 8. Handlers
  const handlePress = () => {
    // ...
  };

  // 9. Render helpers (if needed)
  const renderItem = () => {
    // ...
  };

  // 10. Return JSX
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

// 11. Styles at bottom
const styles = StyleSheet.create({
  container: {
    // ...
  },
});

// 12. Default export if needed
export default MyComponent;
```

## StyleSheet.create

Always use StyleSheet.create, never inline styles:

```typescript
// Bad
<View style={{ flex: 1, padding: 16 }}>

// Good
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
});
```

## Use Theme Constants

Never hardcode colors, spacing, or font sizes:

```typescript
// Bad
const styles = StyleSheet.create({
  text: {
    color: '#000000',
    fontSize: 16,
    marginBottom: 8,
  },
});

// Good
const styles = StyleSheet.create({
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
});
```

## Hooks Rules

### Always follow hooks rules:

1. Call hooks at the top level
2. Only call hooks from React functions
3. Name custom hooks with `use` prefix

```typescript
// Bad - conditional hook
function MyComponent({ shouldLoad }: Props) {
  if (shouldLoad) {
    useEffect(() => { ... }, []); // Error!
  }
}

// Good
function MyComponent({ shouldLoad }: Props) {
  useEffect(() => {
    if (shouldLoad) {
      // Do something
    }
  }, [shouldLoad]);
}
```

### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Memoization

Use memoization for expensive operations:

```typescript
// Memoize expensive calculations
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callbacks passed to children
const handlePress = useCallback(() => {
  onItemSelect(item.id);
}, [item.id, onItemSelect]);

// Memoize components that receive objects/arrays as props
const MemoizedList = React.memo(ItemList);
```

## Keyboard Handling

Handle keyboard properly in forms:

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

function FormScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Form content */}
    </KeyboardAvoidingView>
  );
}
```

## Safe Area

Always respect safe areas:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

function Screen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen content */}
    </SafeAreaView>
  );
}
```

## Loading States

Always show loading feedback:

```typescript
function DataScreen() {
  const isLoading = useAppSelector(selectIsLoading);
  const data = useAppSelector(selectData);
  const error = useAppSelector(selectError);

  if (isLoading) {
    return <Loading message="Loading data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  return <DataList items={data} />;
}
```

## Platform-Specific Code

Use Platform module for platform differences:

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```
