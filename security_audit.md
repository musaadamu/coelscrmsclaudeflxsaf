# Security Audit Report — COELS CRMS
*Phase 5 Deliverable*

## 1. Authentication & RBAC Rules Matrix

| Route                                         | Method | Auth  | Allowed Roles                          | Rate Limited | Zod Validation | Ownership / Notes | Public |
|-----------------------------------------------|--------|-------|----------------------------------------|--------------|----------------|-------------------|--------|
| `/api/auth/register`                          | POST   | None  | All                                    | Yes (10/15m) | Yes            | N/A               | 🟢 Yes |
| `/api/auth/login`                             | POST   | None  | All                                    | Yes (10/15m) | Yes            | Account lockout   | 🟢 Yes |
| `/api/auth/2fa/setup`                         | POST   | Auth  | All                                    | Yes          | N/A            |                   | 🔴 No  |
| `/api/auth/2fa/verify`                        | POST   | Auth  | All                                    | Yes          | Yes            |                   | 🔴 No  |
| `/api/auth/logout`                            | POST   | Auth  | All                                    | Yes          | N/A            | LOGOUT audit      | 🔴 No  |
| `/api/auth/refresh`                           | POST   | None  | All (via Cookie)                       | Yes          | N/A            | httpOnly secure   | 🟢 Yes |
| `/api/auth/forgot-password`                   | POST   | None  | All                                    | Yes          | Yes            |                   | 🟢 Yes |
| `/api/students/`                              | GET    | Auth  | registrar, super_admin                 | Yes (300/m)  | Yes            |                   | 🔴 No  |
| `/api/students/:id`                           | GET    | Auth  | student, registrar, super_admin        | Yes          | N/A            | `isOwner` check   | 🔴 No  |
| `/api/students/:id`                           | PATCH  | Auth  | student, registrar, super_admin        | Yes          | Yes            | `isOwner` check   | 🔴 No  |
| `/api/students/import`                        | POST   | Auth  | registrar, super_admin                 | Yes          | N/A            |                   | 🔴 No  |
| `/api/admissions/cycles`                      | GET    | None  | All                                    | Yes          | N/A            |                   | 🟢 Yes |
| `/api/admissions/apply`                       | POST   | None  | All                                    | Yes          | Yes            |                   | 🟢 Yes |
| `/api/admissions/:id/admit`                   | PATCH  | Auth  | registrar, super_admin                 | Yes          | N/A            | Transaction       | 🔴 No  |
| `/api/enrolments`                             | POST   | Auth  | student                                | Yes          | Yes            | `isOwner` implicit| 🔴 No  |
| `/api/enrolments/my-courses/:semesterId`      | GET    | Auth  | student                                | Yes          | N/A            | `isOwner` implicit| 🔴 No  |
| `/api/results/bulk`                           | POST   | Auth  | lecturer, hod, registrar, super_admin  | Yes          | Yes            |                   | 🔴 No  |
| `/api/results/:studentId`                     | GET    | Auth  | student, lecturer, hod, registrar, ... | Yes          | N/A            | `isOwner` check   | 🔴 No  |
| `/api/cgpa/:studentId`                        | GET    | Auth  | student, registrar, super_admin        | Yes          | N/A            | `isOwner` check   | 🔴 No  |
| `/api/payments/initiate`                      | POST   | Auth  | student                                | Yes          | Yes            | `isOwner` implicit| 🔴 No  |
| `/api/payments/webhook`                       | POST   | None  | Paystack Servers                       | Yes          | N/A            | HMAC verified     | 🟢 Yes |
| `/api/payments/scratch-card`                  | POST   | Auth  | student                                | Yes          | Yes            | Redis bruteforce  | 🔴 No  |
| `/api/scratch-cards/generate`                 | POST   | Auth  | bursary, super_admin                   | Yes          | Yes            | Transaction       | 🔴 No  |
| `/api/transcripts/request`                    | POST   | Auth  | student                                | Yes          | Yes            | `isOwner` implicit| 🔴 No  |
| `/api/transcripts/:id/download`               | GET    | Auth  | student                                | Yes          | N/A            | 📁 `authoriseFile`| 🔴 No  |
| `/api/staff`                                  | POST   | Auth  | super_admin                            | Yes          | Yes            |                   | 🔴 No  |
| `/api/hostel-allocations`                     | POST   | Auth  | student                                | Yes          | Yes            | `isOwner` implicit| 🔴 No  |
| `/api/senate/meetings`                        | POST   | Auth  | vc, super_admin                        | Yes          | Yes            |                   | 🔴 No  |
| `/api/senate/meetings/:meetingId/prayers`     | POST   | Auth  | senate_member                          | Yes          | Yes            | `senate` perm     | 🔴 No  |
| `/api/reports/ncce-enrolment`                 | GET    | Auth  | registrar, super_admin                 | Yes          | N/A            | 📊 EXPORT logged  | 🔴 No  |
| `/api/learning/resources/:resourceId/stream`  | GET    | Auth  | student, lecturer, hod, super_admin    | Yes          | N/A            | 📁 `authoriseFile`| 🔴 No  |

## 2. Hardening Measures Implemented

1. **Password Policy**: Enforced rigidly via Zod (Min 8 chars, 1 uppercase, 1 numeric, 1 special character).
2. **Account Lockout**: Users exceeding 5 failed login attempts are strictly locked out for 15 minutes.
3. **Audit Logging**: `auditPlugin` applies context-aware logging (capturing User ID, IP, and User-Agent) on all system schemas (`CREATE`, `UPDATE`, `DELETE`).
4. **Scratch Card Anti-Bruteforce**: PIN submission errors increment a Redis counter locking out the exact serial number after 5 failures for 30 minutes.
5. **Webhook Security**: `express.raw()` body parsing preserves identical byte alignment for Payload Signature Verification via HMAC SHA-512 against `x-paystack-signature`.
6. **File Authorisation Middleware**: Reusable `authoriseFileAccess` rigorously confirms document ownership or administrative status BEFORE yielding signed CloudFront / S3 pre-signed URLs.

*Residual Risks*: 
- S3 bucket objects must enforce private ACLs exclusively; only the backend's presigned URLs should grant explicit GET access.
