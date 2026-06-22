import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const TwoFactorConfirmSchema = z.object({
  tempToken: z.string(),
  totpCode: z.string().length(6),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/),
});

// ─────────────────────────────────────────────────────────────
// STUDENT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateStudentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE']),
  dob: z.coerce.date(),
  stateOfOrigin: z.string().min(1),
  lga: z.string().min(1),
  nationality: z.string().default('Nigerian'),
  phone: z.string().optional(),
  programmeId: z.string().length(24, 'Invalid ObjectId'),
  currentLevel: z.number().int().refine(v => [100,200,300,400,500].includes(v)),
  admissionYear: z.number().int().min(2000).max(2100),
  guardian: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }).optional(),
});

// ─────────────────────────────────────────────────────────────
// RESULT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const SubmitResultSchema = z.object({
  enrolmentId: z.string().length(24),
  caScore: z.number().min(0).max(40),
  examScore: z.number().min(0).max(60),
});

export const BulkSubmitResultSchema = z.object({
  semesterId: z.string().length(24),
  results: z.array(SubmitResultSchema).min(1).max(200),
});

// ─────────────────────────────────────────────────────────────
// PAYMENT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const ScratchCardRedeemSchema = z.object({
  serial: z.string().length(16, 'Serial must be 16 characters'),
  pin: z.string().length(8, 'PIN must be 8 digits').regex(/^\d+$/),
  studentFeeId: z.string().length(24),
});

export const InitiatePaymentSchema = z.object({
  studentFeeId: z.string().length(24),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'USSD']),
});

// ─────────────────────────────────────────────────────────────
// TRANSCRIPT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const TranscriptRequestSchema = z.object({
  destinationInstitution: z.string().min(2),
  destinationAddress: z.string().min(5),
  destinationEmail: z.string().email(),
  copies: z.number().int().min(1).max(5).default(1),
});

// ─────────────────────────────────────────────────────────────
// SENATE SCHEMAS
// ─────────────────────────────────────────────────────────────

export const SenatePrayerSubmitSchema = z.object({
  meetingId: z.string().length(24),
  title: z.string().min(5).max(200),
  body: z.string().min(20),
});

export const SenateVoteSchema = z.object({
  prayerId: z.string().length(24),
  vote: z.enum(['FOR', 'AGAINST', 'ABSTAIN']),
});

// ─────────────────────────────────────────────────────────────
// HOSTEL SCHEMAS
// ─────────────────────────────────────────────────────────────

export const HostelBookingSchema = z.object({
  roomId: z.string().length(24),
  sessionId: z.string().length(24),
  bedSpace: z.number().int().min(1).max(10),
});

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f

// ─────────────────────────────────────────────────────────────
// ADMISSION SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateAdmissionCycleSchema = z.object({
  academicSession: z.string().length(24),
  programme: z.string().length(24),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  prayerDeadline: z.coerce.date().optional(),
  status: z.enum(['PLANNING', 'OPEN', 'CLOSED']).default('PLANNING'),
  applicationFee: z.number().min(0),
  maxApplications: z.number().int().min(1),
});

export const SubmitApplicationSchema = z.object({
  cycleId: z.string().length(24),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  state: z.string(),
  lga: z.string(),
  programme: z.string().length(24),
  documentUrls: z.array(z.string().url()).optional(),
});

// ─────────────────────────────────────────────────────────────
// ENROLMENT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const EnrolCoursesSchema = z.object({
  semesterId: z.string().length(24),
  courseOfferingIds: z.array(z.string().length(24)).min(3).max(8),
});

// ─────────────────────────────────────────────────────────────
// STAFF SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateStaffSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  staffId: z.string().min(5),
  department: z.string().length(24),
  title: z.string(),
  qualification: z.string(),
  employmentDate: z.coerce.date(),
});

export const AssignCoursesSchema = z.object({
  courseOfferingIds: z.array(z.string().length(24)).min(1),
});

// ─────────────────────────────────────────────────────────────
// LEARNING SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateLearningModuleSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  learningOutcomes: z.array(z.string()).optional(),
});

export const UploadResourceSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  resourceType: z.enum(['VIDEO', 'PDF', 'DOCUMENT', 'AUDIO', 'LINK']),
  resourceUrl: z.string().url(),
  isOfflineAvailable: z.boolean().default(false),
  duration: z.number().optional(),
});

export const TrackProgressSchema = z.object({
  status: z.enum(['VIEWED', 'IN_PROGRESS', 'COMPLETED']),
  progress: z.number().min(0).max(100).optional(),
  timeSpent: z.number().int().min(0).optional(),
});

// ─────────────────────────────────────────────────────────────
// APPRAISAL SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateAppraisalSchema = z.object({
  appraiserListId: z.string().length(24),
  academicYear: z.string(),
  performanceRating: z.number().min(1).max(5),
  comments: z.string().optional(),
});

export const RequestLeaveSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'STUDY', 'SPECIAL', 'MATERNITY']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(10),
  replacementStaff: z.string().length(24).optional(),
});

// ─────────────────────────────────────────────────────────────
// REPORTS SCHEMAS
// ─────────────────────────────────────────────────────────────

export const ReportExportSchema = z.object({
  reportType: z.enum(['NCCE_ENROLMENT', 'NYSC_LIST', 'PAYMENT_SUMMARY', 'RESULT_SUMMARY']),
  format: z.enum(['CSV', 'PDF', 'JSON']).default('CSV'),
  sessionId: z.string().length(24).optional(),
});

// ─────────────────────────────────────────────────────────────
// ALUMNI SCHEMAS
// ─────────────────────────────────────────────────────────────

export const CreateAlumniSchema = z.object({
  studentId: z.string().length(24),
  sessionId: z.string().length(24),
});

<<<<<<< HEAD
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
=======
>>>>>>> 8e59fd705bf9514513ad1c34b00061d692a81a7f
