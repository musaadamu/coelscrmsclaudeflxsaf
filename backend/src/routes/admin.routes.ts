import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Import reconciliation
router.get(
  '/import/reconcile',
  authenticate,
  authorize('super_admin', 'registrar', 'bursary'),
  adminController.reconcileImport
);

// Import progress SSE
router.get(
  '/import/progress/:jobId',
  authenticate,
  authorize('super_admin', 'registrar', 'bursary'),
  adminController.importProgress
);

export default router;
