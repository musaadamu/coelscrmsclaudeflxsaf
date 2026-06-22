import dotenv from 'dotenv'
import app from './app'
import { connectDB } from './db/mongoose'
import logger from './utils/logger'

dotenv.config()

const PORT = process.env.PORT || 4000

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB()

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`)
      server.close(async () => {
        logger.info('HTTP server closed')
        process.exit(0)
      })

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection at:', reason)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
