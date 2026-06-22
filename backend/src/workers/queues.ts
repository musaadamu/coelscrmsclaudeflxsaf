import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}

export const pdfQueue = new Queue('pdf-generation', { connection })
export const emailQueue = new Queue('email-notifications', { connection })
export const smsQueue = new Queue('sms-notifications', { connection })
export const cgpaQueue = new Queue('cgpa-computation', { connection })

// Export all queues for management
export const allQueues = [pdfQueue, emailQueue, smsQueue, cgpaQueue]
