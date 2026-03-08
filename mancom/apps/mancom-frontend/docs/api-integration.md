# API Integration

## Overview

The app communicates with the backend API using Axios. The API client handles authentication, error handling, and token refresh automatically.

## API Client

The API client is configured in `src/core/api/client.ts`:

```typescript
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

Automatically adds authentication token to requests:

```typescript
apiClient.interceptors.request.use(async (config) => {
  const tokens = await secureStorage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
```

### Response Interceptor

Handles 401 errors and token refresh:

```typescript
apiClient.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

## Endpoints

All endpoints are defined in `src/core/api/endpoints.ts`:

```typescript
export const ENDPOINTS = {
  // Auth
  APPWRITE_PHONE_SESSION: '/auth/appwrite/account/sessions/phone',
  APPWRITE_JWT: '/auth/appwrite/account/jwt',
  SESSION: '/auth/session',
  SESSION_REFRESH: '/auth/session/refresh',
  SESSION_REVOKE: '/auth/session/revoke',
  ME: '/auth/me',

  // Features
  VISITORS: '/visitors',
  PAYMENTS: '/payments',
  HELPDESK: '/helpdesk',
  PROFILE: '/profile',
} as const;
```

## Services

Services are pure functions that make API calls:

```typescript
// src/services/auth.service.ts
export async function requestOtp(payload: RequestOtpPayload) {
  const response = await apiClient.post(
    ENDPOINTS.APPWRITE_PHONE_SESSION,
    { phone: `+91${payload.phone}` }
  );
  return response.data;
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-19T12:00:00Z",
    "requestId": "abc123"
  }
}
```

### Error Response

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
    "path": "/auth/appwrite/account/sessions/phone"
  }
}
```

## Adding a New Endpoint

### 1. Add to endpoints.ts

```typescript
export const ENDPOINTS = {
  // ... existing
  NEW_FEATURE: '/new-feature',
} as const;
```

### 2. Create/update service

```typescript
// src/services/newFeature.service.ts
import apiClient from '../core/api/client';
import { ENDPOINTS } from '../core/api/endpoints';
import type { ApiResponse } from '../types/models';

export async function getNewFeature(): Promise<ApiResponse<NewFeatureData>> {
  const response = await apiClient.get(ENDPOINTS.NEW_FEATURE);
  return response.data;
}
```

### 3. Create thunk in slice

```typescript
export const fetchNewFeature = createAsyncThunk(
  'newFeature/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await newFeatureService.getNewFeature();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Error Handling

Errors should be caught and handled at the thunk level:

```typescript
export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await service.getData();
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // API error
        return rejectWithValue(
          error.response?.data?.error?.message || 'Request failed'
        );
      }
      // Network or other error
      return rejectWithValue('Something went wrong');
    }
  }
);
```

## Testing API Calls

Mock the API client in tests:

```typescript
jest.mock('../../src/core/api/client');

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

mockedClient.get.mockResolvedValueOnce({
  data: { success: true, data: mockData }
});
```
