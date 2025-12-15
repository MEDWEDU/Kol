import type { ApiError } from '../api/http';

export function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return 'Something went wrong';
}

export function isApiError(err: unknown): err is ApiError {
  return Boolean(
    err &&
      typeof err === 'object' &&
      'isApiError' in err &&
      (err as { isApiError?: unknown }).isApiError === true,
  );
}
