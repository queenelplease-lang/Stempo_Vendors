import { apiClient } from '../client';
import { News, PaginatedResponse } from '@/types';

export async function getNews(page = 1, pageSize = 20): Promise<PaginatedResponse<News>> {
  const response = await apiClient.get<PaginatedResponse<News>>(
    `/news?page=${page}&pageSize=${pageSize}`,
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No data received');
  }

  return response.data;
}

export async function getNewsById(id: string | number): Promise<News> {
  const response = await apiClient.get<News>(`/news/${id}`);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('News not found');
  }

  return response.data;
}
