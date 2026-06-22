import { Worker } from 'bullmq';
import logger from '../utils/logger';
import axios from 'axios';
import { NotificationLog } from '../models/notificationLog.model';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const smsWorker = new Worker(
  'sms-notifications',
  async (job) => {
    logger.info(`Processing SMS job: ${job.id}`);
    const { to, message, recipientId } = job.data;
    let providerRef = null;
    let status = 'FAILED';
    let errorMessage = '';

    try {
      // Primary: Termii API
      const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      });

      if (response.status === 200 && response.data.message_id) {
        logger.info(`SMS sent via Termii: ${to}`);
        providerRef = response.data.message_id;
        status = 'SENT';
      } else {
        throw new Error('Termii API responded but did not provide a message_id');
      }
    } catch (error: any) {
      logger.warn('Termii SMS failed, falling back to Twilio:', error?.message);

      // Fallback: Twilio API
      try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
          throw new Error('Twilio credentials are not configured');
        }

        const twilioAuth = Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64');

        const twilioResponse = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          new URLSearchParams({
            To: to,
            From: process.env.TWILIO_FROM!,
            Body: message,
          }),
          {
            headers: {
              Authorization: `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        if (twilioResponse.status === 201) {
          logger.info(`SMS sent via Twilio: ${to}`);
          providerRef = twilioResponse.data.sid;
          status = 'SENT';
        } else {
          throw new Error('Twilio API failed to send SMS');
        }
      } catch (twilioError: any) {
        logger.error('Twilio SMS fallback failed:', twilioError?.message);
        errorMessage = twilioError?.message || 'Unknown Twilio Error';
      }
    }

    // Log the notification attempt
    try {
      await NotificationLog.create({
        recipient: recipientId || null,
        channel: 'SMS',
        templateName: 'custom_sms',
        payload: { to, message },
        status,
        providerRef,
        errorMessage: errorMessage || null,
        sentAt: status === 'SENT' ? new Date() : null,
      });
    } catch (logError) {
      logger.error('Failed to write to NotificationLog:', logError);
    }

    if (status === 'FAILED') {
      throw new Error(`SMS delivery failed for ${to}`);
    }

    logger.info(`SMS job completed: ${job.id}`);
    return { success: true, providerRef };
  },
  { connection }
);
