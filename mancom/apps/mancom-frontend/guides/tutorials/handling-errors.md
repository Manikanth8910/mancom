# Handling Errors

This tutorial covers error handling patterns in the app.

## Error Flow

```
API Error → Service → Thunk (rejectWithValue) → Reducer → State → UI
```

## Step 1: API Error Format

Our API returns errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number",
    "details": {
      "phone": ["Must be 10 digits"]
    }
  },
  "meta": {
    "timestamp": "2024-01-19T12:00:00Z",
    "path": "/api/v1/auth/session"
  }
}
```

## Step 2: Handle in Thunks

```typescript
import axios from 'axios';

export const createItem = createAsyncThunk(
  'feature/createItem',
  async (data: CreateItemData, { rejectWithValue }) => {
    try {
      const response = await featureService.createItem(data);
      return response.data;
    } catch (error) {
      // Check if it's an Axios error (API response)
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error;

        // Return the API error message
        if (apiError?.message) {
          return rejectWithValue(apiError.message);
        }

        // Handle specific HTTP status codes
        if (error.response?.status === 404) {
          return rejectWithValue('Resource not found');
        }

        if (error.response?.status === 403) {
          return rejectWithValue('You do not have permission');
        }
      }

      // Network error or unexpected error
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue('Something went wrong');
    }
  }
);
```

## Step 3: Store Error in State

```typescript
interface FeatureState {
  // ... other state
  error: string | null;
}

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
      .addCase(createItem.pending, (state) => {
        state.error = null; // Clear previous error
      })
      .addCase(createItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = featureSlice.actions;
export const selectError = (state: RootState) => state.feature.error;
```

## Step 4: Display Error in UI

### Using ErrorMessage Component

```typescript
import { ErrorMessage } from '../../components/ui';

function FeatureScreen() {
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchItems())}
      />
    );
  }

  // Normal render...
}
```

### Inline Error Display

```typescript
function CreateItemForm() {
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  // Clear error when user starts typing
  const handleChange = (text: string) => {
    if (error) {
      dispatch(clearError());
    }
    setValue(text);
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={handleChange}
        error={error || undefined}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}
```

## Step 5: Handle Action Results

```typescript
function CreateItemScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    const result = await dispatch(createItem(formData));

    if (createItem.fulfilled.match(result)) {
      // Success - navigate away
      navigation.goBack();
    }
    // Error is already in Redux state, UI will show it
  };
}
```

## Error Types

### Validation Errors

For form validation, show inline errors:

```typescript
interface FormState {
  values: FormValues;
  errors: Record<string, string>;
}

function handleValidation() {
  const errors: Record<string, string> = {};

  if (!values.name) {
    errors.name = 'Name is required';
  }

  if (!isValidPhone(values.phone)) {
    errors.phone = 'Invalid phone number';
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
}
```

### API Errors

Store in Redux, display with ErrorMessage:

```typescript
if (error) {
  return <ErrorMessage message={error} onRetry={handleRetry} />;
}
```

### Network Errors

Handle specially (maybe show different UI):

```typescript
if (error === 'Network Error' || error.includes('network')) {
  return (
    <View style={styles.noConnection}>
      <Text>No internet connection</Text>
      <Button title="Retry" onPress={handleRetry} />
    </View>
  );
}
```

## Global Error Handling

The API client handles 401 errors automatically:

```typescript
// In src/core/api/client.ts
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - attempt refresh
      // If refresh fails, redirect to login
    }
    return Promise.reject(error);
  }
);
```

## Best Practices

1. **Always clear errors on retry** - User expects fresh attempt
2. **Be specific** - "Invalid phone number" not "Error occurred"
3. **Provide actions** - Always give user a way to retry or dismiss
4. **Log errors** - For debugging (but not to console in production)
5. **Handle network errors** - Users on bad connections need feedback
6. **Don't expose technical details** - "Server error" not "TypeError: undefined"

## Testing Error Handling

```typescript
it('should handle API error', async () => {
  featureService.createItem.mockRejectedValueOnce({
    isAxiosError: true,
    response: {
      status: 400,
      data: {
        error: { message: 'Invalid data' }
      }
    }
  });

  const store = createTestStore();
  await store.dispatch(createItem(invalidData));

  expect(store.getState().feature.error).toBe('Invalid data');
});
```
