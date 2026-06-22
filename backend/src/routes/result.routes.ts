import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'

const router = Router()

// Result routes
router.get('/', authenticate, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Get all results' })
})

router.get('/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'Get result by ID' })
})

router.post(
  '/',
  authenticate,
  authorize('lecturer', 'hod', 'registrar', 'admin'),
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ success: true, message: 'Create result' })
  }
)

export default router
