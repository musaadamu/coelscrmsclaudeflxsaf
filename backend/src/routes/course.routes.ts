import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'

const router = Router()

// Course routes
router.get('/', authenticate, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Get all courses' })
})

router.get('/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Get course by ID' })
})

router.post(
  '/',
  authenticate,
  authorize('hod', 'registrar', 'admin'),
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Create course' })
  }
)

export default router
