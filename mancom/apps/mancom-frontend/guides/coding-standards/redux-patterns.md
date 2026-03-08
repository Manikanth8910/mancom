# Redux Patterns

## When to Use Redux

Use Redux for:
- Authentication state
- User profile data
- Feature data shared across screens
- Data that needs to persist

Use local state (useState) for:
- Form input values
- UI state (modals, dropdowns)
- Temporary values
- Single-screen state

## Slice File Structure

```typescript
// 1. Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as featureService from '../../services/feature.service';
import type { RootState } from '../index';

// 2. State interface
interface FeatureState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

// 3. Initial state
const initialState: FeatureState = {
  items: [],
  isLoading: false,
  error: null,
};

// 4. Async thunks
export const fetchItems = createAsyncThunk(
  'feature/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await featureService.getItems();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Slice
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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

// 6. Exports
export const { clearError } = featureSlice.actions;

// 7. Selectors
export const selectItems = (state: RootState) => state.feature.items;
export const selectIsLoading = (state: RootState) => state.feature.isLoading;
export const selectError = (state: RootState) => state.feature.error;

export default featureSlice.reducer;
```

## Naming Conventions

### Thunks

Use `verbNoun` pattern:
- `fetchItems`, `fetchUser` - GET
- `createItem`, `createUser` - POST
- `updateItem`, `updateUser` - PUT/PATCH
- `deleteItem`, `removeUser` - DELETE

### Selectors

Use `select` prefix:
- `selectItems`
- `selectIsLoading`
- `selectError`
- `selectItemById`

### Actions

Use descriptive verbs:
- `clearError`
- `resetState`
- `setFilter`

## Using Typed Hooks

Always import from store/hooks:

```typescript
// Good
import { useAppDispatch, useAppSelector } from '../../store/hooks';

// Bad
import { useDispatch, useSelector } from 'react-redux';
```

## Async Thunk Patterns

### Basic Pattern

```typescript
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (arg: ArgType, { rejectWithValue }) => {
    try {
      const response = await service.getData(arg);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### With State Access

```typescript
export const conditionalFetch = createAsyncThunk(
  'feature/conditionalFetch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    // Skip if already loaded
    if (state.feature.items.length > 0) {
      return state.feature.items;
    }

    try {
      const response = await service.getItems();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Chained Actions

```typescript
export const createAndSelect = createAsyncThunk(
  'feature/createAndSelect',
  async (data: CreateData, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(createItem(data)).unwrap();
      dispatch(setSelectedId(result.id));
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Handling Results in Components

```typescript
function MyComponent() {
  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    const result = await dispatch(createItem(data));

    if (createItem.fulfilled.match(result)) {
      // Success - navigate or show message
      navigation.goBack();
    }
    // Error is handled by Redux state
  };
}
```

## Selectors

### Simple Selectors

```typescript
export const selectItems = (state: RootState) => state.feature.items;
```

### Derived Selectors

Use createSelector for computed values:

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectActiveItems = createSelector(
  [selectItems],
  (items) => items.filter(item => item.isActive)
);

export const selectItemCount = createSelector(
  [selectItems],
  (items) => items.length
);
```

### Parameterized Selectors

```typescript
export const selectItemById = (id: string) => (state: RootState) =>
  state.feature.items.find(item => item.id === id);

// Usage
const item = useAppSelector(selectItemById(itemId));
```

## Error Handling

Store errors in state:

```typescript
interface FeatureState {
  error: string | null;
}

// In extraReducers
.addCase(fetchItems.rejected, (state, action) => {
  state.error = action.payload as string;
})

// In component
const error = useAppSelector(selectError);

if (error) {
  return <ErrorMessage message={error} />;
}
```

## Loading States

Track loading per operation if needed:

```typescript
interface FeatureState {
  isLoading: boolean;        // General loading
  isCreating: boolean;       // Create in progress
  updatingId: string | null; // Item being updated
}
```
