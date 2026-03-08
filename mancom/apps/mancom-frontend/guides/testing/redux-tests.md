# Testing Redux

## Slice Testing

### Setup

```typescript
import { configureStore } from '@reduxjs/toolkit';
import featureReducer, {
  fetchItems,
  selectItems,
  selectIsLoading,
} from '../../src/store/slices/featureSlice';

// Mock the service
jest.mock('../../src/services/feature.service', () => ({
  getItems: jest.fn(),
}));

const featureService = require('../../src/services/feature.service');

describe('featureSlice', () => {
  const createTestStore = () =>
    configureStore({
      reducer: { feature: featureReducer },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests...
});
```

### Testing Initial State

```typescript
it('should have correct initial state', () => {
  const store = createTestStore();
  const state = store.getState().feature;

  expect(state.items).toEqual([]);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
});
```

### Testing Reducers

```typescript
it('should handle clearError action', () => {
  const store = createTestStore();

  // Set up error state
  store.dispatch({
    type: 'feature/fetchItems/rejected',
    payload: 'Error message',
  });
  expect(store.getState().feature.error).toBe('Error message');

  // Clear error
  store.dispatch(clearError());
  expect(store.getState().feature.error).toBeNull();
});
```

### Testing Async Thunks

```typescript
describe('fetchItems thunk', () => {
  it('should handle successful fetch', async () => {
    const mockItems = [{ id: '1', name: 'Item 1' }];
    featureService.getItems.mockResolvedValueOnce({
      data: mockItems,
    });

    const store = createTestStore();
    await store.dispatch(fetchItems());

    const state = store.getState().feature;
    expect(state.items).toEqual(mockItems);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetch failure', async () => {
    featureService.getItems.mockRejectedValueOnce(
      new Error('Network error')
    );

    const store = createTestStore();
    await store.dispatch(fetchItems());

    const state = store.getState().feature;
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('should set loading state while fetching', async () => {
    featureService.getItems.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const store = createTestStore();
    const promise = store.dispatch(fetchItems());

    expect(store.getState().feature.isLoading).toBe(true);

    await promise;
  });
});
```

### Testing Selectors

```typescript
describe('selectors', () => {
  it('selectItems should return items array', () => {
    const state = {
      feature: {
        items: [{ id: '1' }],
        isLoading: false,
        error: null,
      },
    };

    expect(selectItems(state)).toEqual([{ id: '1' }]);
  });

  it('selectIsLoading should return loading state', () => {
    const state = {
      feature: {
        items: [],
        isLoading: true,
        error: null,
      },
    };

    expect(selectIsLoading(state)).toBe(true);
  });
});
```

### Testing Thunk with State Access

```typescript
it('should use existing state in thunk', async () => {
  const store = createTestStore();

  // Pre-populate state
  featureService.getItems.mockResolvedValueOnce({ data: [{ id: '1' }] });
  await store.dispatch(fetchItems());

  // Create thunk that reads state
  await store.dispatch(conditionalFetch());

  // Should not have called service again
  expect(featureService.getItems).toHaveBeenCalledTimes(1);
});
```

### Testing Thunk with Multiple Dispatches

```typescript
it('should dispatch multiple actions', async () => {
  featureService.create.mockResolvedValueOnce({ data: { id: 'new' } });

  const store = createTestStore();
  await store.dispatch(createAndSelect({ name: 'New Item' }));

  const state = store.getState().feature;
  expect(state.selectedId).toBe('new');
});
```

## Tips

1. **Isolate tests** - Each test should start with fresh state
2. **Mock at service level** - Don't mock axios directly
3. **Test edge cases** - Empty arrays, null values, errors
4. **Test loading states** - Verify loading is set during async
5. **Use `.unwrap()`** - When testing thunk results in components
