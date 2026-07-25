import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { Business, PaginatedResponse } from '@/types';
import {
  setBusinesses,
  setFeaturedBusinesses,
  setNewestBusinesses,
  setPaginatedBusinesses,
  setCurrentBusiness,
  setLoading,
  setError,
} from '@/lib/store/slices/businessesSlice';
import { AppDispatch } from '@/lib/store';

export const getBusinesses = createAsyncThunk<
  Business[],
  { page?: number; pageSize?: number; category?: string } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getBusinesses', async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const queryParams = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : '';
    const response = await apiClient.get<Business[] | PaginatedResponse<Business>>(
      `/businesses${queryParams}`
    );
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        dispatch(setBusinesses(response.data));
        return response.data;
      } else {
        dispatch(setPaginatedBusinesses(response.data));
        return response.data.items;
      }
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get businesses';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getFeaturedBusinesses = createAsyncThunk<
  Business[],
  void,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getFeaturedBusinesses', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<Business[] | { items: Business[] }>('/businesses/featured');
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      const businesses = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any).items || [];
      dispatch(setFeaturedBusinesses(businesses));
      return businesses;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get featured businesses';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getBusinessesByCategory = createAsyncThunk<
  Business[],
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getBusinessesByCategory', async (category, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<Business[]>(`/businesses/by-category/${category}`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      const businesses = Array.isArray(response.data) ? response.data : [];
      return businesses;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get businesses by category';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getNewestBusinesses = createAsyncThunk<
  Business[],
  { limit?: number } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getNewestBusinesses', async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const limit = params?.limit || 10;
    const response = await apiClient.get<Business[]>(`/businesses/newest?limit=${limit}`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      const businesses = Array.isArray(response.data) ? response.data : [];
      dispatch(setNewestBusinesses(businesses));
      return businesses;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get newest businesses';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getBusinessById = createAsyncThunk<
  Business,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getBusinessById', async (id, { dispatch, rejectWithValue }) => {
  // Validate ID before making request - only reject temporary IDs
  if (!id || id.startsWith('business-') || id.startsWith('program-')) {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }
  
  // Allow numeric strings and numbers (convert to string for API call)
  const idStr = String(id);
  if (isNaN(Number(idStr)) && idStr !== '') {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }

  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<Business>(`/businesses/${idStr}`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch(setCurrentBusiness(response.data));
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get business';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const createBusiness = createAsyncThunk<
  Business,
  Partial<Business>,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/createBusiness', async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<Business>('/businesses', data);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch({ type: 'businesses/addBusiness', payload: response.data });
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create business';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateBusiness = createAsyncThunk<
  Business,
  { id: string; data: Partial<Business> },
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/updateBusiness', async ({ id, data }, { dispatch, rejectWithValue }) => {
  // Validate ID before making request - only reject temporary IDs
  if (!id || id.startsWith('business-') || id.startsWith('program-')) {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }
  
  // Allow numeric strings and numbers (convert to string for API call)
  const idStr = String(id);
  if (isNaN(Number(idStr)) && idStr !== '') {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }

  try {
    dispatch(setLoading(true));
    const response = await apiClient.put<Business>(`/businesses/${idStr}`, data);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch({ type: 'businesses/updateBusiness', payload: { id, updates: response.data } });
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update business';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const deleteBusiness = createAsyncThunk<
  void,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/deleteBusiness', async (id, { dispatch, rejectWithValue }) => {
  // Validate ID before making request - only reject temporary IDs
  if (!id || id.startsWith('business-') || id.startsWith('program-')) {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }
  
  // Allow numeric strings and numbers (convert to string for API call)
  const idStr = String(id);
  if (isNaN(Number(idStr)) && idStr !== '') {
    const message = 'Invalid business ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }

  try {
    dispatch(setLoading(true));
    const response = await apiClient.delete(`/businesses/${idStr}`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    dispatch({ type: 'businesses/deleteBusiness', payload: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete business';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getMyBusiness = createAsyncThunk<
  Business | null,
  void,
  { dispatch: AppDispatch; rejectValue: string }
>('businesses/getMyBusiness', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<Business | null>('/businesses/my-business');
    
    if (response.error) {
      // If business not found, return null (not an error)
      if (response.error.code === 'HTTP_ERROR' && response.error.message?.includes('404')) {
        return null;
      }
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    return response.data || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get my business';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});
