# Adding a New Feature

This tutorial walks through adding a complete feature from start to finish.

## Example: Adding Visitor Management

We'll add the ability to view and add visitors.

## Step 1: Define Types

Create or update `src/types/models.ts`:

```typescript
export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  expectedAt: string;
  status: 'pending' | 'approved' | 'checked_in' | 'checked_out';
  createdAt: string;
}

export interface CreateVisitorPayload {
  name: string;
  phone: string;
  purpose: string;
  expectedAt: string;
}
```

## Step 2: Add API Endpoint

Update `src/core/api/endpoints.ts`:

```typescript
export const ENDPOINTS = {
  // ... existing
  VISITORS: '/visitors',
} as const;
```

## Step 3: Create Service

Create `src/services/visitors.service.ts`:

```typescript
import apiClient from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type { ApiResponse, Visitor, CreateVisitorPayload } from '../types/models';

export async function getVisitors(): Promise<ApiResponse<Visitor[]>> {
  const response = await apiClient.get(ENDPOINTS.VISITORS);
  return response.data;
}

export async function createVisitor(
  payload: CreateVisitorPayload
): Promise<ApiResponse<Visitor>> {
  const response = await apiClient.post(ENDPOINTS.VISITORS, payload);
  return response.data;
}

export async function getVisitor(id: string): Promise<ApiResponse<Visitor>> {
  const response = await apiClient.get(`${ENDPOINTS.VISITORS}/${id}`);
  return response.data;
}
```

## Step 4: Create Redux Slice

Create `src/store/slices/visitorsSlice.ts`:

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as visitorsService from '../../services/visitors.service';
import type { Visitor, CreateVisitorPayload } from '../../types/models';
import type { RootState } from '../index';

interface VisitorsState {
  items: Visitor[];
  selectedId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: VisitorsState = {
  items: [],
  selectedId: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchVisitors = createAsyncThunk(
  'visitors/fetchVisitors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await visitorsService.getVisitors();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createVisitor = createAsyncThunk(
  'visitors/createVisitor',
  async (payload: CreateVisitorPayload, { rejectWithValue }) => {
    try {
      const response = await visitorsService.createVisitor(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const visitorsSlice = createSlice({
  name: 'visitors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectVisitor: (state, action) => {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createVisitor.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createVisitor.fulfilled, (state, action) => {
        state.isCreating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createVisitor.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, selectVisitor } = visitorsSlice.actions;

export const selectVisitors = (state: RootState) => state.visitors.items;
export const selectIsLoading = (state: RootState) => state.visitors.isLoading;
export const selectIsCreating = (state: RootState) => state.visitors.isCreating;
export const selectVisitorsError = (state: RootState) => state.visitors.error;

export default visitorsSlice.reducer;
```

## Step 5: Add to Root Reducer

Update `src/store/rootReducer.ts`:

```typescript
import visitorsReducer from './slices/visitorsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  visitors: visitorsReducer, // Add this
});
```

## Step 6: Create Screens

Create `src/screens/visitors/VisitorsScreen.tsx`:

```typescript
import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Loading, ErrorMessage } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchVisitors,
  selectVisitors,
  selectIsLoading,
  selectVisitorsError,
} from '../../store/slices/visitorsSlice';
import { theme } from '../../config/theme';

export function VisitorsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const visitors = useAppSelector(selectVisitors);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectVisitorsError);

  useEffect(() => {
    dispatch(fetchVisitors());
  }, [dispatch]);

  if (isLoading && visitors.length === 0) {
    return <Loading message="Loading visitors..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchVisitors())}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitors</Text>
        <Button
          title="+ Add"
          onPress={() => navigation.navigate('AddVisitor')}
          variant="outline"
        />
      </View>

      <FlatList
        data={visitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.visitorCard}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <Text style={styles.visitorPurpose}>{item.purpose}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No visitors yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
  visitorCard: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  visitorName: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium },
  visitorPurpose: { fontSize: theme.fontSize.sm, color: theme.colors.text.secondary },
  emptyText: { textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.text.secondary },
});
```

## Step 7: Add Navigation

Update `src/navigation/MainTabs.tsx` to use the real screen.

## Step 8: Add Tests

Create `__tests__/store/visitorsSlice.test.ts` and `__tests__/services/visitors.service.test.ts`.

## Step 9: Test Manually

1. Run the app
2. Navigate to Visitors tab
3. Verify list loads
4. Test add visitor flow

## Checklist

- [ ] Types defined
- [ ] API endpoints added
- [ ] Service created
- [ ] Redux slice created
- [ ] Slice added to root reducer
- [ ] Screens created
- [ ] Navigation updated
- [ ] Tests written
- [ ] Manual testing done
