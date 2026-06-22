import { Request, Response, NextFunction } from 'express';
import Student from '../models/student.model';
import Result from '../models/result.model';
import Payment from '../models/payment.model';
import HostelAllocation from '../models/hostelAllocation.model';
import ScratchCard from '../models/scratchCard.model';
import Staff from '../models/staff.model';
// import { emailQueue } from '../workers/queues'; // Assuming emailWorker queue exists if needed

export class AdminController {
  async reconcileImport(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string;
      const sourceCount = parseInt(req.query.sourceCount as string, 10);

      if (!type || isNaN(sourceCount)) {
        return res.status(400).json({ success: false, message: 'Missing type or sourceCount' });
      }

      let dbCount = 0;
      switch (type) {
        case 'students':
          dbCount = await Student.countDocuments({ isDeleted: false });
          break;
        case 'results':
          dbCount = await Result.countDocuments({ isDeleted: false });
          break;
        case 'payments':
          dbCount = await Payment.countDocuments({ isDeleted: false });
          break;
        case 'hostel-allocations':
          dbCount = await HostelAllocation.countDocuments({ isDeleted: false });
          break;
        case 'scratch-cards':
          dbCount = await ScratchCard.countDocuments({});
          break;
        case 'staff':
          dbCount = await Staff.countDocuments({ isDeleted: false });
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid type' });
      }

      const variance = Math.abs(dbCount - sourceCount);
      const variancePct = ((variance / sourceCount) * 100);
      const status = variancePct > 2 ? 'INVESTIGATE' : 'OK';

      if (status === 'INVESTIGATE') {
        // Queue email alert to super admin
        // await emailQueue.add('sendEmail', { to: 'superadmin@coels.edu.ng', subject: 'Import Reconciliation Alert', ... })
      }

      res.json({
        success: true,
        data: {
          dbCount,
          sourceCount,
          variance,
          variancePct: variancePct.toFixed(2),
          status,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async importProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = req.params.jobId;
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send initial connection establish message
      res.write(`data: ${JSON.stringify({ status: 'connected', jobId })}\n\n`);

      // Mock real-time progress for SSE (In a real system this would listen to Redis/BullMQ events)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;
        res.write(`data: ${JSON.stringify({ progress, status: progress === 100 ? 'completed' : 'running' })}\n\n`);
        
        if (progress === 100) {
          clearInterval(interval);
          res.end();
        }
      }, 1000);

      req.on('close', () => {
        clearInterval(interval);
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
