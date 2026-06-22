import { Router } from 'express';
import { admissionController } from '../controllers/admission.controller';
import { authenticate, authorize } from '../middleware';
import { z } from 'zod';

const router = Router();

// Public routes
router.post('/cycles', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.createCycle(req, res, next);
});

router.get('/cycles', (req, res, next) => {
  admissionController.listCycles(req, res, next);
});

router.get('/cycles/:id', (req, res, next) => {
  admissionController.getCycle(req, res, next);
});

// Public application submission
router.post('/apply', (req, res, next) => {
  admissionController.submitApplication(req, res, next);
});

// Registrar-only routes
router.get('/', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.listCycles(req, res, next);
});

router.patch('/:id/shortlist', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.shortlistApplicant(req, res, next);
});

router.patch('/:id/admit', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.admitApplicant(req, res, next);
});

router.patch('/:id/reject', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.rejectApplicant(req, res, next);
});

router.get('/:cycleId/stats', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  admissionController.getStats(req, res, next);
});

export default router;
