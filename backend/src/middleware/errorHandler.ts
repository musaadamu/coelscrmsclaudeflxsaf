import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '@coels-crms/shared'
import logger from '../utils/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      data: { code: err.code },
    }
    res.status(err.statusCode).json(response)
    return
  }

  if (err.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      message: 'Validation error',
      errors: Object.entries(err.errors).map(([key, value]: any) => ({
        path: key,
        message: value.message,
      })),
    }
    res.status(400).json(response)
    return
  }

  if (err.name === 'CastError') {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid ID format',
    }
    res.status(400).json(response)
    return
  }

  // Default error
  const response: ApiResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  }
  res.status(err.statusCode || 500).json(response)
}
