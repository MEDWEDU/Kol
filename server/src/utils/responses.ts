import type { Response } from 'express';

export function ok(res: Response, data: unknown, statusCode = 200) {
  res.status(statusCode).json(data);
}
