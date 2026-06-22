import { Worker } from 'bullmq';
import logger from '../utils/logger';
import puppeteer from 'puppeteer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs/promises';
import path from 'path';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export const pdfWorker = new Worker(
  'pdf-generation',
  async (job) => {
    logger.info(`Processing PDF job: ${job.id}`);
    try {
      const { html, destPath, s3Key } = job.data;

      let pdfBuffer: Buffer;
      if (html) {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
      } else if (destPath) {
        const content = await fs.readFile(destPath, 'utf-8');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'networkidle0' });
        pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
      } else {
        throw new Error('No html or destPath provided for PDF generation');
      }

      if (s3Key) {
        const bucket = process.env.AWS_S3_BUCKET!;
        await s3Client.send(
          new PutObjectCommand({ Bucket: bucket, Key: s3Key, Body: pdfBuffer, ContentType: 'application/pdf' })
        );
        const url = `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`;
        logger.info(`Uploaded PDF to ${url}`);
        return { success: true, url };
      }

      const out = path.join(process.cwd(), 'tmp', `job-${job.id}.pdf`);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, pdfBuffer);
      logger.info(`PDF written to ${out}`);
      return { success: true, path: out };
    } catch (error: any) {
      logger.error(`PDF job failed: ${job.id}`, error);
      throw error;
    }
  },
  { connection }
);
