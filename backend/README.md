# COELS CRMS Backend

## Overview

Express.js + TypeScript backend for the College of Education Records Management System. Handles authentication, data management, background jobs, and API services.

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # HTTP server & startup
├── db/
│   ├── mongoose.ts        # Database connection with retry logic
│   └── seed.js            # Database seeding script
├── models/                # 35 Mongoose models
├── routes/                # API route handlers
├── controllers/           # Request handlers (thin layer)
├── services/              # Business logic
├── middleware/
│   ├── authenticate.ts    # JWT verification
│   ├── authorize.ts       # Role-based access control
│   ├── errorHandler.ts    # Global error handling
│   └── requestLogger.ts   # Request logging
├── workers/
│   ├── queues.ts          # BullMQ queue definitions
│   ├── pdfWorker.ts       # PDF generation
│   ├── emailWorker.ts     # Email sending
│   ├── smsWorker.ts       # SMS notifications
│   ├── cgpaWorker.ts      # CGPA computation
│   └── index.ts           # Worker starter
├── utils/
│   ├── logger.ts          # Winston logger
│   ├── fileUpload.ts      # AWS S3 operations
│   ├── handlebars.ts      # Email template engine
│   └── asyncContext.ts    # Request context tracking
└── types/                 # TypeScript type definitions
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start with hot reload (requires nodemon)
npm run dev

# In another terminal, start BullMQ workers
npm run worker

# Seed database (optional)
npm run seed
```

### Build & Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` in the root directory for all required variables.

Key ones for backend:
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` / `REDIS_PORT` - Redis server
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Auth tokens
- `AWS_*` - S3 & CloudFront access
- `SMTP_*` - Email configuration
- `TERMII_*` / `TWILIO_*` - SMS providers

## API Routes

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password with token

### Protected Routes
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/*` - 2FA operations

### Resource Routes
- `GET /api/students` - List students
- `GET /api/students/:id` - Get student details
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (HOD+)
- `GET /api/results` - List results
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/scratch-card/validate` - Validate scratch card

## Authentication

JWT-based with optional 2FA:

1. User logs in with email/password
2. Server returns `accessToken` (15min) and `refreshToken` (7d)
3. Client includes Bearer token in Authorization header
4. If token expires, client uses refresh token to get new access token
5. User can optionally enable TOTP-based 2FA

## Background Jobs (BullMQ)

Four queues process asynchronous tasks:

1. **PDF Queue** - Generate transcripts, receipts, senate minutes
2. **Email Queue** - Send templated emails to users
3. **SMS Queue** - Send SMS via Termii (primary) or Twilio (fallback)
4. **CGPA Queue** - Recompute student GPAs in bulk

## Database

MongoDB with Mongoose ODM. 35 collections cover:
- Academic management (sessions, departments, programmes, courses)
- Student management (records, enrollments, results, fees)
- Staff management (records, leave, appraisals)
- Financial management (payments, scratch cards, fee structures)
- Hostel management (hostels, rooms, allocations)
- Senate management (meetings, result sheets, prayers)
- Learning management (modules, resources)
- System management (users, audit logs, reports)

## Testing

```bash
npm run test              # Run all tests
npm run test -- --coverage  # With coverage report
```

## Logging

Winston logger with daily file rotation:
- `logs/error-*.log` - Errors only
- `logs/combined-*.log` - All logs

## Security

- Password hashing with bcryptjs (12 rounds)
- JWT tokens with configurable expiry
- TOTP 2FA support
- Rate limiting on API endpoints
- CORS protection
- Helmet.js for HTTP headers
- Input validation with Zod
- Audit logging of all operations

## Monitoring

Health check endpoint: `GET /api/health`

Returns:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "db": "connected",
    "redis": "connected",
    "queueWorkers": 4,
    "lastBackupAt": "2024-06-18T10:30:00Z",
    "version": "1.0.0",
    "uptimeSeconds": 3600
  }
}
```

## Troubleshooting

### MongoDB Connection Issues
- Check `MONGODB_URI` format
- Verify MongoDB is running: `docker ps`
- Check credentials if using authentication
- Look for errors in logs

### Redis Connection Issues
- Ensure Redis is running on configured host:port
- Check `REDIS_PASSWORD` if authentication enabled
- Look for "Redis connection failed" in logs

### Email Not Sending
- Verify SMTP credentials
- Check `FROM_EMAIL` format
- Look for email template errors in logs
- Verify email job in Redis UI

### Scratch Card Issues
- Check card serial/PIN format
- Verify card exists in database
- Check rate limiting (max 5 attempts/30min)
- Look for payment transaction in DB

## Performance Tips

1. Enable query indexing in MongoDB
2. Use Redis for session caching
3. Batch process CGPA computation jobs
4. Monitor BullMQ queue depths
5. Review slow query logs
6. Implement pagination for large datasets

## Docker

```bash
# Build backend image
docker build -f Dockerfile -t coels-crms-backend:latest .

# Build dev image with hot reload
docker build -f Dockerfile.dev -t coels-crms-backend:dev .
```

## Contributing

- Use TypeScript for type safety
- Follow ESLint rules: `npm run lint`
- Add tests for new features
- Update README for significant changes
- Use conventional commits

## Support

For issues or questions, contact the development team.

---

**Last Updated:** June 2024  
**Version:** 1.0.0
