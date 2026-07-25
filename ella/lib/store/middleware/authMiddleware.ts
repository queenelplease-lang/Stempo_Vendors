import type { Action, Middleware } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api/client';
import { setCredentials, setTokens, logout } from '../slices/authSlice';
import { logout as logoutThunk } from '@/lib/api/services/authService';
import { setMyBusiness } from '../slices/appSlice';

interface RehydrateAction extends Action<'persist/REHYDRATE'> {
  payload?: {
    auth?: {
      token?: string | null;
      refreshToken?: string | null;
    };
  };
}

const isRehydrateAction = (action: unknown): action is RehydrateAction =>
  typeof action === 'object' &&
  action !== null &&
  (action as Action).type === 'persist/REHYDRATE';

/**
 * Syncs the auth token between Redux state and the API client and clears
 * derived state (like the active business) on logout / rehydrate.
 */
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (setCredentials.match(action)) {
    apiClient.setToken(action.payload.token);
    apiClient.setRefreshToken(action.payload.refreshToken ?? null);
  } else if (setTokens.match(action)) {
    apiClient.setToken(action.payload.token);
  } else if (logout.match(action) || logoutThunk.fulfilled.match(action)) {
    apiClient.setToken(null);
    apiClient.setRefreshToken(null);
    // Reset business state after the auth reducer runs so listeners see a
    // single consistent transition.
    if (store.getState().app.myBusiness !== null) {
      store.dispatch(setMyBusiness(null));
    }
  } else if (isRehydrateAction(action) && action.payload?.auth?.token) {
    apiClient.setToken(action.payload.auth.token);
    apiClient.setRefreshToken(action.payload.auth.refreshToken ?? null);
  }

  return result;
};
