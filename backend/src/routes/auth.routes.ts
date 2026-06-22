import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, optional } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { AuthController } from '../controllers/auth.controller'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/register', (req: Request, res: Response, next: NextFunction) =>
  authController.register(req, res, next)
)

router.post('/login', (req: Request, res: Response, next: NextFunction) =>
  authController.login(req, res, next)
)

router.post('/forgot-password', (req: Request, res: Response, next: NextFunction) =>
  authController.forgotPassword(req, res, next)
)

router.post('/reset-password', (req: Request, res: Response, next: NextFunction) =>
  authController.resetPassword(req, res, next)
)

// Protected routes
router.post('/2fa/setup', authenticate, (req: Request, res: Response, next: NextFunction) =>
  authController.setup2FA(req, res, next)
)

router.post('/2fa/verify', authenticate, (req: Request, res: Response, next: NextFunction) =>
  authController.verify2FA(req, res, next)
)

router.post('/2fa/confirm', (req: Request, res: Response, next: NextFunction) =>
  authController.confirm2FA(req, res, next)
)

router.post('/refresh', (req: Request, res: Response, next: NextFunction) =>
  authController.refresh(req, res, next)
)

router.post('/logout', authenticate, (req: Request, res: Response, next: NextFunction) =>
  authController.logout(req, res, next)
)

router.get('/me', authenticate, (req: Request, res: Response, next: NextFunction) =>
  authController.getCurrentUser(req, res, next)
)

export default router
