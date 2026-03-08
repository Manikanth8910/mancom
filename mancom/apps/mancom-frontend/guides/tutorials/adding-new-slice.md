# Adding a New Redux Slice

This tutorial shows how to add a new Redux slice for a feature.

## Step 1: Create the Slice File

Create `src/store/slices/featureSlice.ts`:

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as featureService from '../../services/feature.service';
import type { RootState } from '../index';

// 1. Define state interface
interface FeatureState {
  items: FeatureItem[];
  selectedId: string | null;
  filter: string;
  isLoading: boolean;
  error: string | null;
}

// 2. Define initial state
const initialState: FeatureState = {
  items: [],
  selectedId: null,
  filter: '',
  isLoading: false,
  error: null,
};

// 3. Create async thunks
export const fetchItems = createAsyncThunk(
  'feature/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await featureService.getItems();
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch';
      return rejectWithValue(message);
    }
  }
);

export const createItem = createAsyncThunk(
  'feature/createItem',
  async (data: CreateItemData, { rejectWithValue }) => {
    try {
      const response = await featureService.createItem(data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create';
      return rejectWithValue(message);
    }
  }
);

// 4. Create slice
const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {
    // Synchronous actions
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    selectItem: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch items
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

    // Create item
    builder
      .addCase(createItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 5. Export actions
export const { setFilter, selectItem, clearError, resetState } = featureSlice.actions;

// 6. Create selectors
export const selectItems = (state: RootState) => state.feature.items;
export const selectSelectedId = (state: RootState) => state.feature.selectedId;
export const selectFilter = (state: RootState) => state.feature.filter;
export const selectIsLoading = (state: RootState) => state.feature.isLoading;
export const selectError = (state: RootState) => state.feature.error;

// Derived selector
export const selectFilteredItems = (state: RootState) => {
  const items = selectItems(state);
  const filter = selectFilter(state);
  if (!filter) return items;
  return items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
};

// Parameterized selector
export const selectItemById = (id: string) => (state: RootState) =>
  state.feature.items.find(item => item.id === id);

// 7. Export reducer
export default featureSlice.reducer;
```

## Step 2: Add to Root Reducer

Update `src/store/rootReducer.ts`:

```typescript
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import featureReducer from './slices/featureSlice'; // Add import

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  feature: featureReducer, // Add to combineReducers
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
```

## Step 3: Use in Components

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchItems,
  selectItems,
  selectIsLoading,
  selectError,
} from '../store/slices/featureSlice';

function FeatureScreen() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Render based on state...
}
```

## Step 4: Add Tests

Create `__tests__/store/featureSlice.test.ts`:

```typescript
import featureReducer, {
  fetchItems,
  setFilter,
  selectItems,
} from '../../src/store/slices/featureSlice';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../src/services/feature.service');
const featureService = require('../../src/services/feature.service');

describe('featureSlice', () => {
  const createStore = () =>
    configureStore({ reducer: { feature: featureReducer } });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const store = createStore();
    expect(store.getState().feature.items).toEqual([]);
  });

  it('should handle setFilter', () => {
    const store = createStore();
    store.dispatch(setFilter('test'));
    expect(store.getState().feature.filter).toBe('test');
  });

  it('should fetch items successfully', async () => {
    featureService.getItems.mockResolvedValueOnce({
      data: [{ id: '1', name: 'Item 1' }],
    });

    const store = createStore();
    await store.dispatch(fetchItems());

    expect(store.getState().feature.items).toHaveLength(1);
  });
});
```

## Naming Checklist

- [ ] Slice name matches feature (e.g., `name: 'feature'`)
- [ ] Thunks use `verbNoun` (e.g., `fetchItems`, `createItem`)
- [ ] Selectors use `select` prefix (e.g., `selectItems`)
- [ ] Actions are descriptive (e.g., `setFilter`, `clearError`)
- [ ] File is named `featureSlice.ts`
