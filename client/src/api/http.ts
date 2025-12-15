import axios, { AxiosError } from 'axios';

export type ApiError = {
  isApiError: true;
  status: number;
  message: string;
  details?: unknown;
};

function toApiError(error: unknown): ApiError {
  const fallback: ApiError = {
    isApiError: true,
    status: 0,
    message: 'Network error',
  };

  if (!error || typeof error !== 'object') return fallback;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: unknown; details?: unknown }>;

    const status = axiosError.response?.status ?? 0;
    const payload = axiosError.response?.data;

    const message =
      (payload?.message && typeof payload.message === 'string'
        ? payload.message
        : axiosError.message) || fallback.message;

    const details = payload?.details;

    return { isApiError: true, status, message, details };
  }

  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return {
      ...fallback,
      message: (error as { message: string }).message,
    };
  }

  return fallback;
}

const baseURL = import.meta.env.VITE_API_URL
  ? new URL('/api', import.meta.env.VITE_API_URL).toString()
  : '/api';

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

http.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(toApiError(error)),
);
