# Testing Components

## Setup

We use React Native Testing Library:

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
```

## Testing Simple Components

```typescript
import { Button } from '../../src/components/ui';

describe('Button', () => {
  it('renders title correctly', () => {
    const { getByText } = render(
      <Button title="Click me" onPress={() => {}} />
    );

    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} />
    );

    fireEvent.press(getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Click me" onPress={() => {}} loading />
    );

    expect(queryByText('Click me')).toBeNull();
    // Assuming ActivityIndicator has testID="loading"
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPress} disabled />
    );

    fireEvent.press(getByText('Click me'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
```

## Testing Components with Redux

Create a wrapper utility:

```typescript
// test-utils.tsx
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import rootReducer from '../src/store/rootReducer';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
```

Usage:

```typescript
import { renderWithProviders } from '../test-utils';
import { HomeScreen } from '../../src/screens/home/HomeScreen';

describe('HomeScreen', () => {
  it('shows welcome message with user name', () => {
    const { getByText } = renderWithProviders(<HomeScreen />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { name: 'John' },
          // ... other state
        },
      },
    });

    expect(getByText('Welcome, John!')).toBeTruthy();
  });

  it('dispatches logout when logout pressed', () => {
    const { getByText, store } = renderWithProviders(<HomeScreen />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { name: 'John' },
        },
      },
    });

    fireEvent.press(getByText('Logout'));

    // Check that logout action was dispatched
    const actions = store.getState();
    // Or use a mock store to capture actions
  });
});
```

## Testing Async Behavior

```typescript
import { waitFor } from '@testing-library/react-native';

it('shows loading then data', async () => {
  mockService.getData.mockResolvedValueOnce({ data: items });

  const { getByText, queryByText } = renderWithProviders(<DataScreen />);

  // Initially shows loading
  expect(getByText('Loading...')).toBeTruthy();

  // Wait for data
  await waitFor(() => {
    expect(queryByText('Loading...')).toBeNull();
    expect(getByText('Item 1')).toBeTruthy();
  });
});
```

## Testing Forms

```typescript
import { TextInput } from '../../src/components/ui';

describe('LoginScreen', () => {
  it('enables button when phone is valid', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <LoginScreen />
    );

    const input = getByPlaceholderText('Phone number');
    const button = getByText('Send OTP');

    // Initially disabled
    expect(button.props.accessibilityState?.disabled).toBe(true);

    // Enter valid phone
    fireEvent.changeText(input, '9876543210');

    // Now enabled
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it('shows error for invalid phone', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(
      <LoginScreen />
    );

    const input = getByPlaceholderText('Phone number');
    fireEvent.changeText(input, '123');
    fireEvent.press(getByText('Send OTP'));

    expect(queryByText('Please enter a valid 10-digit phone number')).toBeTruthy();
  });
});
```

## Querying Elements

```typescript
// By text
getByText('Hello');
queryByText('Hello'); // Returns null if not found

// By placeholder
getByPlaceholderText('Enter name');

// By testID
getByTestId('submit-button');

// By role
getByRole('button');

// Multiple elements
getAllByText('Item');
```

## Firing Events

```typescript
// Press
fireEvent.press(element);

// Text input
fireEvent.changeText(input, 'new value');

// Scroll
fireEvent.scroll(scrollView, {
  nativeEvent: { contentOffset: { y: 100 } },
});
```

## Best Practices

1. **Test user behavior, not implementation**
2. **Use accessible queries** (text, role) over testID
3. **Avoid testing styles** directly
4. **Keep tests focused** on one behavior
5. **Mock at the right level** (services, not axios)
