import nodemailer, { Transporter } from 'nodemailer'
import { emailQueue } from '../workers/queues'
import { handlebarsService } from '../utils/handlebars'
import logger from '../utils/logger'

export class EmailService {
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(
    to: string,
    template: string,
    context: Record<string, any>
  ): Promise<void> {
    try {
      const html = handlebarsService.compile(template, context)

      await emailQueue.add(
        'send-email',
        {
          to,
          template,
          subject: context.subject || template,
          html,
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
      )

      logger.info(`Email queued: ${template} → ${to}`)
    } catch (error) {
      logger.error('Failed to queue email:', error)
      throw error
    }
  }

  async sendAdmissionOffer(
    to: string,
    context: {
      applicantName: string
      programme: string
      session: string
      offerConditions: string
      reportingDate: string
      portalUrl: string
    }
  ): Promise<void> {
    return this.sendEmail(to, 'admission-offer', context)
  }

  async sendPaymentReceipt(
    to: string,
    context: {
      studentName: string
      amountNaira: string
      reference: string
      date: string
      receiptNo: string
      feeType: string
    }
  ): Promise<void> {
    return this.sendEmail(to, 'payment-receipt', context)
  }

  async sendTranscriptDispatch(
    to: string,
    context: {
      studentName: string
      destination: string
      trackingRef: string
      verificationUrl: string
    }
  ): Promise<void> {
    return this.sendEmail(to, 'transcript-dispatch', context)
  }

  async sendSenateReminder(
    to: string,
    context: {
      memberName: string
      meetingTitle: string
      scheduledAt: string
      venue: string
      prayerDeadline: string
      portalUrl: string
    }
  ): Promise<void> {
    return this.sendEmail(to, 'senate-reminder', context)
  }

  async sendPasswordReset(
    to: string,
    context: {
      name: string
      resetLink: string
      expiresIn: string
    }
  ): Promise<void> {
    return this.sendEmail(to, 'password-reset', context)
  }
}

export const emailService = new EmailService()
