import { Worker } from 'bullmq';
import logger from '../utils/logger';
import { cgpaService } from '../services/result.service';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const cgpaWorker = new Worker(
  'cgpa-computation',
  async (job) => {
    logger.info(`Processing CGPA job: ${job.id}`);
    try {
      const { studentId, semesterId } = job.data;
      if (studentId && semesterId) {
        await cgpaService.computeSemesterGPA(studentId, semesterId);
      } else if (studentId) {
        await cgpaService.computeCumulativeGPA(studentId);
      }
      logger.info(`CGPA job completed: ${job.id}`);
      return { success: true };
    } catch (error: any) {
      logger.error(`CGPA job failed: ${job.id}`, error);
      throw error;
    }
  },
  { connection }
);
