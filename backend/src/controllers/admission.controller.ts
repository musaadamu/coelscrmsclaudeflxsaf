import { Request, Response, NextFunction } from 'express';
import { admissionService } from '../services/admission.service';
import { logger } from '../utils/logger';

export class AdmissionController {
  async createCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await admissionService.createCycle(req.body);
      res.status(201).json({
        success: true,
        data: cycle,
        message: 'Admission cycle created',
      });
    } catch (error) {
      next(error);
    }
  }

  async getCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await admissionService.getCycle(req.params.id);
      res.json({
        success: true,
        data: cycle,
      });
    } catch (error) {
      next(error);
    }
  }

  async listCycles(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { cycles, total } = await admissionService.listCycles({ page, limit });

      res.json({
        success: true,
        data: cycles,
        meta: { total, page, limit },
      });
      res.set('X-Total-Count', total.toString());
    } catch (error) {
      next(error);
    }
  }

  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycleId, ...applicantData } = req.body;
      const documentUrls = req.body.documentUrls || [];
      const applicant = await admissionService.submitApplication(cycleId, applicantData, documentUrls);

      res.status(201).json({
        success: true,
        data: applicant,
        message: 'Application submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async shortlistApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const applicant = await admissionService.shortlistApplicant(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: applicant,
        message: 'Applicant shortlisted',
      });
    } catch (error) {
      next(error);
    }
  }

  async admitApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await admissionService.admitApplicant(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: result,
        message: 'Applicant admitted, credentials sent to email',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectApplicant(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const applicant = await admissionService.rejectApplicant(req.params.id, req.user!.id, reason);
      res.json({
        success: true,
        data: applicant,
        message: 'Applicant rejected',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await admissionService.getApplicantStats(req.params.cycleId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const admissionController = new AdmissionController();
