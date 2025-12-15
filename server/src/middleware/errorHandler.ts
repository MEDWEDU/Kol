import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { MulterError } from 'multer';

import { HttpError } from '../utils/HttpError';

export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  let statusCode = 500;
  let message = err instanceof Error ? err.message : 'Unknown error';
  let details: unknown;

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof MulterError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code?: unknown }).code === 11000
  ) {
    statusCode = 409;
    const keyValue = (err as { keyValue?: unknown }).keyValue as
      | Record<string, unknown>
      | undefined;

    message = keyValue?.email ? 'Email already in use' : 'Duplicate key';
    details = keyValue;
  } else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  const payload: Record<string, unknown> = { message };

  if (details !== undefined) {
    payload.details = details;
  }

  if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
