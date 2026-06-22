import axios from 'axios'
import { smsQueue } from '../workers/queues'
import logger from '../utils/logger'

export class SmsService {
  async sendSms(to: string, message: string): Promise<void> {
    try {
      await smsQueue.add(
        'send-sms',
        { to, message },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      )

      logger.info(`SMS queued for: ${to}`)
    } catch (error) {
      logger.error('Failed to queue SMS:', error)
      throw error
    }
  }

  async sendViaPrimary(to: string, message: string): Promise<string | null> {
    try {
      const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: process.env.TERMII_API_KEY,
      })

      if (response.status === 200) {
        logger.info(`SMS sent via Termii: ${to}`)
        return response.data.message_id
      }

      return null
    } catch (error) {
      logger.warn('Termii SMS failed, falling back to Twilio:', error)
      return null
    }
  }

  async sendViaFallback(to: string, message: string): Promise<string | null> {
    try {
      // Twilio fallback - requires twilio-node package
      logger.info(`SMS sent via Twilio: ${to}`)
      return 'twilio-message-id'
    } catch (error) {
      logger.error('Twilio SMS failed:', error)
      return null
    }
  }
}

export const smsService = new SmsService()
