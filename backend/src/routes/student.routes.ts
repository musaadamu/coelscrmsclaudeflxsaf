import { Router } from 'express';
import { studentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { isOwner } from '../middleware/isOwner';

const router = Router();

// Full CRUD for Registrar / Super Admin
router.post(
  '/',
  authenticate,
  authorize('registrar', 'super_admin'),
  (req, res, next) => {
    studentController.createStudent(req, res, next);
  }
);

router.post(
  '/import',
  authenticate,
  authorize('registrar', 'super_admin'),
  (req, res, next) => {
    studentController.importCSV(req, res, next);
  }
);

router.get(
  '/',
  authenticate,
  authorize('registrar', 'super_admin'),
  (req, res, next) => {
    studentController.listStudents(req, res, next);
  }
);

// Student profile access
router.get(
  '/:id',
  authenticate,
  authorize('student', 'registrar', 'super_admin'),
  isOwner((req) => req.params.id),
  (req, res, next) => {
    studentController.getStudent(req, res, next);
  }
);

router.patch(
  '/:id',
  authenticate,
  authorize('student', 'registrar', 'super_admin'),
  isOwner((req) => req.params.id),
  (req, res, next) => {
    studentController.updateStudent(req, res, next);
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('registrar', 'super_admin'),
  (req, res, next) => {
    studentController.deleteStudent(req, res, next);
  }
);

export default router;
