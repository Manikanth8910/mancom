/**
 * Root Reducer
 * Combines all slice reducers
 */

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import visitorReducer from './slices/visitorSlice';
import paymentReducer from './slices/paymentSlice';
import helpdeskReducer from './slices/helpdeskSlice';
import profileReducer from './slices/profileSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  visitor: visitorReducer,
  payment: paymentReducer,
  helpdesk: helpdeskReducer,
  profile: profileReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
