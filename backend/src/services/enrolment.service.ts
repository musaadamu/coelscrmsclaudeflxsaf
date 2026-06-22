import { enrolmentRepository } from '../repositories/enrolment.repository';
import { courseOfferingRepository } from '../repositories/course.repository';
import { studentFeeRepository } from '../repositories/course.repository';
import { semesterRepository } from '../repositories/index';
import { AppError } from '../middleware/errorHandler';
import Enrolment from '../models/enrolment.model';
import AuditLog from '../models/auditLog.model';

export class EnrolmentService {
  async registerCourses(studentId: string, courseOfferingIds: string[], semesterId: string) {
    // 1. Verify student fees are cleared for session
    const studentFees = await studentFeeRepository.findByStudentAndSession(studentId, semesterId);
    if (studentFees && studentFees.status === 'UNPAID') {
      throw new AppError(403, 'FEES_UNPAID', 'Please clear your fees before registering courses');
    }

    // 2. Check semester registration is open
    const semester = await semesterRepository.findById(semesterId);
    const now = new Date();
    if (now < semester.registrationStart || now > semester.registrationDeadline) {
      throw new AppError(400, 'REGISTRATION_CLOSED', 'Course registration is not open');
    }

    // 3. Validate credit units (12-24)
    let totalCredits = 0;
    const offerings: any[] = [];
    for (const offeringId of courseOfferingIds) {
      const offering = await courseOfferingRepository.findById(offeringId);
      if (!offering) {
        throw new AppError(404, 'NOT_FOUND', `Course offering ${offeringId} not found`);
      }
      offerings.push(offering);
      totalCredits += offering.course.creditUnits;
    }

    if (totalCredits < 12 || totalCredits > 24) {
      throw new AppError(400, 'INVALID_CREDITS', `Total credits must be between 12 and 24, got ${totalCredits}`);
    }

    // 4. Create enrolments
    const enrolments = courseOfferingIds.map((offeringId) => ({
      student: studentId,
      courseOffering: offeringId,
      semester: semesterId,
      status: 'ACTIVE',
    }));

    const created = await Enrolment.insertMany(enrolments, { ordered: false });

    // 5. Update enrollment count
    for (const offeringId of courseOfferingIds) {
      await courseOfferingRepository.incrementEnrolledCount(offeringId, 1);
    }

    return created;
  }

  async dropCourse(enrolmentId: string, studentId: string) {
    const enrolment = await enrolmentRepository.findById(enrolmentId);
    if (!enrolment || enrolment.student.toString() !== studentId) {
      throw new AppError(404, 'NOT_FOUND', 'Enrolment not found');
    }

    // Check add/drop deadline
    const semester = await semesterRepository.findById(enrolment.semester.toString());
    const now = new Date();
    if (now > semester.addDropDeadline) {
      throw new AppError(403, 'DEADLINE_PASSED', 'Add/drop deadline has passed');
    }

    // Update enrolment
    const updated = await enrolmentRepository.updateById(enrolmentId, { status: 'DROPPED' });

    // Decrement enrollment count
    await courseOfferingRepository.incrementEnrolledCount(enrolment.courseOffering.toString(), -1);

    return updated;
  }

  async getStudentCourses(studentId: string, semesterId: string, options: any = {}) {
    return await enrolmentRepository.findByStudentAndSemester(studentId, semesterId, options);
  }

  async getCourseEnrolments(courseOfferingId: string) {
    return await enrolmentRepository.findByCourseOffering(courseOfferingId);
  }

  async getEnrolmentCount(studentId: string, semesterId: string) {
    return await enrolmentRepository.countByStudent(studentId, semesterId);
  }
}

export const enrolmentService = new EnrolmentService();
