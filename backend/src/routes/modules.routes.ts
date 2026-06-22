import { Router } from 'express';
import { enrolmentController, resultController, paymentController } from '../controllers/core.controller';
import { authenticate, authorize } from '../middleware';
import { isOwner } from '../middleware/isOwner';

const router = Router();

// Course Enrolments
router.post('/enrolments', authenticate, authorize('student'), (req, res, next) => {
  enrolmentController.registerCourses(req, res, next);
});

router.get('/enrolments/my-courses/:semesterId', authenticate, authorize('student'), (req, res, next) => {
  enrolmentController.getMyCourses(req, res, next);
});

router.delete('/enrolments/:id', authenticate, authorize('student'), (req, res, next) => {
  enrolmentController.dropCourse(req, res, next);
});

// Results
router.post('/results/bulk', authenticate, authorize('lecturer', 'hod', 'registrar', 'super_admin'), (req, res, next) => {
  resultController.bulkUpload(req, res, next);
});

router.get('/results/:studentId', authenticate, authorize('student', 'lecturer', 'hod', 'registrar', 'super_admin'), isOwner(req => req.params.studentId), (req, res, next) => {
  resultController.getStudentResults(req, res, next);
});

router.patch('/results/:id/approve', authenticate, authorize('hod', 'registrar', 'super_admin'), (req, res, next) => {
  resultController.approveResult(req, res, next);
});

router.post('/results/publish', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  resultController.publishResults(req, res, next);
});

router.get('/cgpa/:studentId', authenticate, authorize('student', 'registrar', 'super_admin'), isOwner(req => req.params.studentId), (req, res, next) => {
  resultController.getStudentCGPA(req, res, next);
});

// Payments
router.post('/payments/initiate', authenticate, authorize('student'), (req, res, next) => {
  paymentController.initiatePaystack(req, res, next);
});

router.post('/payments/scratch-card', authenticate, authorize('student'), (req, res, next) => {
  paymentController.redeemScratchCard(req, res, next);
});

router.post('/scratch-cards/generate', authenticate, authorize('bursary', 'super_admin'), (req, res, next) => {
  paymentController.generateScratchCards(req, res, next);
});

export default router;
