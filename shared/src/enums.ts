// ─────────────────────────────────────────────────────────────
// COELS CRMS — Shared Enums
// ─────────────────────────────────────────────────────────────

export enum UserRole {
  STUDENT         = 'student',
  LECTURER        = 'lecturer',
  HOD             = 'hod',
  REGISTRAR       = 'registrar',
  BURSARY         = 'bursary',
  HOSTEL_OFFICER  = 'hostel_officer',
  SENATE_MEMBER   = 'senate_member',
  VC              = 'vc',
  SUPER_ADMIN     = 'super_admin',
}

export enum ProgrammeType {
  NCE           = 'NCE',
  DIPLOMA       = 'DIPLOMA',
  PART_TIME_NCE = 'PART_TIME_NCE',
  OTHER         = 'OTHER',
}

export enum Gender {
  MALE   = 'MALE',
  FEMALE = 'FEMALE',
}

export enum StudentStatus {
  ACTIVE     = 'ACTIVE',
  WITHDRAWN  = 'WITHDRAWN',
  GRADUATED  = 'GRADUATED',
  SUSPENDED  = 'SUSPENDED',
  DEFERRED   = 'DEFERRED',
}

export enum SemesterName {
  FIRST  = 'FIRST',
  SECOND = 'SECOND',
}

export enum Grade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
}

export enum ResultStatus {
  DRAFT     = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED  = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export enum PaymentMethod {
  CARD         = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  SCRATCH_CARD  = 'SCRATCH_CARD',
  USSD          = 'USSD',
}

export enum PaymentStatus {
  PENDING  = 'PENDING',
  SUCCESS  = 'SUCCESS',
  FAILED   = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum StudentFeeStatus {
  UNPAID  = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID    = 'PAID',
  WAIVED  = 'WAIVED',
  OVERDUE = 'OVERDUE',
}

export enum TranscriptStatus {
  PENDING    = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED   = 'APPROVED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED  = 'DELIVERED',
}

export enum HostelAllocationStatus {
  BOOKED    = 'BOOKED',
  CONFIRMED = 'CONFIRMED',
  VACATED   = 'VACATED',
  CANCELLED = 'CANCELLED',
}

export enum SenatePrayerStatus {
  DRAFT        = 'DRAFT',
  SUBMITTED    = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED     = 'APPROVED',
  REJECTED     = 'REJECTED',
}

export enum VoteChoice {
  FOR     = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
}

export enum ResourceType {
  VIDEO = 'VIDEO',
  PDF   = 'PDF',
  AUDIO = 'AUDIO',
  LINK  = 'LINK',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS   = 'SMS',
}

export enum AuditAction {
  CREATE             = 'CREATE',
  UPDATE             = 'UPDATE',
  DELETE             = 'DELETE',
  LOGIN              = 'LOGIN',
  LOGOUT             = 'LOGOUT',
  EXPORT             = 'EXPORT',
  SCRATCH_CARD_FAIL  = 'SCRATCH_CARD_FAIL',
  WEBHOOK_REJECTED   = 'WEBHOOK_REJECTED',
}

export enum ReportType {
  NCCE_ENROLMENT    = 'NCCE_ENROLMENT',
  NUC_ACCREDITATION = 'NUC_ACCREDITATION',
  NBTE_STATS        = 'NBTE_STATS',
  NYSC_LIST         = 'NYSC_LIST',
  PAYMENT_SUMMARY   = 'PAYMENT_SUMMARY',
  RESULT_SUMMARY    = 'RESULT_SUMMARY',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  ADJUNCT   = 'ADJUNCT',
}
