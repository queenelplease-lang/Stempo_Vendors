import { apiClient } from '../client';
import { Business } from '@/types';

export async function getRestaurant(): Promise<Business> {
  const response = await apiClient.get<Business>('/restaurant');

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Restaurant not found');
  }

  return response.data;
}
