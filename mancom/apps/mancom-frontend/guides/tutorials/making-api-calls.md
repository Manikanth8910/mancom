# Making API Calls

This tutorial shows the correct way to make API calls in the app.

## The Pattern

```
Screen → dispatch(thunk) → thunk calls service → service uses apiClient → Backend
```

## Step 1: Add Endpoint

Add to `src/core/api/endpoints.ts`:

```typescript
export const ENDPOINTS = {
  // ... existing
  NEW_RESOURCE: '/new-resource',
} as const;
```

## Step 2: Create Service Function

Create or update service file:

```typescript
// src/services/newResource.service.ts
import apiClient from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type { ApiResponse, NewResource } from '../types/models';

// GET request
export async function getResources(): Promise<ApiResponse<NewResource[]>> {
  const response = await apiClient.get(ENDPOINTS.NEW_RESOURCE);
  return response.data;
}

// GET with ID
export async function getResource(id: string): Promise<ApiResponse<NewResource>> {
  const response = await apiClient.get(`${ENDPOINTS.NEW_RESOURCE}/${id}`);
  return response.data;
}

// POST request
export async function createResource(
  data: CreateResourcePayload
): Promise<ApiResponse<NewResource>> {
  const response = await apiClient.post(ENDPOINTS.NEW_RESOURCE, data);
  return response.data;
}

// PUT/PATCH request
export async function updateResource(
  id: string,
  data: UpdateResourcePayload
): Promise<ApiResponse<NewResource>> {
  const response = await apiClient.patch(
    `${ENDPOINTS.NEW_RESOURCE}/${id}`,
    data
  );
  return response.data;
}

// DELETE request
export async function deleteResource(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete(`${ENDPOINTS.NEW_RESOURCE}/${id}`);
  return response.data;
}
```

## Step 3: Create Thunk

In your slice file:

```typescript
import * as resourceService from '../../services/newResource.service';

// Fetch all
export const fetchResources = createAsyncThunk(
  'resource/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourceService.getResources();
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch';
      return rejectWithValue(message);
    }
  }
);

// Create
export const createResource = createAsyncThunk(
  'resource/createResource',
  async (data: CreateResourcePayload, { rejectWithValue }) => {
    try {
      const response = await resourceService.createResource(data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create';
      return rejectWithValue(message);
    }
  }
);

// Update
export const updateResource = createAsyncThunk(
  'resource/updateResource',
  async (
    { id, data }: { id: string; data: UpdateResourcePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await resourceService.updateResource(id, data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update';
      return rejectWithValue(message);
    }
  }
);

// Delete
export const deleteResource = createAsyncThunk(
  'resource/deleteResource',
  async (id: string, { rejectWithValue }) => {
    try {
      await resourceService.deleteResource(id);
      return id; // Return ID to remove from state
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete';
      return rejectWithValue(message);
    }
  }
);
```

## Step 4: Handle in Reducer

```typescript
extraReducers: (builder) => {
  builder
    // Fetch
    .addCase(fetchResources.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchResources.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload;
    })
    .addCase(fetchResources.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Create
    .addCase(createResource.pending, (state) => {
      state.isCreating = true;
    })
    .addCase(createResource.fulfilled, (state, action) => {
      state.isCreating = false;
      state.items.unshift(action.payload); // Add to beginning
    })
    .addCase(createResource.rejected, (state, action) => {
      state.isCreating = false;
      state.error = action.payload as string;
    })

    // Delete
    .addCase(deleteResource.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    });
}
```

## Step 5: Use in Component

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchResources,
  createResource,
  selectResources,
  selectIsLoading,
  selectError,
} from '../store/slices/resourceSlice';

function ResourceScreen() {
  const dispatch = useAppDispatch();
  const resources = useAppSelector(selectResources);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  // Create with result handling
  const handleCreate = async (data: CreateResourcePayload) => {
    const result = await dispatch(createResource(data));

    if (createResource.fulfilled.match(result)) {
      // Success - navigate back or show success message
      navigation.goBack();
    }
    // Error is stored in Redux state and shown by UI
  };

  // Render loading state
  if (isLoading && resources.length === 0) {
    return <Loading />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchResources())}
      />
    );
  }

  // Render data
  return <ResourceList items={resources} />;
}
```

## Error Handling

### API Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number",
    "details": {
      "phone": ["Must be 10 digits"]
    }
  }
}
```

### Catching Specific Errors

```typescript
import axios from 'axios';

export const createResource = createAsyncThunk(
  'resource/createResource',
  async (data: CreateData, { rejectWithValue }) => {
    try {
      const response = await resourceService.createResource(data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // API error
        const apiError = error.response?.data?.error;
        return rejectWithValue(apiError?.message || 'Request failed');
      }
      // Network or other error
      return rejectWithValue('Something went wrong');
    }
  }
);
```

## Important Rules

1. **Never call API directly from components** - Always go through thunks
2. **Services are pure** - No React or Redux imports
3. **Handle errors in thunks** - Use rejectWithValue
4. **Store errors in state** - Don't throw to components
5. **Show loading states** - Users need feedback
