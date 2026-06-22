# COELS CRMS - Security Audit Report

Generated: 2026-06-18

Summary: this report lists discovered API routes and an initial security assessment against the hardening checklist (authentication, RBAC, rate-limiting, Zod validation, ownership checks, public flags). Use this as a triage checklist — follow-up remediation steps are inline in Notes.

| Route | Method | Auth | Allowed Roles | Rate Limited | Zod Validation | Ownership Check | Public | Notes |
|---|---:|---|---|---:|---|---|---:|---|
| /api/health | GET | No | - | No | No | No | Yes | Healthcheck - public by design |
| /api/auth/* (login, register, refresh) | POST/GET | Some | - | Yes (auth limiter) | Login/Register use Zod | N/A | Some | Auth endpoints protected by stricter rate limit; ensure CSRF for refresh cookie |
| /api/admissions/cycles | POST | Yes | registrar, super_admin | Yes (global) | CreateAdmissionCycleSchema | No | No | GET /api/admissions/cycles is public (application form uses it) |
| /api/admissions/cycles (GET) | GET | No | - | Yes | - | No | Yes | Public listing of cycles used by applicants |
| /api/admissions/apply | POST | No | - | Yes | SubmitApplicationSchema | No | Yes | Public application endpoint — validate and virus-scan uploads client-side |
| /api/admissions/:id/shortlist | PATCH | Yes | registrar, super_admin | Yes | - | No | No | Authorization middleware present |
| /api/admissions/:id/admit | PATCH | Yes | registrar, super_admin | Yes | - | No | No | Admission flow uses DB transactions; audit logged
| /api/admissions/:id/reject | PATCH | Yes | registrar, super_admin | Yes | - | No | No | Rejection queues email (BullMQ)
| /api/students/* | GET/POST/PATCH/DELETE | Yes | registrar, super_admin for writes; authenticated for reads | Yes | CreateStudentSchema | isOwner for student-only reads | Some | Ensure student records read endpoints apply `isOwner` where appropriate |
| /api/students/import | POST | Yes | registrar, super_admin | Yes | CSV import validated server-side | No | No | bulk import uses insertMany ordered:false; validate thoroughly
| /api/enrolments | POST | Yes | student | Yes | EnrolCoursesSchema | Ownership: registerCourses uses req.user | No | Enrolment logic validates fees, semester, credit load
| /api/enrolments/my-courses/:semesterId | GET | Yes | student | Yes | - | Implicit via req.user | No | Student-only
| /api/enrolments/:id (DELETE drop) | DELETE | Yes | student | Yes | - | isOwner(check enrolment.owner) recommended | No | Add ownership check to ensure student drops own enrolment
| /api/results/bulk | POST | Yes | lecturer, hod, registrar, super_admin | Yes | BulkSubmitResultSchema | No | No | Bulk uploads queue CGPA jobs; ensure CSV sanitisation
| /api/results/:studentId | GET | Yes | authenticated | Yes | - | isOwner for students | No | HOD/registrar require broader access — ensure authorize roles present
| /api/results/:id/approve | PATCH | Yes | hod, registrar, super_admin | Yes | - | No | No | Approvals enforce dept scope in service
| /api/results/publish | POST | Yes | registrar, super_admin | Yes | - | No | No | Batch publish triggers CGPA jobs
| /api/cgpa/:studentId | GET | Yes | authenticated | Yes | - | isOwner recommended | No | CGPA read access should be controlled
| /api/payments/initiate | POST | Yes | student | Yes | InitiatePaymentSchema | isOwner (student) | No | Payment initiation uses Paystack
| /api/payments/webhook | POST | No (raw) | internal | Yes | raw body signature validated | No | Yes (public) | Webhook signature verification implemented; invalid signatures audited
| /api/payments/scratch-card | POST | Yes | student | Yes | ScratchCardRedeemSchema | isOwner (student) | No | Scratch-card brute-force protection and audit implemented
| /api/scratch-cards/generate | POST | Yes | bursary, super_admin | Yes | - | No | No | Return of serials handled — ensure secure printing流程
| /api/transcripts/request | POST | Yes | student | Yes | TranscriptRequestSchema | isOwner (student) | No | Transcript request requires fees cleared; verification token created
| /api/transcripts/verify/:token | GET | No | public | Yes | - | No | Yes | Public verification page — ensure rate limiting and HTML sanitisation
| /api/transcripts/:id/download | GET | Yes | student, registrar, super_admin | Yes | - | authoriseFileAccess('transcript') | No | Uses presigned S3 URL — ownership enforced by middleware
| /api/learning/resources/:resourceId/stream | GET | Yes | student/lecturer/hod/admin | Yes | - | authoriseFileAccess('elearning') | No | Streaming URLs protected by authoriseFileAccess
| /api/senate/* (meetings/prayers) | GET/POST/PATCH | Some | senate_member, vc, registrar, super_admin as appropriate | Yes | Senate schemas present | Permissions check for senate:participate | Some | Votes require `senate:participate` permission; middleware enforces it
| /api/reports/* | GET | Yes | registrar, super_admin | Yes | ReportExportSchema | No | No | Exports should be logged to AuditLog (EXPORT events)
| /api/alumni/verify/:token | GET | No | public | Yes | - | No | Yes | Public verification — sanitize output

Notes & Recommendations:
- Public endpoints that return sensitive data (e.g., `/api/transcripts/verify/:token`) must HTML-escape and rate-limit to prevent scraping.
- Ensure `isOwner` checks on all student-scoped GET/PUT/DELETE endpoints (students, enrolments, payments, transcripts, hostel allocations).
- All file download/stream endpoints should use `authoriseFileAccess` middleware to enforce ownership and role checks.
- Webhook endpoints are now registered before JSON body parsing and invalid signatures are logged to `AuditLog` with `WEBHOOK_REJECTED`.
- Scratch-card brute-force protection is implemented with Redis; confirm Redis availability and monitor `SCRATCH_CARD_LOCK` events.
- CSRF: token refresh uses httpOnly refresh cookie; add `csurf` to mutating routes if using cookies for state change.
- Rate limiting: auth routes use stricter limits; consider adding per-user limits for sensitive admin endpoints.
- Validation: ensure every route uses Zod schema middleware where applicable; add middleware wrapper to enforce schema validation consistently.
- Audit: auditPlugin applied to core models (Student, Result, Payment, TranscriptRequest, ScratchCard, Applicant, Enrolment, CgpaRecord, Staff). Manual AuditLog events created for LOGIN, LOGOUT, EXPORT, SCRATCH_CARD_FAIL/LOCK, WEBHOOK_REJECTED.

Residual risks:
- Many routes still accept file uploads; ensure server-side MIME/type validation using `file-type` on uploaded buffers before passing to S3.
- Email and PDF workers should sanitize templates and limit included user-supplied HTML.
- Ensure environment secrets (PAYSTACK_SECRET_KEY, AWS keys, SMTP) are stored securely and rotated.

Next actions (recommended):
1. Run integration tests against staging with Redis & S3 mocked.
2. Add Zod validation middleware to any routes marked Unknown.
3. Harden worker processes with strict timeouts and sandboxing for puppeteer.
4. Add monitoring/alerting for AuditLog events flagged (WEBHOOK_REJECTED, SCRATCH_CARD_LOCK, ACCOUNT_LOCKED).


*This report was generated automatically from route inspection and implemented middleware changes. Review and refine as needed.*
