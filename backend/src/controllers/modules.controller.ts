import { Request, Response, NextFunction } from 'express';
import { transcriptService } from '../services/transcript.service';
import { staffService } from '../services/staff.service';
import { hostelService } from '../services/hostel.service';
import { senateService } from '../services/senate.service';

export class TranscriptController {
  async requestTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await transcriptService.requestTranscript(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: request,
        message: 'Transcript request submitted',
      });
    } catch (error) {
      next(error);
    }
  }

  async approveTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await transcriptService.approveTranscript(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: request,
        message: 'Transcript approved, PDF generation queued',
      });
    } catch (error) {
      next(error);
    }
  }

  async dispatchTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await transcriptService.dispatchTranscript(req.params.id, req.body);
      res.json({
        success: true,
        data: request,
        message: 'Transcript dispatched',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await transcriptService.verifyTranscript(req.params.token);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMyTranscripts(req: Request, res: Response, next: NextFunction) {
    try {
      const { requests, total } = await transcriptService.getStudentTranscripts(req.user!.id, {
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

  async downloadTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const url = await transcriptService.downloadTranscript(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
}

export class StaffController {
  async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const staff = await staffService.createStaff(req.body);
      res.status(201).json({
        success: true,
        data: staff,
        message: 'Staff member created',
      });
    } catch (error) {
      next(error);
    }
  }

  async listStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { staff, total } = await staffService.listStaff(
        {},
        {
          page: parseInt(req.query.page as string) || 1,
          limit: parseInt(req.query.limit as string) || 20,
        }
      );
      res.json({
        success: true,
        data: staff,
        meta: { total },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const courses = await staffService.getMyCourses(req.user!.id);
      res.json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await staffService.assignCourses(req.params.id, req.body.courseOfferingIds);
      res.json({
        success: true,
        data: result,
        message: 'Courses assigned',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await staffService.updateRoles(req.params.id, req.body.roles, req.user!.id);
      res.json({
        success: true,
        data: user,
        message: 'Roles updated',
      });
    } catch (error) {
      next(error);
    }
  }
}

export class HostelController {
  async bookRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId, sessionId } = req.body;
      const allocation = await hostelService.bookRoom(req.user!.id, roomId, sessionId);
      res.status(201).json({
        success: true,
        data: allocation,
        message: 'Room booked successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const allocation = await hostelService.confirmAllocation(req.params.id);
      res.json({
        success: true,
        data: allocation,
        message: 'Allocation confirmed',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const allocation = await hostelService.getStudentAllocation(req.user!.id, sessionId);
      res.json({
        success: true,
        data: allocation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const { hostelId, gender } = req.query;
      const rooms = await hostelService.getAvailableRooms(hostelId as string, gender as string);
      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  }
}

export class SenateController {
  async createMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await senateService.createMeeting(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: meeting,
        message: 'Meeting created and notifications queued',
      });
    } catch (error) {
      next(error);
    }
  }

  async listMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const meetings = await senateService.listMeetings({
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitPrayer(req: Request, res: Response, next: NextFunction) {
    try {
      const prayer = await senateService.submitPrayer(req.params.meetingId, req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: prayer,
        message: 'Prayer submitted',
      });
    } catch (error) {
      next(error);
    }
  }

  async votePrayer(req: Request, res: Response, next: NextFunction) {
    try {
      const { vote } = req.body;
      const prayer = await senateService.votePrayer(req.params.prayerId, req.user!.id, vote);
      res.json({
        success: true,
        data: prayer,
        message: 'Vote recorded',
      });
    } catch (error) {
      next(error);
    }
  }

  async decidePrayer(req: Request, res: Response, next: NextFunction) {
    try {
      const { decision, notes } = req.body;
      const prayer = await senateService.decidePrayer(
        req.params.prayerId,
        req.user!.id,
        decision,
        notes
      );
      res.json({
        success: true,
        data: prayer,
        message: 'Decision recorded',
      });
    } catch (error) {
      next(error);
    }
  }

  async concludeMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const meeting = await senateService.concludeMeeting(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: meeting,
        message: 'Meeting concluded, PDF minutes queued',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPrayersForMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const prayers = await senateService.getPrayersForMeeting(req.params.meetingId);
      res.json({
        success: true,
        data: prayers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transcriptController = new TranscriptController();
export const staffController = new StaffController();
export const hostelController = new HostelController();
export const senateController = new SenateController();
