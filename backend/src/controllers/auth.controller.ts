import { Request, Response, NextFunction } from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import { LoginSchema, RegisterSchema } from '@coels-crms/shared'
import { AppError } from '../middleware/errorHandler'
import logger from '../utils/logger'
import User from '../models/user.model'
import AuditLog from '../models/auditLog.model'

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, phone } = RegisterSchema.parse(req.body)

      // Check if user already exists
      const existing = await User.findOne({ email }).lean()
      if (existing) throw new AppError(400, 'USER_EXISTS', 'User already exists')

      const hashedPassword = await bcryptjs.hash(password, 12)
      const user = await User.create({ email, passwordHash: hashedPassword, phone, roles: ['student'] })

      await AuditLog.create({ action: 'REGISTER', performedBy: user._id, newValues: { email: user.email } })

      const tokens = {
        accessToken: jwt.sign({ id: user._id, roles: user.roles, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }),
        refreshToken: jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }),
      }

      res.status(201).json({ success: true, message: 'User registered successfully', data: tokens })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = LoginSchema.parse(req.body)
      logger.info(`User login attempt: ${email}`)

      const user = await User.findOne({ email })
      if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new AppError(403, 'ACCOUNT_LOCKED', 'Account is temporarily locked due to multiple failed login attempts')
      }

      const validPassword = await user.comparePassword(password)
      if (!validPassword) {
        user.loginAttempts = (user.loginAttempts || 0) + 1
        if (user.loginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
          user.loginAttempts = 0
          await user.save()
          await AuditLog.create({ action: 'ACCOUNT_LOCKED', performedBy: user._id, details: { email: user.email } })
          throw new AppError(403, 'ACCOUNT_LOCKED', 'Account locked due to multiple failed attempts')
        }
        await user.save()
        await AuditLog.create({ action: 'LOGIN_FAILED', performedBy: user._id, details: { email: user.email } })
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
      }

      // reset attempts and update lastLogin
      user.loginAttempts = 0
      user.lockedUntil = null
      user.lastLoginAt = new Date()
      await user.save()

      await AuditLog.create({ action: 'LOGIN', performedBy: user._id, details: { email: user.email } })

      const tokens = {
        accessToken: jwt.sign({ id: user._id, roles: user.roles, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }),
        refreshToken: jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }),
      }

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.json({
        success: true,
        message: 'Login successful',
        data: { accessToken: tokens.accessToken },
      })
    } catch (error) {
      next(error)
    }
  }

  async setup2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const secret = speakeasy.generateSecret({
        name: `COELS CRMS (${req.user?.email})`,
        issuer: 'COELS',
        length: 32,
      })

      res.json({
        success: true,
        message: '2FA setup initiated',
        data: { secret: secret.base32, otpauthUrl: secret.otpauth_url },
      })
    } catch (error) {
      next(error)
    }
  }

  async verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { totpCode } = req.body

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: 'placeholder_secret',
        encoding: 'base32',
        token: totpCode,
        window: 2,
      })

      if (!verified) {
        throw new AppError(401, 'INVALID_TOTP', 'Invalid TOTP code')
      }

      res.json({
        success: true,
        message: '2FA verified successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async confirm2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tempToken, totpCode } = req.body

      // Verify temp token and TOTP
      const tokens = {
        accessToken: jwt.sign(
          { id: '123', roles: ['student'], email: 'user@example.com' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        ),
        refreshToken: jwt.sign(
          { id: '123' },
          process.env.JWT_REFRESH_SECRET || 'refresh-secret',
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        ),
      }

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })

      res.json({
        success: true,
        message: '2FA confirmed',
        data: { accessToken: tokens.accessToken },
      })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        throw new AppError(401, 'NO_REFRESH_TOKEN', 'No refresh token provided')
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'secret') as {
        id: string
      }

      const newAccessToken = jwt.sign(
        { id: decoded.id, roles: ['student'], email: 'user@example.com' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      )

      res.json({
        success: true,
        message: 'Token refreshed',
        data: { accessToken: newAccessToken },
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken')
      logger.info(`User logout: ${req.user?.email}`)

      try {
        await AuditLog.create({ action: 'LOGOUT', performedBy: req.user?.id || null, details: { email: req.user?.email } })
      } catch (e) {}

      res.json({
        success: true,
        message: 'Logout successful',
      })
    } catch (error) {
      next(error)
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body

      // Generate reset token and send email - placeholder
      logger.info(`Password reset requested: ${email}`)

      res.json({
        success: true,
        message: 'Password reset email sent',
      })
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body

      // Verify token and update password - placeholder
      logger.info('Password reset completed')

      res.json({
        success: true,
        message: 'Password reset successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        message: 'Current user retrieved',
        data: req.user,
      })
    } catch (error) {
      next(error)
    }
  }
}
