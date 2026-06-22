import {
  reportRepository,
  alumniRepository,
  staffAppraisalRepository,
  staffLeaveRequestRepository,
} from '../repositories/misc.repository';
import { Student } from '../models/student.model';
import Alumni from '../models/alumni.model';
import crypto from 'crypto';

export class ReportsService {
  async generateNCCEEnrolmentReport(sessionId: string, programmeId?: string) {
    const cacheKey = `report:ncce:${sessionId}:${programmeId || 'all'}`;

    // Check cache
    const cached = await reportRepository.findByType('NCCE_ENROLMENT');
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    // Aggregate report
    const data = await Student.aggregate([
      {
        $match: {
          ...(programmeId && { programme: programmeId }),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'programmes',
          localField: 'programme',
          foreignField: '_id',
          as: 'programme',
        },
      },
      { $unwind: '$programme' },
      {
        $group: {
          _id: { programme: '$programme.name', level: '$currentLevel', gender: '$gender' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.programme': 1, '_id.level': 1, '_id.gender': 1 },
      },
    ]);

    // Cache result
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await reportRepository.create({
      reportType: 'NCCE_ENROLMENT',
      data,
      expiresAt,
      generatedAt: new Date(),
    });

    return data;
  }

  async generateNYSCList(sessionId: string) {
    const alumni = await Alumni.find({
      graduationSession: sessionId,
      isDeleted: false,
    })
      .populate('student')
      .populate('programme')
      .lean();

    return alumni.map((a: any) => ({
      name: `${a.student.firstName} ${a.student.lastName}`,
      matricNo: a.student.matricNo,
      lga: a.student.lga,
      stateOfOrigin: a.student.state,
      programme: a.programme.name,
      graduationYear: new Date(a.createdAt).getFullYear(),
      phone: a.student.phoneNumber,
      photoUrl: a.student.photoUrl,
    }));
  }

  async exportReport(reportType: string, format: 'CSV' | 'PDF') {
    // Implementation depends on library choice
    // For now, return data and let client handle export
    const report = await reportRepository.findByType(reportType);
    try {
      const { getAsyncContext } = require('../utils/asyncContext')
      const context = getAsyncContext()
      const AuditLog = require('../models/auditLog.model')
      await AuditLog.create({ action: 'EXPORT', performedBy: context.userId || null, details: { reportType, format } })
    } catch (e) {
      // swallow audit failures
    }
    return report?.data || [];
  }
}

export class AlumniService {
  async createAlumni(studentId: string, sessionId: string) {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    return await alumniRepository.create({
      student: studentId,
      graduationSession: sessionId,
      verificationToken,
      status: 'PENDING',
      createdAt: new Date(),
    });
  }

  async verifyAlumni(token: string) {
    const alumni = await alumniRepository.findByToken(token);
    if (!alumni) {
      throw new Error('Verification token not found');
    }

    return alumni;
  }

  async getAlumni(id: string) {
    return await alumniRepository.findById(id);
  }

  async listAlumni(options: any = {}) {
    return await alumniRepository.findAll(options);
  }

  async updateAlumni(id: string, data: any) {
    return await alumniRepository.updateById(id, data);
  }

  async exportAlumni(sessionId: string, format: 'CSV' | 'JSON') {
    const alumni = await Alumni.find({ graduationSession: sessionId })
      .populate('student')
      .lean();

    const exportData = alumni.map((a: any) => ({
      name: `${a.student.firstName} ${a.student.lastName}`,
      email: a.student.email,
      matricNo: a.student.matricNo,
      programme: a.student.programme,
      phone: a.student.phoneNumber,
      state: a.student.state,
      lga: a.student.lga,
    }));

    return exportData;
  }
}

export class AppraisalService {
  async createAppraisal(staffId: string, appraiserListId: string, data: any) {
    return await staffAppraisalRepository.create({
      staff: staffId,
      appraiserList: appraiserListId,
      ...data,
      status: 'DRAFT',
    });
  }

  async submitAppraisal(appraisalId: string) {
    return await staffAppraisalRepository.updateById(appraisalId, {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });
  }

  async approveAppraisal(appraisalId: string, approverId: string) {
    return await staffAppraisalRepository.updateById(appraisalId, {
      status: 'APPROVED',
      approvedBy: approverId,
      approvedAt: new Date(),
    });
  }

  async getStaffAppraisals(staffId: string, options: any = {}) {
    return await staffAppraisalRepository.findByStaff(staffId, options);
  }
}

export class LeaveService {
  async requestLeave(staffId: string, data: any) {
    return await staffLeaveRequestRepository.create({
      staff: staffId,
      ...data,
      status: 'PENDING',
      requestedAt: new Date(),
    });
  }

  async approveLeave(requestId: string, approverI: string) {
    return await staffLeaveRequestRepository.updateById(requestId, {
      status: 'APPROVED',
      approvedBy: approverI,
      approvedAt: new Date(),
    });
  }

  async rejectLeave(requestId: string, rejectionReason: string) {
    return await staffLeaveRequestRepository.updateById(requestId, {
      status: 'REJECTED',
      rejectionReason,
    });
  }

  async getStaffLeaves(staffId: string, options: any = {}) {
    return await staffLeaveRequestRepository.findByStaff(staffId, options);
  }

  async getPendingLeaves() {
    return await staffLeaveRequestRepository.findByStatus('PENDING');
  }
}

export const reportsService = new ReportsService();
export const alumniService = new AlumniService();
export const appraisalService = new AppraisalService();
export const leaveService = new LeaveService();
