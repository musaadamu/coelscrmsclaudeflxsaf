import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'

const router = Router()

// Student routes
router.get(
  '/',
  authenticate,
  authorize('registrar', 'admin'),
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Get all students' })
  }
)

router.get(
  '/:id',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Get student by ID' })
  }
)

router.patch(
  '/:id',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Update student' })
  }
)

export default router
