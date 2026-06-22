import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload, ApiResponse } from '@coels-crms/shared'
import logger from '../utils/logger'
import User from '../models/user.model'
import { asyncContext } from '../utils/asyncContext'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1] || req.cookies?.accessToken

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required',
      }
      res.status(401).json(response)
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    // fetch user from DB to validate roles/permissions/isActive/lockedUntil
    const user = await User.findById(decoded.id).select('roles permissions isActive lockedUntil email').lean()
    if (!user || !user.isActive) {
      const response: ApiResponse = {
        success: false,
        message: 'Account inactive',
      }
      res.status(401).json(response)
      return
    }

    // attach enriched user to request
    req.user = { id: decoded.id, roles: user.roles || [], permissions: user.permissions || [], email: (user as any).email }

    // set async context for audit logging
    asyncContext.run({ userId: decoded.id, ip: req.ip, userAgent: req.headers['user-agent'] as string }, next)

  } catch (error) {
    logger.error('Authentication failed:', error)
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token',
    }
    res.status(401).json(response)
  }
}

export function optional(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      req.user = decoded
    }
  } catch (error) {
    logger.warn('Optional authentication failed:', error)
  }

  next()
}
