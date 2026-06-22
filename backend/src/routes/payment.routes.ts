import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'

const router = Router()

// Payment routes
router.get(
  '/',
  authenticate,
  authorize('bursary', 'registrar', 'admin'),
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Get all payments' })
  }
)

router.post(
  '/initiate',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Initiate payment' })
  }
)

router.post(
  '/scratch-card/validate',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Validate scratch card' })
  }
)

export default router
