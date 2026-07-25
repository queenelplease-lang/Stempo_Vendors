import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { BonusRedemption } from '@/types';
import { AppDispatch } from '@/lib/store';

export const generateRedemptionCode = createAsyncThunk<
  BonusRedemption,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusRedemptions/generateCode', async (cardId, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<BonusRedemption>(
      `/bonus-redemptions/card/${cardId}/generate`
    );
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate redemption code';
    return rejectWithValue(message);
  }
});

export const redeemBonus = createAsyncThunk<
  BonusRedemption,
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusRedemptions/redeem', async (code, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<BonusRedemption>('/bonus-redemptions/redeem', {
      code,
    });
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to redeem bonus';
    return rejectWithValue(message);
  }
});

export const getRedemptionsByCard = createAsyncThunk<
  BonusRedemption[],
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('bonusRedemptions/getByCard', async (cardId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<BonusRedemption[]>(
      `/bonus-redemptions/card/${cardId}`
    );
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get redemptions';
    return rejectWithValue(message);
  }
});
