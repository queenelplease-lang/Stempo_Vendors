import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { LoyaltyCard } from '@/types';
import {
  setCards,
  setCurrentCard,
  setLoading,
  setError,
} from '@/lib/store/slices/loyaltyCardsSlice';
import { AppDispatch } from '@/lib/store';

export const getLoyaltyCardsByBusiness = createAsyncThunk<
  LoyaltyCard[],
  string | number,
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/getLoyaltyCardsByBusiness', async (businessId, { rejectWithValue }) => {
  if (!businessId || isNaN(Number(businessId))) {
    return rejectWithValue('Invalid business ID');
  }

  try {
    const response = await apiClient.get<LoyaltyCard[]>(`/loyalty-cards/by-business/${businessId}`);

    if (response.error) {
      if (response.error.message?.includes('unauthorized')) {
        return [];
      }
      return rejectWithValue(response.error.message);
    }

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get loyalty cards';
    return rejectWithValue(message);
  }
});

export const getLoyaltyCards = createAsyncThunk<
  LoyaltyCard[],
  void,
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/getLoyaltyCards', async (_, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<LoyaltyCard[]>('/loyalty-cards');
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch(setCards(response.data));
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get loyalty cards';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const getLoyaltyCardById = createAsyncThunk<
  LoyaltyCard,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/getLoyaltyCardById', async (id, { dispatch, rejectWithValue }) => {
  // Validate ID before making request
  if (!id || isNaN(Number(id)) || id.startsWith('business-') || id.startsWith('program-')) {
    const message = 'Invalid loyalty card ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }

  try {
    dispatch(setLoading(true));
    const response = await apiClient.get<LoyaltyCard>(`/loyalty-cards/${id}`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch(setCurrentCard(response.data));
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get loyalty card';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const createLoyaltyCard = createAsyncThunk<
  LoyaltyCard,
  { businessId: string },
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/createLoyaltyCard', async (data, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<LoyaltyCard>('/loyalty-cards', data);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch({ type: 'loyaltyCards/addCard', payload: response.data });
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create loyalty card';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const updateLoyaltyCard = createAsyncThunk<
  LoyaltyCard,
  { id: string; data: Partial<LoyaltyCard> },
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/updateLoyaltyCard', async ({ id, data }, { dispatch, rejectWithValue }) => {
  // Validate ID before making request
  if (!id || isNaN(Number(id)) || id.startsWith('business-') || id.startsWith('program-')) {
    const message = 'Invalid loyalty card ID';
    dispatch(setError(message));
    return rejectWithValue(message);
  }

  try {
    dispatch(setLoading(true));
    const response = await apiClient.put<LoyaltyCard>(`/loyalty-cards/${id}`, data);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch({ type: 'loyaltyCards/updateCard', payload: { id, updates: response.data } });
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update loyalty card';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});

export const addStamp = createAsyncThunk<
  LoyaltyCard,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('loyaltyCards/addStamp', async (cardId, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setLoading(true));
    const response = await apiClient.post<LoyaltyCard>(`/loyalty-cards/${cardId}/stamps`);
    
    if (response.error) {
      dispatch(setError(response.error.message));
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      dispatch({ type: 'loyaltyCards/updateCard', payload: { id: cardId, updates: response.data } });
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add stamp';
    dispatch(setError(message));
    return rejectWithValue(message);
  } finally {
    dispatch(setLoading(false));
  }
});
