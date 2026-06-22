import { transcriptRepository } from '../repositories/transcript.repository';
import { studentFeeRepository } from '../repositories/course.repository';
import { resultRepository } from '../repositories/result.repository';
import { pdfQueue, emailQueue } from '../workers/queues';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';
import TranscriptRequest from '../models/transcriptRequest.model';
import AuditLog from '../models/auditLog.model';

export class TranscriptService {
  async requestTranscript(studentId: string, data: any) {
    // Check outstanding fees
    const fees = await studentFeeRepository.findByStudent(studentId);
    const hasOutstanding = fees?.some((f) => f.status === 'OVERDUE' || f.status === 'UNPAID');
    if (hasOutstanding) {
      throw new AppError(403, 'FEES_OUTSTANDING', 'You have outstanding fees');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const request = await transcriptRepository.create({
      student: studentId,
      status: 'PENDING',
      verificationToken,
      requestedAt: new Date(),
      purpose: data.purpose,
      copies: data.copies || 1,
    });

    return request;
  }

  async approveTranscript(requestId: string, registrarId: string) {
    const request = await transcriptRepository.findById(requestId);
    if (request.status !== 'PENDING') {
      throw new AppError(400, 'INVALID_STATUS', 'Request must be pending to approve');
    }

    // Queue PDF generation
    await pdfQueue.add('transcript-generation', {
      transcriptRequestId: requestId,
      studentId: request.student,
      verificationToken: request.verificationToken,
    });

    const updated = await transcriptRepository.updateById(requestId, {
      status: 'PROCESSING',
      approvedBy: registrarId,
      approvedAt: new Date(),
    });

    return updated;
  }

  async dispatchTranscript(requestId: string, data: any) {
    const request = await transcriptRepository.updateById(requestId, {
      status: 'DISPATCHED',
      dispatchedAt: new Date(),
      dispatchMethod: data.method,
      destination: data.destination,
      trackingReference: data.trackingReference,
    });

    // Queue dispatch email
    await emailQueue.add('transcript-dispatch', {
      to: request.student.email,
      template: 'transcript-dispatch',
      context: {
        studentName: `${request.student.firstName} ${request.student.lastName}`,
        destination: data.destination,
        trackingRef: data.trackingReference,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-transcript/${request.verificationToken}`,
      },
    });

    return request;
  }

  async verifyTranscript(token: string) {
    const request = await transcriptRepository.findByToken(token);
    if (!request) {
      throw new AppError(404, 'NOT_FOUND', 'Transcript not found or verification token expired');
    }

    // Get student results
    const results = await resultRepository.findByStudent(request.student.toString());

    return {
      student: request.student,
      results,
      programme: request.programme,
      verifiedAt: new Date(),
    };
  }

  async getTranscriptRequest(requestId: string) {
    return await transcriptRepository.findById(requestId);
  }

  async getStudentTranscripts(studentId: string, options: any = {}) {
    return await transcriptRepository.findByStudent(studentId, options);
  }

  async listPendingTranscripts(options: any = {}) {
    return await transcriptRepository.findByStatus('PENDING', options);
  }

  async downloadTranscript(requestId: string, studentId: string) {
    const request = await transcriptRepository.findById(requestId);

    if (request.student.toString() !== studentId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to download this transcript');
    }

    if (!request.pdfUrl) {
      throw new AppError(404, 'NOT_READY', 'PDF not yet generated');
    }

    return request.pdfUrl; // Return presigned S3 URL
  }
}

export const transcriptService = new TranscriptService();
