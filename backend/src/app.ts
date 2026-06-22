import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { ApiResponse } from '@coels-crms/shared'
import logger from './utils/logger'
import authRoutes from './routes/auth.routes'
import { paymentController } from './controllers/core.controller'
import studentRoutes from './routes/student.routes'
import courseRoutes from './routes/course.routes'
import resultRoutes from './routes/result.routes'
import paymentRoutes from './routes/payment.routes'
import admissionRoutes from './routes/admission.routes'
import modulesRoutes from './routes/modules.routes'
import extendedRoutes from './routes/extended.routes'
import adminRoutes from './routes/admin.routes'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { mongoSanitize, sanitizeInputs, applySecurity, rateLimit } from './middleware/security'

const app: Express = express()

// Trust proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}))

// Paystack webhook must preserve raw body for signature verification
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    paymentController.verifyWebhook(req, res, next)
  }
)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Input sanitization
app.use(mongoSanitize)
app.use(sanitizeInputs)

// Apply helmet/CSP and global rate limiting
applySecurity(app)

// Auth-specific stricter rate limit
app.use('/api/auth', rateLimit({ prefix: 'auth', max: parseInt(process.env.AUTH_RATE_LIMIT || '10'), windowSeconds: 15 * 60 }))

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Health check passed',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    }
    res.json(response)
  } catch (error) {
    logger.error('Health check failed', error)
    const response: ApiResponse = {
      success: false,
      message: 'Health check failed',
      data: { status: 'error' },
    }
    res.status(503).json(response)
  }
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/admissions', admissionRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api', modulesRoutes)
app.use('/api', extendedRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
  }
  res.status(404).json(response)
})

// Error handler (must be last)
app.use(errorHandler)

export default app
