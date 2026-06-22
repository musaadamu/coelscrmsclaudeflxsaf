import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import logger from '../utils/logger'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
})

export class FileUploadService {
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType,
      })

      const url = await getSignedUrl(s3Client, command, { expiresIn })
      logger.debug(`Generated S3 upload URL for: ${key}`)
      return url
    } catch (error) {
      logger.error('Failed to generate upload URL:', error)
      throw error
    }
  }

  async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      })

      const url = await getSignedUrl(s3Client, command, { expiresIn })
      logger.debug(`Generated S3 download URL for: ${key}`)
      return url
    } catch (error) {
      logger.error('Failed to generate download URL:', error)
      throw error
    }
  }

  async getVideoUrl(key: string): Promise<string> {
    try {
      // CloudFront signed URL for video content (e-learning)
      // In production, use AWS SDK CloudFront signer
      const url = `${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`
      logger.debug(`Generated CloudFront URL for: ${key}`)
      return url
    } catch (error) {
      logger.error('Failed to generate video URL:', error)
      throw error
    }
  }

  generateKey(module: string, filename: string, uuid?: string): string {
    const timestamp = new Date().getFullYear()
    const id = uuid || Math.random().toString(36).substr(2, 9)
    const ext = filename.split('.').pop()
    return `coels-crms/${module}/${timestamp}/${id}.${ext}`
  }
}

export const fileUploadService = new FileUploadService()
