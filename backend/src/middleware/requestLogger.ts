import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now()
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  })

  // Log response
  const originalSend = res.send
  res.send = function (data: any) {
    const duration = Date.now() - startTime
    logger.info(`← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    })

    return originalSend.call(this, data)
  }

  next()
}
