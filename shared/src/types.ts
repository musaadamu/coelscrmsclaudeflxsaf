// ─────────────────────────────────────────────────────────────
// COELS CRMS — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Auth types ───────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  roles: string[];
  email: string;
  studentId?: string;
  permissions?: string[];
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

// ── BullMQ Job Payload Types ─────────────────────────────────

export interface PdfJob {
  type: 'transcript' | 'receipt' | 'senate_minutes';
  recordId: string;
}

export interface EmailJob {
  template: string;
  to: string;
  subject: string;
  context: Record<string, unknown>;
}

export interface SmsJob {
  to: string;
  message: string;
}

export interface CgpaJob {
  studentIds: string[];
  semesterId: string;
}

// ── NYSC List Row ────────────────────────────────────────────

export interface NyscListRow {
  name: string;
  matric_no: string;
  lga: string;
  state_of_origin: string;
  programme: string;
  graduation_year: number;
  phone: string;
  photo_url: string;
}

// ── CGPA Calculation ─────────────────────────────────────────

export interface CgpaResult {
  semesterGpa: number;
  cumulativeGpa: number;
  unitsRegistered: number;
  unitsPassed: number;
  unitsFailed: number;
}

// ── Scratch Card ─────────────────────────────────────────────

export interface GeneratedCard {
  serial: string;
  pin: string;
}

// ── File Upload ──────────────────────────────────────────────

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
}

// ── Health Check ─────────────────────────────────────────────

export interface HealthStatus {
  status: 'ok' | 'degraded';
  db: 'connected' | 'error';
  redis: 'connected' | 'error';
  queueWorkers: number;
  lastBackupAt: string | null;
  version: string;
  uptimeSeconds: number;
}
