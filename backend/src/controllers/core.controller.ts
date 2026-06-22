import { Request, Response, NextFunction } from 'express';
import { enrolmentService } from '../services/enrolment.service';
import { resultService, cgpaService } from '../services/result.service';
import { paymentService } from '../services/payment.service';

export class EnrolmentController {
  async registerCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseOfferingIds, semesterId } = req.body;
      const enrolments = await enrolmentService.registerCourses(
        req.user!.id,
        courseOfferingIds,
        semesterId
      );
      res.status(201).json({
        success: true,
        data: enrolments,
        message: 'Courses registered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { semesterId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { enrolments, total } = await enrolmentService.getStudentCourses(
        req.user!.id,
        semesterId,
        { page, limit }
      );
      res.json({
        success: true,
        data: enrolments,
        meta: { total, page, limit },
      });
    } catch (error) {
      next(error);
    }
  }

  async dropCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const enrolment = await enrolmentService.dropCourse(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: enrolment,
        message: 'Course dropped',
      });
    } catch (error) {
      next(error);
    }
  }
}

export class ResultController {
  async bulkUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { results } = req.body;
      const created = await resultService.bulkCreateResults(results);
      res.status(201).json({
        success: true,
        data: created,
        message: `${created.length} results created`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentResults(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const results = await resultService.getStudentResults(req.params.studentId, { page, limit });
      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async approveResult(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resultService.approveResult(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: result,
        message: 'Result approved',
      });
    } catch (error) {
      next(error);
    }
  }

  async publishResults(req: Request, res: Response, next: NextFunction) {
    try {
      const { semesterId } = req.body;
      await resultService.publishResults(semesterId);
      res.json({
        success: true,
        message: 'Results published',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentCGPA(req: Request, res: Response, next: NextFunction) {
    try {
      const cgpa = await cgpaService.getStudentCGPA(req.params.studentId);
      res.json({
        success: true,
        data: cgpa,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class PaymentController {
  async initiatePaystack(req: Request, res: Response, next: NextFunction) {
    try {
      const { amountKobo, feeType } = req.body;
      const result = await paymentService.initiatePaystack(req.user!.id, amountKobo, feeType);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const rawBody = req.body as Buffer
      const crypto = require('crypto')
      const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_WEBHOOK_SECRET
      const hash = crypto.createHmac('sha512', PAYSTACK_SECRET!).update(rawBody).digest('hex')
      const AuditLog = require('../models/auditLog.model')

      if (hash !== signature) {
        await AuditLog.create({ action: 'WEBHOOK_REJECTED', newValues: { ip: req.ip, headerSig: signature }, performedBy: null, ipAddress: req.ip })
        return res.status(401).json({ success: false, message: 'Invalid signature' })
      }

      await paymentService.verifyPaystackWebhook(rawBody, signature)
      res.json({ success: true })
    } catch (error) {
      next(error);
    }
  }

  async redeemScratchCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { serial, pin, studentFeeId } = req.body;
      const payment = await paymentService.redeemScratchCard(
        serial,
        pin,
        req.user!.id,
        studentFeeId
      );
      res.json({
        success: true,
        data: payment,
        message: 'Scratch card redeemed',
      });
    } catch (error) {
      next(error);
    }
  }

  async generateScratchCards(req: Request, res: Response, next: NextFunction) {
    try {
      const { count, denominationKobo } = req.body;
      const cards = await paymentService.generateScratchCards(
        count,
        denominationKobo,
        req.user!.id
      );
      res.json({
        success: true,
        data: cards,
        message: `Generated ${count} scratch cards`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const enrolmentController = new EnrolmentController();
export const resultController = new ResultController();
export const paymentController = new PaymentController();
