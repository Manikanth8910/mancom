/**
 * Data models used throughout the application
 */

// User & Auth Models
export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  societies: UserSociety[];
  currentSocietyId: string | null;
  createdAt: string;
  updatedAt: string;
  role?: 'user' | 'admin' | 'security' | 'superadmin';
}

export interface UserSociety {
  id: string;
  name: string;
  role: 'resident' | 'owner' | 'tenant' | 'admin';
  unitNumber: string;
  building: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: ApiMeta;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  path?: string;
}

// Appwrite Auth Models
export interface AppwriteSession {
  userId: string;
  sessionId: string;
}

export interface AppwriteJwt {
  jwt: string;
}
