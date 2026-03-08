/**
 * Typed Redux Hooks
 * Use these throughout the app instead of plain useDispatch and useSelector
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Typed useDispatch hook
 * Provides correct typing for async thunks
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 * Provides type inference for state selection
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
