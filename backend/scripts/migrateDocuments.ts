import fs from 'fs';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { normaliseMatricNumber, MatricNormaliseError } from '../src/utils/matricNormaliser';
import Student from '../src/models/student.model';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'coels-crms';

async function migrateDocuments() {
  const args = process.argv.slice(2);
  let sourceDir = '';
  let type = '';

  for (const arg of args) {
    if (arg.startsWith('--sourceDir=')) sourceDir = arg.split('=')[1];
    if (arg.startsWith('--type=')) type = arg.split('=')[1];
  }

  if (!sourceDir || !type) {
    console.error('Usage: node migrateDocuments.js --sourceDir=/path/to/photos --type=student-photos');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coels');
  console.log('Connected to MongoDB');

  const files = fs.readdirSync(sourceDir);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const failedFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    if (!fs.statSync(filePath).isFile()) continue;

    const rawMatric = path.parse(file).name; // Filename without extension
    const ext = path.extname(file).toLowerCase();
    
    let normalised;
    try {
      normalised = normaliseMatricNumber(rawMatric);
    } catch (e: any) {
      console.warn(`[WARN] Skipping ${file} - ${e.message}`);
      skipped++;
      continue;
    }

    try {
      const student = await Student.findOne({ matricNo: normalised });
      if (!student) {
        console.warn(`[WARN] Student not found for matric: ${normalised} (${file})`);
        failed++;
        failedFiles.push(file);
        continue;
      }

      // coels-crms/students/photos/{COELS_NCE_2024_001}.jpg
      const cleanMatric = normalised.replace(/\//g, '_');
      const key = `students/${type === 'student-photos' ? 'photos' : 'documents'}/${cleanMatric}${ext}`;

      const fileStream = fs.createReadStream(filePath);
      
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'application/octet-stream',
        },
      });

      await upload.done();
      
      const s3DownloadUrl = `https://${BUCKET}.s3.amazonaws.com/${key}`;
      
      if (type === 'student-photos') {
        await Student.updateOne({ _id: student._id }, { $set: { photoUrl: s3DownloadUrl } });
      } else {
        // Just push to documents array if it was generic documents
      }
      
      console.log(`[SUCCESS] Uploaded ${file} -> ${key}`);
      uploaded++;
    } catch (err: any) {
      console.error(`[ERROR] Failed to process ${file}:`, err.message);
      failed++;
      failedFiles.push(file);
    }
  }

  console.log('\n--- Migration Report ---');
  console.log(JSON.stringify({ uploaded, skipped, failed, failedFiles }, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

migrateDocuments().catch(console.error);
