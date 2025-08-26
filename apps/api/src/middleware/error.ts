import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      errorCode: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors
    });
  }

  // Known application errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      errorCode: 'VALIDATION_ERROR',
      message: error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      errorCode: 'UNAUTHORIZED',
      message: error.message
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      errorCode: 'NOT_FOUND',
      message: error.message
    });
  }

  // Default server error
  res.status(500).json({
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    errorCode: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`
  });
}
