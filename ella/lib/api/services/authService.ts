import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { LoginRequest, RegisterRequest, GoogleLoginRequest, AuthResponse, User } from '@/types';
import {
  setCredentials,
  setError,
  setLoading,
  logout as logoutAction,
} from '@/lib/store/slices/authSlice';
import { AppDispatch } from '@/lib/store';

export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    dispatch(setCredentials(response.data));
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const loginWithGoogle = createAsyncThunk<
  AuthResponse,
  GoogleLoginRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('auth/loginWithGoogle', async ({ idToken }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    dispatch(setCredentials(response.data));
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google login failed';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { dispatch: AppDispatch; rejectValue: string }
>('auth/register', async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    dispatch(setCredentials(response.data));
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { dispatch: AppDispatch; rejectValue: string }
>('auth/getCurrentUser', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<User>('/auth/me');

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateProfile = createAsyncThunk<
  User,
  { name?: string; phone?: string; cityId?: number },
  { dispatch: AppDispatch; rejectValue: string }
>('auth/updateProfile', async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const updateData: { name?: string; phone?: string; cityId?: number } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.cityId !== undefined) updateData.cityId = data.cityId;

    const response = await apiClient.put<User>('/auth/me', updateData);

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  { currentPassword: string; newPassword: string },
  { dispatch: AppDispatch; rejectValue: string }
>('auth/changePassword', async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.put<{ message: string }>('/auth/change-password', data);

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const setPasswordFromInvite = createAsyncThunk<
  AuthResponse,
  { token: string; password: string },
  { dispatch: AppDispatch; rejectValue: string }
>('auth/setPasswordFromInvite', async ({ token, password }, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<AuthResponse>('/auth/set-password', { token, password });

    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }

    if (!response.data) {
      const message = 'No data received';
      dispatch(setError(message));
      return rejectWithValue(message);
    }

    dispatch(setCredentials(response.data));
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set password';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const logout = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Best-effort server-side logout; continue with local cleanup either way.
    } finally {
      dispatch(logoutAction());
    }
  },
);
