import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { Category } from '@/types';
import {
  setCategories,
  setLoading,
  setError,
} from '@/lib/store/slices/categoriesSlice';
import { AppDispatch } from '@/lib/store';

export const getCategories = createAsyncThunk<
  Category[],
  void,
  { dispatch: AppDispatch; rejectValue: string }
>('categories/getCategories', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<Category[]>('/categories');
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      const categories = Array.isArray(response.data) 
        ? response.data 
        : [];
      dispatch(setCategories(categories));
      return categories;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get categories';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});
