import { ApiException } from '@/lib/api/errors';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export function getErrorCode(error: unknown): string {
  if (error instanceof ApiException) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

