import { Router } from 'express';
import {
  transcriptController,
  staffController,
  hostelController,
  senateController,
} from '../controllers/modules.controller';
import {
  learningController,
  reportsController,
  alumniController,
  appraisalController,
  leaveController,
} from '../controllers/extended.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();

// Transcript routes
router.post('/transcripts/request', authenticate, authorize('student'), (req, res, next) => {
  transcriptController.requestTranscript(req, res, next);
});

router.get('/transcripts', authenticate, authorize('student'), (req, res, next) => {
  transcriptController.listMyTranscripts(req, res, next);
});

router.patch('/transcripts/:id/approve', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  transcriptController.approveTranscript(req, res, next);
});

router.patch('/transcripts/:id/dispatch', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  transcriptController.dispatchTranscript(req, res, next);
});

router.get('/transcripts/:id/download', authenticate, authorize('student'), (req, res, next) => {
  transcriptController.downloadTranscript(req, res, next);
});

router.get('/transcripts/verify/:token', (req, res, next) => {
  transcriptController.verifyTranscript(req, res, next);
});

// Staff routes
router.post('/staff', authenticate, authorize('super_admin'), (req, res, next) => {
  staffController.createStaff(req, res, next);
});

router.get('/staff', authenticate, (req, res, next) => {
  staffController.listStaff(req, res, next);
});

router.post('/staff/:id/courses', authenticate, authorize('super_admin'), (req, res, next) => {
  staffController.assignCourses(req, res, next);
});

router.get('/staff/my-courses', authenticate, authorize('lecturer'), (req, res, next) => {
  staffController.getMyCourses(req, res, next);
});

router.patch('/staff/:id/roles', authenticate, authorize('super_admin'), (req, res, next) => {
  staffController.updateRoles(req, res, next);
});

// Hostel routes
router.post('/hostel-allocations', authenticate, authorize('student'), (req, res, next) => {
  hostelController.bookRoom(req, res, next);
});

router.patch('/hostel-allocations/:id/confirm', authenticate, authorize('hostel_officer', 'super_admin'), (req, res, next) => {
  hostelController.confirmAllocation(req, res, next);
});

router.get('/hostel-allocations/my-allocation/:sessionId', authenticate, authorize('student'), (req, res, next) => {
  hostelController.getMyAllocation(req, res, next);
});

router.get('/hostel-rooms/available', (req, res, next) => {
  hostelController.getAvailableRooms(req, res, next);
});

// Senate routes
router.post('/senate/meetings', authenticate, authorize('vc', 'super_admin'), (req, res, next) => {
  senateController.createMeeting(req, res, next);
});

router.get('/senate/meetings', authenticate, (req, res, next) => {
  senateController.listMeetings(req, res, next);
});

router.post('/senate/meetings/:meetingId/prayers', authenticate, authorize('senate_member'), (req, res, next) => {
  senateController.submitPrayer(req, res, next);
});

router.post('/senate/prayers/:prayerId/vote', authenticate, authorize('senate_member'), (req, res, next) => {
  senateController.votePrayer(req, res, next);
});

router.patch('/senate/prayers/:prayerId/decide', authenticate, authorize('vc', 'super_admin'), (req, res, next) => {
  senateController.decidePrayer(req, res, next);
});

router.post('/senate/meetings/:id/conclude', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  senateController.concludeMeeting(req, res, next);
});

router.get('/senate/meetings/:meetingId/prayers', authenticate, (req, res, next) => {
  senateController.getPrayersForMeeting(req, res, next);
});

// Learning routes
router.post('/learning/modules', authenticate, authorize('lecturer'), (req, res, next) => {
  learningController.createModule(req, res, next);
});

router.post('/learning/resources/:moduleId', authenticate, authorize('lecturer'), (req, res, next) => {
  learningController.uploadResource(req, res, next);
});

router.get('/learning/modules/:moduleId/resources', authenticate, (req, res, next) => {
  learningController.getModuleResources(req, res, next);
});

router.post('/learning/progress/:resourceId', authenticate, (req, res, next) => {
  learningController.trackProgress(req, res, next);
});

router.get('/learning/progress', authenticate, (req, res, next) => {
  learningController.getStudentProgress(req, res, next);
});

router.get('/learning/resources/:resourceId/stream', authenticate, (req, res, next) => {
  learningController.streamResource(req, res, next);
});

// Reports routes
router.get('/reports/ncce-enrolment', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  reportsController.getNCCEEnrolment(req, res, next);
});

router.get('/reports/nysc-list', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  reportsController.getNYSCList(req, res, next);
});

router.get('/reports/export', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  reportsController.exportReport(req, res, next);
});

// Alumni routes
router.post('/alumni', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  alumniController.createAlumni(req, res, next);
});

router.get('/alumni', authenticate, (req, res, next) => {
  alumniController.listAlumni(req, res, next);
});

router.get('/alumni/verify/:token', (req, res, next) => {
  alumniController.verifyAlumni(req, res, next);
});

router.get('/alumni/export', authenticate, authorize('registrar', 'super_admin'), (req, res, next) => {
  alumniController.exportAlumni(req, res, next);
});

// Appraisal routes
router.post('/hrms/appraisals', authenticate, authorize('staff'), (req, res, next) => {
  appraisalController.createAppraisal(req, res, next);
});

router.patch('/hrms/appraisals/:id/submit', authenticate, authorize('staff'), (req, res, next) => {
  appraisalController.submitAppraisal(req, res, next);
});

router.patch('/hrms/appraisals/:id/approve', authenticate, authorize('super_admin', 'vc'), (req, res, next) => {
  appraisalController.approveAppraisal(req, res, next);
});

router.get('/hrms/appraisals', authenticate, (req, res, next) => {
  appraisalController.getMyAppraisals(req, res, next);
});

// Leave routes
router.post('/hrms/leave-requests', authenticate, authorize('staff'), (req, res, next) => {
  leaveController.requestLeave(req, res, next);
});

router.patch('/hrms/leave-requests/:id/approve', authenticate, authorize('hod', 'vc', 'super_admin'), (req, res, next) => {
  leaveController.approveLeave(req, res, next);
});

router.patch('/hrms/leave-requests/:id/reject', authenticate, authorize('hod', 'vc', 'super_admin'), (req, res, next) => {
  leaveController.rejectLeave(req, res, next);
});

router.get('/hrms/leave-requests', authenticate, (req, res, next) => {
  leaveController.getMyLeaves(req, res, next);
});

router.get('/hrms/leave-requests/pending', authenticate, authorize('hod', 'vc', 'super_admin'), (req, res, next) => {
  leaveController.getPendingLeaves(req, res, next);
});

export default router;
