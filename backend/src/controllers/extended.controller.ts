import { Request, Response, NextFunction } from 'express';
import { learningService } from '../services/learning.service';
import {
  reportsService,
  alumniService,
  appraisalService,
  leaveService,
} from '../services/misc.service';

export class LearningController {
  async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseOfferingId } = req.params;
      const module = await learningService.createModule(courseOfferingId, req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: module,
        message: 'Learning module created',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.params;
      const resource = await learningService.uploadResource(moduleId, req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: resource,
        message: 'Resource uploaded',
      });
    } catch (error) {
      next(error);
    }
  }

  async getModuleResources(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await learningService.getResourcesByModule(req.params.moduleId);
      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      next(error);
    }
  }

  async trackProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await learningService.trackProgress(req.user!.id, req.params.resourceId, req.body);
      res.json({
        success: true,
        data: progress,
        message: 'Progress updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await learningService.getStudentProgress(req.user!.id);
      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async streamResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await learningService.getResource(req.params.resourceId);
      res.json({
        success: true,
        data: {
          url: resource.resourceUrl, // S3/CloudFront URL
          type: resource.resourceType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export class ReportsController {
  async getNCCEEnrolment(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, programmeId } = req.query;
      const report = await reportsService.generateNCCEEnrolmentReport(
        sessionId as string,
        programmeId as string | undefined
      );
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNYSCList(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.query;
      const list = await reportsService.generateNYSCList(sessionId as string);
      res.json({
        success: true,
        data: list,
        meta: { total: list.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, format } = req.query;
      const data = await reportsService.exportReport(reportType as string, format as 'CSV' | 'PDF');
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class AlumniController {
  async createAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, sessionId } = req.body;
      const alumni = await alumniService.createAlumni(studentId, sessionId);
      res.status(201).json({
        success: true,
        data: alumni,
        message: 'Alumni record created',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const alumni = await alumniService.verifyAlumni(token);
      res.json({
        success: true,
        data: alumni,
        message: 'Alumni verified',
      });
    } catch (error) {
      next(error);
    }
  }

  async listAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { alumni, total } = await alumniService.listAlumni({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json({
        success: true,
        data: alumni,
        meta: { total },
      });
    } catch (error) {
      next(error);
    }
  }

  async exportAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, format } = req.query;
      const data = await alumniService.exportAlumni(sessionId as string, format as 'CSV' | 'JSON');
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class AppraisalController {
  async createAppraisal(req: Request, res: Response, next: NextFunction) {
    try {
      const appraisal = await appraisalService.createAppraisal(
        req.user!.id,
        req.body.appraiserListId,
        req.body
      );
      res.status(201).json({
        success: true,
        data: appraisal,
        message: 'Appraisal created',
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAppraisal(req: Request, res: Response, next: NextFunction) {
    try {
      const appraisal = await appraisalService.submitAppraisal(req.params.id);
      res.json({
        success: true,
        data: appraisal,
        message: 'Appraisal submitted',
      });
    } catch (error) {
      next(error);
    }
  }

  async approveAppraisal(req: Request, res: Response, next: NextFunction) {
    try {
      const appraisal = await appraisalService.approveAppraisal(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: appraisal,
        message: 'Appraisal approved',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAppraisals(req: Request, res: Response, next: NextFunction) {
    try {
      const { appraisals, total } = await appraisalService.getStaffAppraisals(req.user!.id, {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json({
        success: true,
        data: appraisals,
        meta: { total },
      });
    } catch (error) {
      next(error);
    }
  }
}

export class LeaveController {
  async requestLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await leaveService.requestLeave(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: leave,
        message: 'Leave request submitted',
      });
    } catch (error) {
      next(error);
    }
  }

  async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const leave = await leaveService.approveLeave(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: leave,
        message: 'Leave approved',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const { rejectionReason } = req.body;
      const leave = await leaveService.rejectLeave(req.params.id, rejectionReason);
      res.json({
        success: true,
        data: leave,
        message: 'Leave rejected',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const { requests, total } = await leaveService.getStaffLeaves(req.user!.id, {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json({
        success: true,
        data: requests,
        meta: { total },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingLeaves(req: Request, res: Response, next: NextFunction) {
    try {
      const leaves = await leaveService.getPendingLeaves();
      res.json({
        success: true,
        data: leaves,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const learningController = new LearningController();
export const reportsController = new ReportsController();
export const alumniController = new AlumniController();
export const appraisalController = new AppraisalController();
export const leaveController = new LeaveController();
