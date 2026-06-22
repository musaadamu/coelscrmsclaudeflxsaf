import { admissionCycleRepository } from '../repositories/admissionCycle.repository';
import { applicantRepository } from '../repositories/applicant.repository';
import { emailQueue } from '../workers/queues';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Applicant from '../models/applicant.model';
import User from '../models/user.model';
import Student from '../models/student.model';
import bcryptjs from 'bcryptjs';
import { getAsyncContext } from '../utils/asyncContext';
import AuditLog from '../models/auditLog.model';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export class AdmissionService {
  async createCycle(data: any) {
    const cycle = await admissionCycleRepository.create(data);
    return cycle;
  }

  async getCycle(id: string) {
    return await admissionCycleRepository.findById(id);
  }

  async listCycles(options: any = {}) {
    return await admissionCycleRepository.findAll({}, options);
  }

  async updateCycle(id: string, data: any) {
    return await admissionCycleRepository.updateById(id, data);
  }

  async submitApplication(cycleId: string, applicantData: any, documentUrls: string[]) {
    const cycle = await admissionCycleRepository.findById(cycleId);
    
    if (cycle.status !== 'OPEN') {
      throw new AppError(400, 'CYCLE_CLOSED', 'Admission cycle is not open for applications');
    }

    const applicant = await applicantRepository.create({
      cycle: cycleId,
      programme: applicantData.programme,
      email: applicantData.email,
      firstName: applicantData.firstName,
      lastName: applicantData.lastName,
      dateOfBirth: applicantData.dateOfBirth,
      gender: applicantData.gender,
      phoneNumber: applicantData.phoneNumber,
      state: applicantData.state,
      lga: applicantData.lga,
      status: 'APPLIED',
      documents: documentUrls,
      submittedAt: new Date(),
    });

    // Log audit
    const context = getAsyncContext();
    if (context?.userId) {
      await AuditLog.create({
        userId: context.userId,
        action: 'APPLICATION_SUBMITTED',
        resource: 'Applicant',
        resourceId: applicant._id,
        details: { cycleId, email: applicantData.email },
        ipAddress: context.ip,
      });
    }

    return applicant;
  }

  async shortlistApplicant(applicantId: string, adminId: string) {
    const applicant = await applicantRepository.updateById(applicantId, { status: 'SHORTLISTED' });

    await AuditLog.create({
      userId: adminId,
      action: 'APPLICANT_SHORTLISTED',
      resource: 'Applicant',
      resourceId: applicantId,
      details: { email: applicant.email },
    });

    return applicant;
  }

  async admitApplicant(applicantId: string, adminId: string) {
    const applicant = await applicantRepository.findById(applicantId);
    
    if (applicant.status !== 'SHORTLISTED') {
      throw new AppError(400, 'INVALID_STATUS', 'Applicant must be shortlisted before admission');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Update applicant status
      await applicantRepository.updateById(applicantId, { status: 'ADMITTED' });

      // 2. Generate temp password
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const passwordHash = await bcryptjs.hash(tempPassword, BCRYPT_ROUNDS);

      // 3. Create User
      const user = await User.create(
        [
          {
            email: applicant.email,
            passwordHash,
            roles: ['student'],
            status: 'ACTIVE',
          },
        ],
        { session }
      );

      // 4. Generate matriculation number
      const cycle = await admissionCycleRepository.findById(applicant.cycle.toString());
      const programme = cycle.programme;
      const year = new Date().getFullYear();
      const sequence = await Student.countDocuments({
        programme,
        currentLevel: 100,
      });
      const matricNo = `COELS/${programme}/${year}/${String(sequence + 1).padStart(4, '0')}`;

      // 5. Create Student
      const student = await Student.create(
        [
          {
            user: user[0]._id,
            programme: applicant.programme,
            matricNo,
            currentLevel: 100,
            status: 'ACTIVE',
            admissionSession: applicant.cycle,
          },
        ],
        { session }
      );

      // 6. Queue admission email
      await emailQueue.add('admission-offer', {
        to: applicant.email,
        template: 'admission-offer',
        context: {
          applicantName: `${applicant.firstName} ${applicant.lastName}`,
          programme: cycle.programme,
          session: cycle.academicSession,
          tempPassword,
          portalUrl: process.env.FRONTEND_URL,
        },
      });

      // 7. Create admission decision
      await applicantRepository.updateById(applicantId, {
        decision: {
          status: 'ADMITTED',
          admittedBy: adminId,
          admittedAt: new Date(),
          notes: 'Automatic admission via batch processing',
        },
      });

      await session.commitTransaction();

      await AuditLog.create({
        userId: adminId,
        action: 'APPLICANT_ADMITTED',
        resource: 'Applicant',
        resourceId: applicantId,
        details: { email: applicant.email, matricNo, tempPassword },
      });

      return { matricNo, tempPassword, studentId: student[0]._id };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async rejectApplicant(applicantId: string, adminId: string, reason: string) {
    const applicant = await applicantRepository.updateById(applicantId, {
      status: 'REJECTED',
      decision: {
        status: 'REJECTED',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        reason,
      },
    });

    // Queue rejection email
    await emailQueue.add('rejection-notice', {
      to: applicant.email,
      template: 'rejection-notice',
      context: {
        applicantName: `${applicant.firstName} ${applicant.lastName}`,
        reason,
        portalUrl: process.env.FRONTEND_URL,
      },
    });

    await AuditLog.create({
      userId: adminId,
      action: 'APPLICANT_REJECTED',
      resource: 'Applicant',
      resourceId: applicantId,
      details: { email: applicant.email, reason },
    });

    return applicant;
  }

  async getApplicantStats(cycleId: string) {
    return await applicantRepository.countByStatus(cycleId);
  }
}

export const admissionService = new AdmissionService();
