import mongoose from 'mongoose'
import logger from '../utils/logger'

const MAX_RETRIES = 5

export async function connectDB(): Promise<void> {
  let attempts = 0

  while (attempts < MAX_RETRIES) {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
      const dbName = process.env.MONGODB_DB_NAME || 'coels_crms'

      await mongoose.connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      logger.info('✓ MongoDB connected successfully')
      setupConnectionEvents()
      return
    } catch (err) {
      attempts++
      const delay = 2000 * attempts
      logger.error(
        `MongoDB connection failed (attempt ${attempts}/${MAX_RETRIES}). Retrying in ${delay}ms...`,
        err
      )

      if (attempts < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error('MongoDB connection failed after maximum retries')
}

function setupConnectionEvents(): void {
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB')
  })

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB')
  })

  mongoose.connection.on('reconnected', () => {
    logger.info('Mongoose reconnected to MongoDB')
  })
}
