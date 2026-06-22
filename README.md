# COELS CRMS — Production-Ready Monorepo

> **College of Education Records Management System** - A comprehensive, scalable MERN stack application for educational institution management.

## 🏗️ Project Structure

```
/coels-crms
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind + shadcn/ui
├── backend/                  # Express 5 + TypeScript + Mongoose + MongoDB + Redis
├── shared/                   # Shared TypeScript types, Zod schemas, enums
├── templates/                # Handlebars HTML email templates (5 files)
├── nginx/                    # Nginx configuration (dev & prod)
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
├── .github/workflows/        # CI/CD pipeline
└── .env.example              # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Docker** & **Docker Compose** (for containerized development)
- **MongoDB** 7.x
- **Redis** 7.x

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd coels-crms
   cp .env.example .env
   npm install
   ```

2. **Start Development Environment**
   ```bash
   # Option 1: Using Docker Compose (recommended)
   docker-compose up --build

   # Option 2: Manual setup
   npm run dev:backend   # Terminal 1
   npm run dev:frontend  # Terminal 2
   npm run worker        # Terminal 3
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api
   - Nginx Proxy: http://localhost

### Production Deployment

```bash
# Build all packages
npm run build

# Run production containers
docker-compose -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📦 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Headless component library
- **TanStack Query (React Query)** - Data fetching & caching
- **Zustand** - State management
- **Zod** - Schema validation
- **React Router v6** - Client-side routing

### Backend
- **Express 5** - Web framework
- **TypeScript** - Type-safe backend
- **Mongoose 8** - MongoDB ODM
- **BullMQ** - Job queue for background processing
- **Redis** - Caching & session store
- **JWT** - Authentication tokens
- **Speakeasy** - TOTP 2FA support
- **Nodemailer** - Email sending
- **AWS SDK v3** - S3 & CloudFront integration
- **Winston** - Structured logging

### Infrastructure
- **MongoDB** - Primary database
- **Redis** - Cache & queue broker
- **Nginx** - Reverse proxy & load balancer
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

## 🔐 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Two-Factor Authentication (TOTP)
- ✅ bcryptjs password hashing (12 rounds)
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Helmet.js for HTTP headers security
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Mongoose
- ✅ XSS protection
- ✅ CSRF tokens support
- ✅ Audit logging for all operations
- ✅ Role-based access control (RBAC)

## 📋 User Roles & Permissions

| Role | Dashboard | Students | Courses | Results | Fees | Senate | Reports | Admin |
|------|-----------|----------|---------|---------|------|--------|---------|-------|
| Student | ✓ | ✓ | ✓ | ✓ | ✓ | - | - | - |
| Lecturer | ✓ | - | ✓ | ✓ | - | - | - | - |
| HOD | ✓ | ✓ | ✓ | ✓ | - | - | ✓ | - |
| Registrar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Bursary | ✓ | - | - | - | ✓ | - | ✓ | - |
| Senate Member | ✓ | - | - | - | - | ✓ | - | - |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 🔄 Background Jobs (BullMQ Queues)

1. **PDF Generation** - Transcripts, receipts, senate minutes
2. **Email Notifications** - Admission offers, payment receipts, password resets
3. **SMS Notifications** - Termii (primary) + Twilio (fallback)
4. **CGPA Computation** - Bulk student GPA recalculation

## 📧 Email Templates

- `admission-offer.hbs` - Admission notification
- `payment-receipt.hbs` - Payment confirmation
- `transcript-dispatch.hbs` - Transcript shipment tracking
- `senate-reminder.hbs` - Senate meeting reminder
- `password-reset.hbs` - Password reset link

## 🗄️ Database Models (35 Collections)

Academic Management:
- `academicSession` - Academic year configuration
- `semester` - Semester definitions
- `department` - Department management
- `programme` - Study programmes
- `course` - Course catalog
- `courseOffering` - Course sections & offerings

Student Management:
- `student` - Student records
- `applicant` - Admission applicants
- `enrolment` - Course enrollments
- `result` - Student grades & results
- `studentProgress` - Academic progress tracking
- `studentFee` - Student fee records
- `cgpaRecord` - CGPA computation history
- `alumni` - Alumni records

Staff Management:
- `staff` - Staff records
- `staffLeaveRequest` - Leave request tracking
- `staffAppraisal` - Performance appraisals

Financial:
- `payment` - Payment records
- `scratchCard` - Scratch card inventory
- `feeStructure` - Fee configuration

Hostel Management:
- `hostel` - Hostel facilities
- `hostelRoom` - Room management
- `hostelAllocation` - Student room assignments

Senate:
- `senateMeeting` - Meeting records
- `senateResultSheet` - Result approval sheets
- `senatePrayer` - Prayer submissions

Learning Management:
- `learningModule` - Course modules
- `learningResource` - Educational resources

System:
- `user` - User accounts
- `auditLog` - Activity tracking
- `notificationLog` - Notification history
- `reportSnapshot` - Generated reports

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests with coverage
npm run test --workspace=backend -- --coverage

# Frontend tests
npm run test --workspace=frontend
```

## 📊 CI/CD Pipeline

GitHub Actions automatically:
- ✅ Lints code (ESLint)
- ✅ Type-checks (TypeScript)
- ✅ Runs unit tests with coverage
- ✅ Builds Docker images
- ✅ Deploys to production (on main branch)

## 📝 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register         - User registration
POST   /api/auth/login            - User login
POST   /api/auth/refresh          - Refresh access token
POST   /api/auth/logout           - User logout
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password with token
POST   /api/auth/2fa/setup        - Setup 2FA
POST   /api/auth/2fa/verify       - Verify 2FA code
POST   /api/auth/2fa/confirm      - Confirm 2FA login
GET    /api/auth/me               - Get current user
```

### Health Check

```
GET    /api/health                - System health status
```

## 🛠️ Development Commands

```bash
# Root level
npm run dev                        # Start all services
npm run build                      # Build all packages
npm run lint                       # Lint all packages
npm run test                       # Test all packages

# Backend
npm run dev --workspace=backend    # Dev server with hot reload
npm run build --workspace=backend  # Build backend
npm run seed --workspace=backend   # Seed database

# Frontend
npm run dev --workspace=frontend   # Vite dev server
npm run build --workspace=frontend # Production build
npm run preview --workspace=frontend # Preview production build

# Shared
npm run build --workspace=shared   # Build types
npm run dev --workspace=shared     # Watch mode
```

## 📦 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Critical for production
- JWT_SECRET (min 64 chars)
- JWT_REFRESH_SECRET (min 64 chars)
- MONGODB_URI with credentials
- REDIS_PASSWORD
- AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY
- SMTP credentials
- API keys (Termii, Twilio, Paystack)
```

## 🔍 Monitoring & Logging

- **Winston** - Structured JSON logging with daily rotation
- **Redis** - Query result caching
- **Audit Log** - Track all user actions
- **Health Check** - Real-time system status

## 📱 Features

- **Responsive Design** - Mobile-first UI
- **Offline Support** - Service Worker & PWA
- **Real-time Notifications** - Socket.IO ready
- **Data Export** - Excel & PDF generation
- **File Upload** - AWS S3 with CloudFront CDN
- **Payment Processing** - Paystack integration
- **Email Templates** - Handlebars-based custom emails
- **Background Jobs** - Reliable job processing with BullMQ
- **Dark Mode** - Theme switching support

## 🚨 Troubleshooting

### Port already in use
```bash
# Find and kill process on port
lsof -i :4000  # or 5173, 27017, 6379
kill -9 <PID>
```

### Docker issues
```bash
# Clear all Docker data
docker-compose down -v

# Rebuild from scratch
docker-compose up --build --force-recreate
```

### Database connection issues
```bash
# Check MongoDB is running
docker-compose ps

# Verify credentials in .env
# Test connection: mongosh "mongodb://user:pass@localhost:27017"
```

## 📄 License

Proprietary - COELS

## 👥 Contributors

- Development Team - COELS

## 📞 Support

For issues, questions, or contributions, please contact the development team or open an issue in the repository.

---

**Last Updated:** June 2024  
**Version:** 1.0.0  
**Status:** Production Ready ✅
