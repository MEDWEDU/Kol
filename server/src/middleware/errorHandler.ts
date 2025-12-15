import type { ErrorRequestHandler } from 'express';

import { HttpError } from '../utils/HttpError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Unknown error';

  const payload: Record<string, unknown> = { message };

  if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
