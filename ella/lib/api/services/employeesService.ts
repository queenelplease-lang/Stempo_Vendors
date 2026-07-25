import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../client';
import { AppDispatch } from '@/lib/store';

export interface Employee {
  id: number;
  userId: number;
  businessId: number;
  user: {
    id: number;
    email: string;
    name?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getEmployees = createAsyncThunk<
  Employee[],
  string,
  { dispatch: AppDispatch; rejectValue: string }
>('employees/getEmployees', async (businessId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<Employee[]>(`/employees/business/${businessId}`);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get employees';
    return rejectWithValue(message);
  }
});

export const addEmployee = createAsyncThunk<
  Employee,
  { businessId: string; email: string },
  { dispatch: AppDispatch; rejectValue: string }
>('employees/addEmployee', async ({ businessId, email }, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<Employee>(`/employees/business/${businessId}`, {
      email,
    });
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    if (response.data) {
      return response.data;
    }
    
    return rejectWithValue('No data received');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add employee';
    return rejectWithValue(message);
  }
});

export const removeEmployee = createAsyncThunk<
  void,
  { businessId: string; employeeId: string },
  { dispatch: AppDispatch; rejectValue: string }
>('employees/removeEmployee', async ({ businessId, employeeId }, { rejectWithValue }) => {
  try {
    const response = await apiClient.delete(`/employees/business/${businessId}/${employeeId}`);
    
    if (response.error) {
      return rejectWithValue(response.error.message);
    }
    
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove employee';
    return rejectWithValue(message);
  }
});
