import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { BonusProgram } from '@/types';
import { AppDispatch } from '@/lib/store';

// Helper function to validate business/program ID
const validateId = (id: string | number, type: 'business' | 'program'): string | null => {
  if (!id) {
    return `${type === 'business' ? 'Business' : 'Bonus program'} ID is required`;
  }

  const idStr = String(id);
  if (idStr.startsWith('business-') || idStr.startsWith('program-')) {
    return `Invalid ${type} ID`;
  }

  if (type === 'program' && (isNaN(Number(idStr)) || Number(idStr) <= 0)) {
    return `Invalid ${type} ID`;
  }

  return null;
};

// Get all bonus programs (public - only approved/active)
export const getBonusPrograms = createAsyncThunk<
  BonusProgram[],
  { businessId?: string | number } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/getBonusPrograms', async (params, { rejectWithValue }) => {
  try {
    let endpoint = '/bonus-programs';
    
    if (params?.businessId) {
      const validationError = validateId(params.businessId, 'business');
      if (validationError) {
        return rejectWithValue(validationError);
      }
      endpoint = `/bonus-programs/public/by-business/${params.businessId}`;
    }
    
    const response = await apiClient.get<BonusProgram[] | { items: BonusProgram[] }>(endpoint);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (!response.data) {
      return rejectWithValue('No data received');
    }

    return Array.isArray(response.data) 
      ? response.data 
      : (response.data as any).items || [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get bonus programs';
    return rejectWithValue(message);
  }
});

// Get my business programs - endpoint: /api/bonus-programs/by-business/:id
export const getMyBusinessPrograms = createAsyncThunk<
  BonusProgram[],
  string | number,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/getMyBusinessPrograms', async (businessId, { rejectWithValue }) => {
  const validationError = validateId(businessId, 'business');
  if (validationError) {
    console.log('[getMyBusinessPrograms] Validation error:', validationError);
    return rejectWithValue(validationError);
  }

  try {
    const endpoint = `/bonus-programs/by-business/${businessId}`;
    const response = await apiClient.get<BonusProgram[]>(endpoint);
    
    if (response.error) {
      // Return empty array for authorization/not found errors
      if (response.error.message?.includes('unauthorized') || 
          response.error.message?.includes('not found')) {
        return [];
      }
      return rejectWithValue(response.error.message || 'Unknown error');
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get my business programs';
    return rejectWithValue(message);
  }
});

export const getBonusProgramById = createAsyncThunk<
  BonusProgram,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/getBonusProgramById', async (id, { rejectWithValue }) => {
  const validationError = validateId(id, 'program');
  if (validationError) {
    return rejectWithValue(validationError);
  }

  try {
    const response = await apiClient.get<BonusProgram>(`/bonus-programs/${id}`);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (!response.data) {
      return rejectWithValue('No data received');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get bonus program';
    return rejectWithValue(message);
  }
});

export const createBonusProgram = createAsyncThunk<
  BonusProgram,
  Partial<BonusProgram>,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/createBonusProgram', async (data, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<BonusProgram>('/bonus-programs', data);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (!response.data) {
      return rejectWithValue('No data received');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create bonus program';
    return rejectWithValue(message);
  }
});

export const updateBonusProgram = createAsyncThunk<
  BonusProgram,
  { id: string; data: Partial<BonusProgram> },
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/updateBonusProgram', async ({ id, data }, { rejectWithValue }) => {
  const validationError = validateId(id, 'program');
  if (validationError) {
    return rejectWithValue(validationError);
  }

  try {
    const response = await apiClient.put<BonusProgram>(`/bonus-programs/${id}`, data);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (!response.data) {
      return rejectWithValue('No data received');
    }

    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update bonus program';
    return rejectWithValue(message);
  }
});

export const deleteBonusProgram = createAsyncThunk<
  void,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusPrograms/deleteBonusProgram', async (id, { rejectWithValue }) => {
  const validationError = validateId(id, 'program');
  if (validationError) {
    return rejectWithValue(validationError);
  }

  try {
    const response = await apiClient.delete(`/bonus-programs/${id}`);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    // Success - no return value needed
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete bonus program';
    return rejectWithValue(message);
  }
});
