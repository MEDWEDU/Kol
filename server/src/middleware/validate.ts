import type { ObjectSchema } from 'joi';
import type { RequestHandler } from 'express';

import { HttpError } from '../utils/HttpError';

export function validateBody(schema: ObjectSchema): RequestHandler {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(
        new HttpError(
          400,
          'Validation error',
          error.details.map((d) => ({ path: d.path, message: d.message })),
        ),
      );
    }

    req.body = value;
    next();
  };
}
