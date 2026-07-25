import { ApiError } from '@/types';

export class ApiException extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.details = error.details;
  }
}

export function handleApiError(response: { error?: ApiError }): never {
  if (response.error) {
    throw new ApiException(response.error);
  }
  throw new ApiException({
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  });
}

