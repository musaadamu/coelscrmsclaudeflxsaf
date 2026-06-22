import { Request, Response, NextFunction, Application } from 'express'
import Redis from 'ioredis'

const redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379') })

export function mongoSanitize(req: Request, res: Response, next: NextFunction) {
  function sanitize(obj: any) {
    if (Array.isArray(obj)) return obj.forEach(sanitize)
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.indexOf('.') !== -1) {
          delete obj[key]
        } else {
          sanitize(obj[key])
        }
      }
    }
  }
  sanitize(req.body)
  sanitize(req.query)
  sanitize(req.params)
  next()
}

export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  function clean(obj: any) {
    if (Array.isArray(obj)) return obj.map(clean)
    if (obj && typeof obj === 'object') {
      const out: any = {}
      for (const k of Object.keys(obj)) {
        out[k] = clean(obj[k])
      }
      return out
    }
    if (typeof obj === 'string') {
      return obj.replace(/<[^>]*>?/gm, '')
    }
    return obj
  }
  req.body = clean(req.body)
  next()
}

export function rateLimit({ prefix = 'rl', max = 100, windowSeconds = 900 } = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown'
      const key = `${prefix}:${ip}`
      const current = await redis.incr(key)
      if (current === 1) await redis.expire(key, windowSeconds)
      if (current > max) {
        res.status(429).json({ success: false, message: 'Too many requests' })
        return
      }
      next()
    } catch (err) {
      next()
    }
  }
}

export function applySecurity(app: Application) {
  // Helmet and CSP
  try {
    const helmet = require('helmet')
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'js.paystack.co'],
          imgSrc: ["'self'", 'data:', '*.amazonaws.com', '*.cloudfront.net']
        }
      }
    }))
  } catch (e) {
    // ignore if helmet not installed
  }

  // global rate limiter
  app.use(rateLimit({ prefix: 'global', max: parseInt(process.env.GLOBAL_RATE_LIMIT || '300'), windowSeconds: 15 * 60 }))
}
