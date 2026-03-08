# Redux Patterns

## Overview

We use Redux Toolkit for state management. This document describes the patterns and conventions used.

## Slice Structure

Each slice file follows this structure:

```typescript
// 1. Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as service from '../services/feature.service';
import type { RootState } from '../index';

// 2. State interface
interface FeatureState {
  items: Item[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

// 3. Initial state
const initialState: FeatureState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

// 4. Async thunks
export const fetchItems = createAsyncThunk(
  'feature/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await service.getItems();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Slice definition
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Synchronous actions
    selectItem: (state, action) => {
      state.selectedId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Async action handlers
    builder
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 6. Export actions
export const { selectItem, clearError } = featureSlice.actions;

// 7. Selectors
export const selectItems = (state: RootState) => state.feature.items;
export const selectSelectedId = (state: RootState) => state.feature.selectedId;
export const selectIsLoading = (state: RootState) => state.feature.isLoading;
export const selectError = (state: RootState) => state.feature.error;

// 8. Export reducer
export default featureSlice.reducer;
```

## Naming Conventions

### Thunks

Use `verbNoun` pattern:
- `fetchItems` - GET requests
- `createItem` - POST requests
- `updateItem` - PUT/PATCH requests
- `deleteItem` - DELETE requests
- `requestOtp` - Custom actions

### Selectors

Use `select` prefix:
- `selectItems`
- `selectIsLoading`
- `selectError`
- `selectSelectedItem` (derived)

### Actions

Use descriptive names:
- `clearError`
- `setSelectedId`
- `resetState`

## Using Typed Hooks

Always use typed hooks from `src/store/hooks.ts`:

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const isLoading = useAppSelector(selectIsLoading);

  const handleFetch = () => {
    dispatch(fetchItems());
  };

  // ...
}
```

## Async Thunks

### Basic Pattern

```typescript
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (arg: ArgType, { rejectWithValue }) => {
    try {
      const response = await service.getData(arg);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed';
      return rejectWithValue(message);
    }
  }
);
```

### With State Access

```typescript
export const updateWithContext = createAsyncThunk(
  'feature/updateWithContext',
  async (newValue: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const currentId = state.feature.selectedId;

    if (!currentId) {
      return rejectWithValue('No item selected');
    }

    try {
      const response = await service.update(currentId, newValue);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### With Dispatch

```typescript
export const complexOperation = createAsyncThunk(
  'feature/complexOperation',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(fetchItems()).unwrap();
      await dispatch(fetchRelatedData()).unwrap();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Handling Thunk Results in Components

```typescript
const handleSubmit = async () => {
  const result = await dispatch(createItem(data));

  if (createItem.fulfilled.match(result)) {
    // Success
    navigation.goBack();
  } else {
    // Error is already in Redux state
    // UI will show error from selector
  }
};
```

## Loading States

Track loading per-operation when needed:

```typescript
interface FeatureState {
  isLoading: boolean;        // General loading
  isCreating: boolean;       // Create operation
  isUpdating: string | null; // ID of item being updated
  isDeleting: string | null; // ID of item being deleted
}
```

## Error Handling

Store error messages in state:

```typescript
interface FeatureState {
  error: string | null;
  // Or for multiple error types:
  errors: {
    fetch: string | null;
    create: string | null;
    update: string | null;
  };
}
```

Display errors in UI:

```typescript
function FeatureScreen() {
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  return (
    <View>
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchItems())}
        />
      )}
      {/* ... */}
    </View>
  );
}
```

## When to Create a New Slice

Create a new slice when:
- Feature has distinct data (visitors, payments, etc.)
- Data has its own loading/error states
- Feature is relatively independent

Don't create a new slice for:
- UI state that's local to one screen
- Derived data (use selectors instead)
- Temporary form state (use useState)

## Adding a Slice to the Store

1. Create the slice file in `src/store/slices/`
2. Add to `rootReducer.ts`:

```typescript
import featureReducer from './slices/featureSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  feature: featureReducer, // Add here
});
```

3. Export selectors and thunks as needed
