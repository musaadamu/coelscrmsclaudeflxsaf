# Software Requirements Specification (SRS)
## COELS College Records Management System (CRMS)

**Document Version:** 1.0.0  
**Target System:** Replacement of FlexiSAF SRMS (coelsnguru.safsrms.com) and SAFRecords (coelsnguru.safrecords.com)  
**Institution:** College of Education and Legal Studies (COELS), Nguru, Yobe State, Nigeria  
**Primary Domain:** `crms.coels.edu.ng` | **Alias Domain:** `portal.coels.edu.ng`  
**Tech Stack:** MongoDB 7 (Mongoose 8) + Express 5 + React 18 + Node.js 20  

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Consolidated Roles & Permissions Matrix](#2-consolidated-roles--permissions-matrix)
3. [Mongoose Modeling Conventions & Data Design Decisions](#3-mongoose-modeling-conventions--data-design-decisions)
4. [Functional Modules Specification](#4-functional-modules-specification)
   - [M01 Student Registration & Profile Management](#m01-student-registration--profile-management)
   - [M02 Online Admission Application (OAA)](#m02-online-admission-application-oaa)
   - [M03 Course Registration](#m03-course-registration)
   - [M04 Results Computation & CGPA Engine](#m04-results-computation--cgpa-engine)
   - [M05 Fees Collection & Scratch Cards](#m05-fees-collection--scratch-cards)
   - [M06 Transcript Management](#m06-transcript-management)
   - [M07 Staff Portal & Role Assignment](#m07-staff-portal--role-assignment)
   - [M08 Hostel Reservation & Allocation](#m08-hostel-reservation--allocation)
   - [M09 Paperless Senate](#m09-paperless-senate)
   - [M10 E-Learning Services](#m10-e-learning-services)
   - [M11 Regulatory Reports (NCCE/NYSC)](#m11-regulatory-reports-nccenysc)
   - [M12 HRMS & Staff Appraisal](#m12-hrms--staff-appraisal)
   - [M13 Alumni Management](#m13-alumni-management)
   - [M14 System Administration](#m14-system-administration)
5. [Nigerian Academic Context & CGPA Specs](#5-nigerian-academic-context--cgpa-specs)
6. [Non-Functional & Security Requirements](#6-non-functional--security-requirements)

---

## 1. System Overview & Architecture

COELS CRMS serves as a single integrated records, financial, senate, and learning platform. 

```
                                +-----------------------------+
                                |      React 18 Frontend      |
                                | (Vite, Tailwind CSS, PWA)   |
                                +--------------+--------------+
                                               |
                                     JSON REST API (HTTPS)
                                               |
                                +--------------v--------------+
                                |      Express 5 Backend      |
                                |     (Node.js 20, TS)        |
                                +-------+--------------+------+
                                        |              |
                +-----------------------v------+       +------v-----------------------+
                |    MongoDB 7 (Primary Data)  |       |        Redis 7 Cache         |
                |    ODM: Mongoose 8           |       | (Session, BullMQ, Lockouts)  |
                +------------------------------+       +------------------------------+
```

### Monorepo Structure
- `/backend`: Node.js Express API server with TypeScript, Mongoose models, repositories, and controllers.
- `/frontend`: React SPA, built with Vite, Tailwind CSS, shadcn/ui, TanStack Query, and Zustand.
- `/shared`: Common type definitions, Zod validation schemas, and constants.
- `/templates`: Handlebars templates for transactional emails and PDF generators.

### Third-Party Integrations
- **Termii API**: Primary SMS gateway for OTP, Senate updates, and fee alerts.
- **Twilio**: Fallback SMS provider.
- **Paystack**: Direct payment processing (cards, bank transfers, USSD).
- **Nodemailer + AWS SES**: Academic records, admission notifications, and staff communications.
- **AWS S3 & CloudFront**: Secure hosting of e-learning videos (via CDN) and student documents.

---

## 2. Consolidated Roles & Permissions Matrix

The system implements Role-Based Access Control (RBAC) via the `User.roles` array. Senate participation is mapped to `User.permissions` containing `'senate:participate'`.

| Module | student | lecturer | hod | registrar | bursary | hostel_officer | senate_member | vc | super_admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **M01 Student Profile** | Write/Own | Read | Read | Write/All | Read | Read | - | Read | Write/All |
| **M02 Admission (OAA)**| Apply | - | - | Manage | Verify | - | - | Read | Configure |
| **M03 Course Reg** | Write/Own | Read | Approve | Approve | Verify | - | - | Read | Override |
| **M04 Results & CGPA** | Read/Own | Input | Approve | Read | - | - | - | Read | Audit |
| **M05 Fees & Cards** | Pay/View | - | - | Read | Manage | - | - | Read | Configure |
| **M06 Transcript** | Request | - | - | Approve | Verify | - | - | - | Override |
| **M07 Staff Portal** | - | Write/Own | Manage/Dept| Manage/All| Read | - | - | Read | Manage/All |
| **M08 Hostel** | Book/Own | - | - | Read | Verify | Manage | - | Read | Configure |
| **M09 Senate** | - | Submit | Approve/Dept| Manage/Agenda| - | - | Participate | View/Approve | Manage |
| **M10 E-Learning** | Read/Learn| Upload/Own| Approve | - | - | - | - | - | Configure |
| **M11 Reports** | - | - | Read/Dept | Read/All | Read/Fin | - | Read | Read/All | Generate |
| **M12 HRMS & Appraisal**| - | Write/Own | Approve/Dept| Manage/All| - | - | - | Read | Configure |
| **M13 Alumni** | Request/Own| - | - | Manage | Verify | - | - | Read | Audit |
| **M14 Sys Admin** | - | - | - | - | - | - | - | - | Full Access|

---

## 3. Mongoose Modeling Conventions & Data Design Decisions

### Global Schema Rules
1. **Timestamps**: All schemas must enforce `{ timestamps: true }` to maintain `createdAt` and `updatedAt`.
2. **Soft Delete**: Every collection must contain `isDeleted: { type: Boolean, default: false }` and `deletedAt: { type: Date, default: null }`. 
3. **Monetary Values**: Stored as a `Number` in **KOBO** (Integer: Naira × 100) to prevent floating-point precision issues. Schemas must define a virtual getter for Naira.
4. **Repository Pattern**: Never call `Model.find()` or raw operations inside Express controllers. All DB interactions are abstracted through repository modules (e.g., `studentRepository.ts`, `resultRepository.ts`).
5. **No JS Processing for Heavy Calculations**: Aggregations (CGPA, NYSC exports, Senate results summaries) must be processed natively in MongoDB Aggregation Pipelines.

```typescript
// Sample virtual property for monetary values in Mongoose
schema.virtual('amountNaira').get(function() {
  return this.amountKobo / 100;
}).set(function(v) {
  this.amountKobo = Math.round(v * 100);
});
```

### Specific Data Structural Decisions
- **Student Document**: Avoid reference overhead. Guardian info, Next of Kin, and uploaded admission documents are embedded directly. Academic `Programme` is referenced via `ObjectId` to enforce relational mapping.
- **Results Collection**: Not embedded in Student records. Because updates occur frequently by different lecturers during exam computation periods, results are stored in a standalone `results` collection referencing the student, academic session, and course.
- **Payments Collection**: Kept independent. Receipts are structured subdocuments embedded directly within the payment document to guarantee immutability.
- **Senate Prayers**: Kept independent. Senate session votes and file attachments are stored as embedded arrays within the `senate_prayers` collection.
- **E-learning Progress**: Maintained in a separate collection. High-write, fine-grained telemetry (e.g. video watch percentage) would lead to massive document fragmentation if stored in a unified user/student document.
- **Audit Logs**: Stored as a MongoDB Capped Collection limited to `100MB` with a Time-To-Live (TTL) index of 90 days (`expireAfterSeconds: 7776000`).

---

## 4. Functional Modules Specification

### M01 Student Registration & Profile Management
- **Purpose**: Manage the lifecycle of students from registration to graduation.
- **Actors**: `student`, `registrar`, `super_admin`.
- **Functional Requirements**:
  - **FR-M01-001**: Student can complete their biodata, upload a passport photo, and enter guardian details.
  - **FR-M01-002**: Registrar can view, edit, and approve student profile updates.
  - **FR-M01-003**: System must auto-generate a matriculation number upon payment of registration fees using the format: `COELS/{PROGRAMME_CODE}/{YEAR}/{SEQUENCE}`.
- **Business Rules**:
  - **BR-M01-001**: Passport photos must not exceed 2MB and must be in JPEG/PNG format.
  - **BR-M01-002**: The sequence suffix in the matric number must be 3-digit, zero-padded, and incremented atomically.
- **Mongoose Collection (`students`)**:
  ```typescript
  const StudentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    matricNo: { type: String, unique: true, sparse: true, index: true },
    programme: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
    currentLevel: { type: Number, required: true, enum: [100, 200, 300, 400] },
    guardian: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true },
      email: String
    },
    documents: [{
      name: String,
      s3Url: String,
      uploadedAt: Date
    }],
    stateOfOrigin: { type: String, required: true },
    lga: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  
  StudentSchema.index({ stateOfOrigin: 1, lga: 1 });
  ```
- **Integrations**: AWS S3 (profile pictures, scanned certificates).

---

### M02 Online Admission Application (OAA)
- **Purpose**: Allow external applicants to apply for admission, view admission lists, and print offer letters.
- **Actors**: `applicant` (unauthenticated / guest system role), `registrar`, `vc`.
- **Functional Requirements**:
  - **FR-M02-001**: Applicant registers an account, makes payment, and fills out the application form.
  - **FR-M02-002**: HOD and Registrar shortlist candidates based on criteria (O'Level credits, UTME score).
  - **FR-M02-003**: System generates and prints official PDF Admission Letters with QR Verification links.
- **Business Rules**:
  - **BR-M02-001**: Applicants must possess a minimum of 5 O'Level credits, including English and Mathematics.
  - **BR-M02-002**: Admission offers expire exactly 14 days after issue if not accepted.
- **Mongoose Collection (`admission_applications`)**:
  ```typescript
  const AdmissionApplicationSchema = new Schema({
    applicantEmail: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    programmeApplied: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
    utmeScore: Number,
    oLevelGrades: [{
      subject: String,
      grade: String
    }],
    paymentReference: { type: String, required: true },
    status: { type: String, enum: ['draft', 'submitted', 'shortlisted', 'admitted', 'rejected'], default: 'draft' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: Paystack (application fees), Termii (SMS notification of admission lists), AWS SES (offer letter dispatch).

---

### M03 Course Registration
- **Purpose**: Manage curriculum registrations, add/drop windows, and department course allocations.
- **Actors**: `student`, `hod`, `advisor` (lecturer).
- **Functional Requirements**:
  - **FR-M03-001**: HOD publishes courses offered for an academic session.
  - **FR-M03-002**: Student registers courses for the current semester up to maximum credit load limits.
  - **FR-M03-003**: HOD can bulk-register courses for an entire class or cohort.
- **Business Rules**:
  - **BR-M03-001**: Maximum credit units allowed per semester is 24; minimum is 12.
  - **BR-M03-002**: A student cannot register for a course without passing its prerequisite(s).
- **Mongoose Collection (`course_registrations`)**:
  ```typescript
  const CourseRegistrationSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    academicSession: { type: String, required: true }, // e.g., "2025/2026"
    semester: { type: Number, required: true, enum: [1, 2] },
    level: { type: Number, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  
  CourseRegistrationSchema.index({ student: 1, academicSession: 1, semester: 1 }, { unique: true });
  ```
- **Integrations**: None.

---

### M04 Results Computation & CGPA Engine
- **Purpose**: Manage grade entries, calculate grade points, semester GPA, and cumulative CGPA.
- **Actors**: `lecturer`, `hod`, `registrar`, `student`.
- **Functional Requirements**:
  - **FR-M04-001**: Lecturer enters Continuous Assessment (CA) and Exam scores for assigned courses.
  - **FR-M04-002**: System automatically flags grades and computes grade points.
  - **FR-M04-003**: System computes GPA/CGPA dynamically on results publication.
- **Business Rules**:
  - **BR-M04-001**: CA score limit is 0-40. Exam score limit is 0-60. Total score is 100.
  - **BR-M04-002**: Grading is calculated on the 5-point scale (A=5, B=4, C=3, D=2, E=1, F=0).
  - **BR-M04-003**: When a course is retaken and passed, the best grade earned across attempts is used in calculations.
- **Mongoose Collection (`results`)**:
  ```typescript
  const ResultSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    academicSession: { type: String, required: true },
    semester: { type: Number, required: true },
    caScore: { type: Number, min: 0, max: 40, required: true },
    examScore: { type: Number, min: 0, max: 60, required: true },
    totalScore: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'], required: true },
    gradePoint: { type: Number, enum: [0, 1, 2, 3, 4, 5], required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isApprovedByHOD: { type: Boolean, default: false },
    isApprovedBySenate: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  
  ResultSchema.index({ student: 1, course: 1, academicSession: 1 }, { unique: true });
  ```
- **Integrations**: BullMQ (handling background queue calculation for CGPA updates across departments).

---

### M05 Fees Collection & Scratch Cards
- **Purpose**: Process student payment requests online or through physical scratch cards.
- **Actors**: `student`, `bursary`, `super_admin`.
- **Functional Requirements**:
  - **FR-M05-001**: Student generates invoice and pays via Paystack.
  - **FR-M05-002**: Student purchases a scratch card from an designated outlet, enters serial and PIN on the portal to clear their fee.
  - **FR-M05-003**: Bursary uploads scratch card batches and reconciles transaction reports.
- **Business Rules**:
  - **BR-M05-001**: Scratch card PINs must be stored using `bcrypt` hash formats.
  - **BR-M05-002**: A scratch card can only be redeemed once.
  - **BR-M05-003**: To prevent brute forcing, users are locked out from scratch card entry for 30 minutes in Redis after 5 failed attempts.
- **Mongoose Collections (`scratch_cards`, `payments`)**:
  ```typescript
  const ScratchCardSchema = new Schema({
    serialNumber: { type: String, required: true, unique: true, index: true },
    pinHash: { type: String, required: true },
    amountKobo: { type: Number, required: true },
    batchNumber: { type: String, required: true },
    isRedeemed: { type: Boolean, default: false },
    redeemedBy: { type: Schema.Types.ObjectId, ref: 'Student' },
    redeemedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });

  const PaymentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    paymentType: { type: String, enum: ['school_fees', 'hostel_fees', 'admission_fee', 'transcript'], required: true },
    amountKobo: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['paystack', 'scratch_card'], required: true },
    paymentReference: { type: String, unique: true, index: true }, // Paystack ref or Scratch card Serial
    status: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
    receipt: {
      receiptNumber: { type: String, unique: true, sparse: true },
      issuedAt: Date,
      signature: String
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: Paystack API, Termii (SMS payment confirmation), Redis (lockout logs).

---

### M06 Transcript Management
- **Purpose**: Manage the application, printing, electronic transfer, and validation of academic transcripts.
- **Actors**: `student`, `registrar`, `bursary`, `external_verifier`.
- **Functional Requirements**:
  - **FR-M06-001**: Alumni request a transcript, pay, and input recipient details.
  - **FR-M06-002**: Registrar reviews applicant records and generates the transcript PDF.
  - **FR-M06-003**: System prints a high-fidelity PDF with security watermarks, transaction history, and an embedded QR code for electronic authenticity checking.
- **Business Rules**:
  - **BR-M06-001**: Transcripts cannot be requested by students with outstanding fees.
  - **BR-M06-002**: Digital transcripts must be verified only through the secure domain `crms.coels.edu.ng`.
- **Mongoose Collection (`transcript_requests`)**:
  ```typescript
  const TranscriptRequestSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    recipientOrganization: { type: String, required: true },
    recipientAddress: { type: String, required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    verificationToken: { type: String, unique: true, required: true },
    status: { type: String, enum: ['processing', 'dispatched', 'delivered'], default: 'processing' },
    s3PdfUrl: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: AWS S3 (storing generated transcript PDFs), BullMQ (pdf-generation queue).

---

### M07 Staff Portal & Role Assignment
- **Purpose**: Manage lecturer profiles, allocate HOD roles, assign course adviserships, and match academic designations.
- **Actors**: `registrar`, `hod`, `lecturer`, `super_admin`.
- **Functional Requirements**:
  - **FR-M07-001**: Registrar creates profiles for academic and non-academic staff.
  - **FR-M07-002**: Super Admin assigns user roles (HOD, Bursar, Hostel Officer) to user accounts.
  - **FR-M07-003**: Registrar assigns lecturers to courses they will teach for the current semester.
- **Business Rules**:
  - **BR-M07-001**: A user can only be designated as HOD for one department at a time.
  - **BR-M07-002**: Staff profiles must be linked to active institutional emails.
- **Mongoose Collection (`staff`)**:
  ```typescript
  const StaffSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    staffId: { type: String, unique: true, required: true, index: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true }, // e.g., "Senior Lecturer"
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: None.

---

### M08 Hostel Reservation & Allocation
- **Purpose**: Manage campus student accommodation options and processes.
- **Actors**: `student`, `hostel_officer`, `bursary`.
- **Functional Requirements**:
  - **FR-M08-001**: Hostel Officer defines blocks, rooms, and bed counts.
  - **FR-M08-002**: Student checks room availability and registers a booking online.
  - **FR-M08-003**: System auto-allocates beds based on criteria (first-come, level, payment status).
- **Business Rules**:
  - **BR-M08-001**: Student must clear school fees first before requesting hostel space.
  - **BR-M08-002**: System automatically releases reservation within 24 hours if payment fails.
- **Mongoose Collections (`hostels`, `hostel_allocations`)**:
  ```typescript
  const HostelSchema = new Schema({
    name: { type: String, required: true },
    genderType: { type: String, enum: ['male', 'female'], required: true },
    blocks: [{
      blockName: String,
      rooms: [{
        roomNumber: String,
        capacity: Number,
        occupiedBeds: { type: Number, default: 0 }
      }]
    }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });

  const HostelAllocationSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    hostel: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
    roomNumber: { type: String, required: true },
    academicSession: { type: String, required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: Paystack (Hostel fees verification).

---

### M09 Paperless Senate
- **Purpose**: Allow digital submissions of academic senate prayers, review of records, and electronic voting.
- **Actors**: `lecturer`, `hod`, `senate_member`, `vc`, `registrar`.
- **Functional Requirements**:
  - **FR-M09-001**: Lecturer/HOD drafts and submits a "prayer" (result correction, graduation list approval).
  - **FR-M09-002**: Senate Members receive agenda lists, cast digital votes, and comment online.
  - **FR-M09-003**: Registrar publishes minutes and sends notification broadcasts.
- **Business Rules**:
  - **BR-M09-001**: Result corrections must attach official, scanned hard-copy grade sheets.
  - **BR-M09-002**: A prayer is approved when it receives a simple majority of affirmative votes from active senate participants.
- **Mongoose Collection (`senate_prayers`)**:
  ```typescript
  const SenatePrayerSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['result_correction', 'admission_approval', 'graduation_list'], required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    attachments: [String], // S3 URLs
    votes: [{
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      choice: { type: String, enum: ['approve', 'reject', 'abstain'] },
      castAt: Date
    }],
    status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: Termii (SMS notifications for urgent votes), AWS S3, AWS SES.

---

### M10 E-Learning Services
- **Purpose**: Provide study materials, video libraries, and offline capabilities for learners.
- **Actors**: `lecturer`, `student`.
- **Functional Requirements**:
  - **FR-M10-001**: Lecturer uploads notes, assignments, and recorded video lectures.
  - **FR-M10-002**: Student streams video files and reviews materials.
  - **FR-M10-003**: PWA caching enables students to access cached documents and syllabus offline.
- **Business Rules**:
  - **BR-M10-001**: Video stream source links must be signed CloudFront URLs.
  - **BR-M10-002**: Course progress logs are updated after every 5% increment of video progress.
- **Mongoose Collections (`elearning_resources`, `elearning_progress`)**:
  ```typescript
  const ELearningResourceSchema = new Schema({
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'video', 'link'], required: true },
    s3Key: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });

  const ELearningProgressSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    resource: { type: Schema.Types.ObjectId, ref: 'ELearningResource', required: true },
    watchDurationSeconds: { type: Number, default: 0 },
    completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
    lastAccessedAt: Date
  });
  
  ELearningProgressSchema.index({ student: 1, resource: 1 }, { unique: true });
  ```
- **Integrations**: AWS S3 & CloudFront CDN (signed URLs for video playback), Workbox (Service Worker dynamic caching on mobile).

---

### M11 Regulatory Reports (NCCE/NYSC)
- **Purpose**: Produce exportable audits and reports complying with statutory educational criteria.
- **Actors**: `registrar`, `vc`, `super_admin`.
- **Functional Requirements**:
  - **FR-M11-001**: System formats, generates, and exports standard NCCE Enrolment statistics.
  - **FR-M11-002**: System generates the final NYSC Mobilization list containing state data and graduation years.
  - **FR-M11-003**: Registrar exports academic staff ratios matching student course load data.
- **Business Rules**:
  - **BR-M11-001**: The NYSC List must conform exactly to NYSC's format columns: `name`, `matric_no`, `lga`, `state_of_origin`, `programme`, `graduation_year`, `phone`, `photo_url`.
  - **BR-M11-002**: Results must be fully approved by Senate before inclusion in graduation or NYSC lists.
- **Data Query Strategy**: 
  - Raw reports are generated dynamically using MongoDB aggregation pipelines rather than storing computed reports.
- **Integrations**: None.

---

### M12 HRMS & Staff Appraisal
- **Purpose**: Manage records of active employment, leave workflows, and appraisals.
- **Actors**: `lecturer`, `hod`, `registrar`, `super_admin`.
- **Functional Requirements**:
  - **FR-M12-001**: Staff submits a request for leave (sick leave, annual leave).
  - **FR-M12-002**: HOD and Registrar authorize leave requests.
  - **FR-M12-003**: Staff completes self-appraisal parameters; HOD submits official scoring.
- **Business Rules**:
  - **BR-M12-001**: Annual leave cannot exceed the staff member's remaining allocation balance.
  - **BR-M12-002**: Staff cannot initiate an appraisal cycle outside defined administrative periods.
- **Mongoose Collections (`leave_requests`, `staff_appraisals`)**:
  ```typescript
  const LeaveRequestSchema = new Schema({
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    type: { type: String, enum: ['annual', 'sick', 'casual', 'maternity'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved_by_hod', 'approved_by_registrar', 'rejected'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });

  const StaffAppraisalSchema = new Schema({
    staff: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
    academicSession: { type: String, required: true },
    selfScore: { type: Number, min: 0, max: 100 },
    hodScore: { type: Number, min: 0, max: 100 },
    hodComments: String,
    status: { type: String, enum: ['draft', 'submitted_by_staff', 'completed'], default: 'draft' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: AWS SES (notification of leave and appraisal submissions).

---

### M13 Alumni Management
- **Purpose**: Track alumni details, request graduation letters, and handle third-party verifications.
- **Actors**: `alumni`, `registrar`, `external_verifier`.
- **Functional Requirements**:
  - **FR-M13-001**: Alumni registers or updates their employment profile.
  - **FR-M13-002**: Alumni initiates requests for "Graduation Attestation Letters".
  - **FR-M13-003**: System processes third-party background checks automatically via QR token verification.
- **Business Rules**:
  - **BR-M13-001**: Attestation letters require previous fees to be marked as completely settled.
- **Mongoose Collection (`alumni_profiles`)**:
  ```typescript
  const AlumniProfileSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true, index: true },
    graduationYear: { type: Number, required: true },
    currentCompany: String,
    currentDesignation: String,
    attestationLetterPrinted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });
  ```
- **Integrations**: AWS SES, Paystack (verification charges).

---

### M14 System Administration
- **Purpose**: Centralize configuration management, security controls, and audit trails.
- **Actors**: `super_admin`.
- **Functional Requirements**:
  - **FR-M14-001**: Admin modifies system variables (academic session state, add/drop dates).
  - **FR-M14-002**: Admin locks/unlocks system user profiles.
  - **FR-M14-003**: Admin searches the immutable system audit trail for security logs.
- **Business Rules**:
  - **BR-M14-001**: System configurations must store change records in the audit trail.
  - **BR-M14-002**: Audit trail logs must be write-once, read-only.
- **Mongoose Collections (`system_configs`, `audit_logs`)**:
  ```typescript
  const SystemConfigSchema = new Schema({
    currentAcademicSession: { type: String, default: "2025/2026" },
    currentSemester: { type: Number, default: 1, enum: [1, 2] },
    isAdmissionPortalOpen: { type: Boolean, default: false },
    isCourseRegistrationPortalOpen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
  }, { timestamps: true });

  // MongoDB capped collection design for write-heavy, high-speed security records
  const AuditLogSchema = new Schema({
    action: { type: String, required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ipAddress: String,
    userAgent: String,
    details: { type: Schema.Types.Mixed }, // JSON payload
    timestamp: { type: Date, default: Date.now }
  }, { 
    capped: { size: 104857600, max: 1000000 }, // Capped at 100MB
    timestamps: false 
  });
  
  AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // TTL of 90 days
  ```
- **Integrations**: None.

---

## 5. Nigerian Academic Context & CGPA Specs

### Grading System
The grading engine uses a standard 5-point scale system adhering to the directives of the National Commission for Colleges of Education (NCCE):

| Score Range | Grade | Grade Points |
| :---: | :---: | :---: |
| 70 - 100 | A | 5 |
| 60 - 69 | B | 4 |
| 50 - 59 | C | 3 |
| 45 - 49 | D | 2 |
| 40 - 44 | E | 1 |
| 0 - 39 | F | 0 |

### CGPA Computation Logic
- **Grade Point Average (GPA)** is computed for a single semester:
  $$\text{GPA} = \frac{\sum (\text{Grade Point} \times \text{Credit Units})}{\sum \text{Credit Units}}$$
- **Cumulative Grade Point Average (CGPA)** sums all credit units and points computed from matriculation to date:
  $$\text{CGPA} = \frac{\sum_{\text{all semesters}} (\text{Grade Point} \times \text{Credit Units})}{\sum_{\text{all semesters}} \text{Credit Units}}$$
- **Retakes**: When a student fails a course (Grade F) and subsequently retakes the course, the best grade earned across attempts is used in calculations, and the failed credits are excluded from the denominator in final CGPA computation (only the passed course credit counts).

---

## 6. Non-Functional & Security Requirements

### Performance
- **Network Optimization**: Minimize React production build size, enable gzip/Brotli compression, and use S3/CloudFront caching for images and video resources. The application shell must load in `< 2 seconds` on a typical 3G connection.
- **Concurrency**: The backend must handle up to `500 simultaneous users` during peak periods without response degradation, achieved by employing Redis query-caching for course lists and session allocations.

### Availability & Disaster Recovery
- **Uptime target**: 99.5% availability, verified by automated health monitoring alerts.
- **Backup**: Automate database backups via daily Cron processes calling `mongodump`, exporting encrypted dumps directly to offsite Backblaze B2 storage with a 30-day retention loop.

### Security
- **Authentication**: JWT access tokens stored in HTTPOnly, secure, SameSite cookies.
- **Two-Factor Authentication (2FA)**: Required for all administrators, HODs, and bursary staff. 
- **OWASP Compliance**: Secure applications against common security exploits (XSS, SQL Injection, NoSQL Injection, CSRF, and broken access controls).
- **Data Protection**: Sensitive information like PINs, recovery hashes, and user login tokens must be stored strictly as bcrypt hashes.
