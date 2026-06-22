import logger from '../utils/logger';
import { pdfWorker } from './pdfWorker';
import { emailWorker } from './emailWorker';
import { smsWorker } from './smsWorker';
import { cgpaWorker } from './cgpaWorker';

const workers = [pdfWorker, emailWorker, smsWorker, cgpaWorker];

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    logger.info(`✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`✗ Job ${job?.id} failed: ${err?.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`Worker error: ${err.message}`);
  });
});

logger.info('BullMQ workers started successfully.');

export { pdfWorker, emailWorker, smsWorker, cgpaWorker };
