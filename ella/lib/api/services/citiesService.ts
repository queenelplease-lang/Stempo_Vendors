import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { City } from '@/types';

export const getCities = createAsyncThunk<
  City[],
  void,
  { rejectValue: string }
>('cities/getCities', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<City[]>('/cities');
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get cities';
    return rejectWithValue(message);
  }
});
