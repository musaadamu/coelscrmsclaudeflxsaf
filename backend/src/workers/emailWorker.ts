import { Worker } from 'bullmq';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailWorker = new Worker(
  'email-notifications',
  async (job) => {
    logger.info(`Processing email job: ${job.id}`);
    try {
      const { to, subject, template, context, html } = job.data;

      let rendered = html;
      if (!rendered && template) {
        const templatePath = path.join(process.cwd(), 'templates', `${template}.hbs`);
        const tpl = await fs.readFile(templatePath, 'utf-8');
        const compile = Handlebars.compile(tpl);
        rendered = compile(context || {});
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '1025'),
        secure: false,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@coels.edu.ng',
        to,
        subject: subject || 'Notification',
        html: rendered,
      });

      logger.info(`Email job completed: ${job.id}`);
      return { success: true };
    } catch (error: any) {
      logger.error(`Email job failed: ${job.id}`, error);
      throw error;
    }
  },
  { connection }
);
