import { Worker } from 'bullmq'
import { pdfQueue, emailQueue, smsQueue, cgpaQueue } from './queues'
import logger from '../utils/logger'
import puppeteer from 'puppeteer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import nodemailer from 'nodemailer'
import Handlebars from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import { cgpaService } from '../services/result.service'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
}

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })

// PDF Worker: expects job.data.html and job.data.destPath or job.data.type/recordId
const pdfWorker = new Worker(
  'pdf-generation',
  async (job) => {
    logger.info(`Processing PDF job: ${job.id}`)
    try {
      const { html, destPath, s3Key } = job.data

      let pdfBuffer: Buffer
      if (html) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
        await browser.close()
      } else if (destPath) {
        // If an HTML file path provided, read and render
        const content = await fs.readFile(destPath, 'utf-8')
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()
        await page.setContent(content, { waitUntil: 'networkidle0' })
        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
        await browser.close()
      } else {
        throw new Error('No html or destPath provided for PDF generation')
      }

      if (s3Key) {
        const bucket = process.env.AWS_S3_BUCKET!
        await s3Client.send(
          new PutObjectCommand({ Bucket: bucket, Key: s3Key, Body: pdfBuffer, ContentType: 'application/pdf' })
        )
        const url = `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`
        logger.info(`Uploaded PDF to ${url}`)
        return { success: true, url }
      }

      // If no S3 key, write to temp file
      const out = path.join(process.cwd(), 'tmp', `job-${job.id}.pdf`)
      await fs.mkdir(path.dirname(out), { recursive: true })
      await fs.writeFile(out, pdfBuffer)
      logger.info(`PDF written to ${out}`)
      return { success: true, path: out }
    } catch (error: any) {
      logger.error(`PDF job failed: ${job.id}`, error)
      throw error
    }
  },
  { connection }
)

// Email Worker: simple SMTP with handlebars templating
const emailWorker = new Worker(
  'email-notifications',
  async (job) => {
    logger.info(`Processing email job: ${job.id}`)
    try {
      const { to, subject, template, context, html } = job.data

      // If raw html provided, send directly
      let rendered = html
      if (!rendered && template) {
        const templatePath = path.join(process.cwd(), 'templates', `${template}.hbs`)
        const tpl = await fs.readFile(templatePath, 'utf-8')
        const compile = Handlebars.compile(tpl)
        rendered = compile(context || {})
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })

      await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@coels.edu.ng', to, subject: subject || 'Notification', html: rendered })

      logger.info(`Email job completed: ${job.id}`)
      return { success: true }
    } catch (error: any) {
      logger.error(`Email job failed: ${job.id}`, error)
      throw error
    }
  },
  { connection }
)

// SMS Worker: placeholder to integrate Termii/Twilio
const smsWorker = new Worker(
  'sms-notifications',
  async (job) => {
    logger.info(`Processing SMS job: ${job.id}`)
    try {
      // TODO: integrate with Termii/Twilio
      logger.info(`SMS job completed: ${job.id}`)
      return { success: true }
    } catch (error: any) {
      logger.error(`SMS job failed: ${job.id}`, error)
      throw error
    }
  },
  { connection }
)

// CGPA Worker: triggers CGPA computation for students (optional semester)
const cgpaWorker = new Worker(
  'cgpa-computation',
  async (job) => {
    logger.info(`Processing CGPA job: ${job.id}`)
    try {
      const { studentId, semesterId } = job.data
      if (studentId && semesterId) {
        await cgpaService.computeSemesterGPA(studentId, semesterId)
      } else if (studentId) {
        // compute cumulative by recomputing all semesters
        await cgpaService.computeCumulativeGPA(studentId)
      }
      logger.info(`CGPA job completed: ${job.id}`)
      return { success: true }
    } catch (error: any) {
      logger.error(`CGPA job failed: ${job.id}`, error)
      throw error
    }
  },
  { connection }
)

// Setup event listeners
const workers = [pdfWorker, emailWorker, smsWorker, cgpaWorker]

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    logger.info(`✓ Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    logger.error(`✗ Job ${job?.id} failed: ${err?.message}`)
  })

  worker.on('error', (err) => {
    logger.error(`Worker error: ${err.message}`)
  })
})

export { pdfWorker, emailWorker, smsWorker, cgpaWorker }
