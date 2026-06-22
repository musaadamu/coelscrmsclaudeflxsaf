# COELS CRMS User Acceptance Testing (UAT) Plan

This document outlines 40 strict UAT scenarios designed to validate the end-to-end functionality of all 13 modules from the perspective of each specific role within the institution.

## Format
`ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail`

---

### Registry Staff (10 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| R01 | Registry | Core | Logged in as Registrar | 1. Navigate to Sessions. 2. Create "2024/2025" session. 3. Open First Semester. | Session active, First Semester set as Current. | [ ] | [ ] |
| R02 | Registry | Admission | Session created | 1. Navigate to Admissions. 2. Open NCE cycle for 2024/2025. | Cycle visible to public applicants. | [ ] | [ ] |
| R03 | Registry | Admission | Applicants exist | 1. Select 3 applicants. 2. Click Bulk Admit. | Status changes to ADMITTED, emails sent. | [ ] | [ ] |
| R04 | Registry | Students | Logged in as Registrar | 1. Click Add Student. 2. Fill form manually. 3. Submit. | Student record created with unique Matric No. | [ ] | [ ] |
| R05 | Registry | Core | CSV file ready | 1. Go to Admin Import. 2. Upload Students CSV. 3. Dry-run. | Dry-run shows valid rows. DB unchanged. | [ ] | [ ] |
| R06 | Registry | Results | HOD approved results | 1. Go to Results. 2. Select Semester. 3. Click Publish. | Results published, CGPA visible to students. | [ ] | [ ] |
| R07 | Registry | Transcripts | Pending requests | 1. View request. 2. Click Approve & Dispatch. | Status DISPATCHED, PDF sent to destination. | [ ] | [ ] |
| R08 | Registry | Senate | Logged in as Registrar | 1. Create Senate Meeting. 2. Set deadline to tomorrow. | Meeting scheduled, notifications sent to Senate. | [ ] | [ ] |
| R09 | Registry | Senate | Meeting finished | 1. Click Conclude Meeting. 2. Download Minutes. | Status CONCLUDED, PDF minutes downloaded. | [ ] | [ ] |
| R10 | Registry | Reports | Logged in as Registrar | 1. Go to Reports. 2. Generate NCCE Enrolment CSV. | CSV downloaded with correct headers. | [ ] | [ ] |

---

### Bursary Officer (8 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| B01 | Bursary | Fees | Logged in as Bursary | 1. Add Fee Structure. 2. Select NCE 100 Level. 3. Save. | Fee structure active for specified level. | [ ] | [ ] |
| B02 | Bursary | Payments | Payment exists | 1. Search Paystack Ref. 2. Click Verify. | Payment status PAID, receipt generated. | [ ] | [ ] |
| B03 | Bursary | Payments | Logged in as Bursary | 1. Go to Scratch Cards. 2. Generate 50 cards of N50k. | 50 cards created, CSV downloaded. | [ ] | [ ] |
| B04 | Bursary | Payments | Used card exists | 1. Search card serial. 2. View details. | Shows card USED BY [Student Name]. | [ ] | [ ] |
| B05 | Bursary | Fees | Pending fee | 1. Select Student Fee. 2. Click Waive. 3. Enter reason. | Status WAIVED, amount due = 0. | [ ] | [ ] |
| B06 | Bursary | Reports | Logged in as Bursary | 1. Go to Reports. 2. Download Payment Summary. | CSV/PDF downloaded containing revenue. | [ ] | [ ] |
| B07 | Bursary | Fees | Students enrolled | 1. Filter Fees by NCE 100 Level & UNPAID. | List shows all owing students. | [ ] | [ ] |
| B08 | Bursary | Payments | Payment PAID | 1. View Payment. 2. Click Reprint Receipt. | Receipt PDF downloaded. | [ ] | [ ] |

---

### Lecturer (6 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| L01 | Lecturer | Core | Courses assigned | 1. Navigate to My Courses. | List of assigned courses displayed. | [ ] | [ ] |
| L02 | Lecturer | Results | Students enrolled | 1. Select Course. 2. Enter CA/Exam for 30 students. | Scores saved as DRAFT. | [ ] | [ ] |
| L03 | Lecturer | Results | CSV ready | 1. Upload scores via CSV. | Scores parsed and saved as DRAFT. | [ ] | [ ] |
| L04 | Lecturer | Results | Scores DRAFT | 1. Click Submit to HOD. | Status SUBMITTED, readonly for Lecturer. | [ ] | [ ] |
| L05 | Lecturer | E-Learning| Course active | 1. Go to E-Learning. 2. Upload PDF. 3. Set Offline=True. | Resource active, pre-fetched by Workbox. | [ ] | [ ] |
| L06 | Lecturer | E-Learning| Resource viewed | 1. View Resource Progress. | Shows list of students who viewed it. | [ ] | [ ] |

---

### HOD (5 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| H01 | HOD | Results | Scores SUBMITTED | 1. View submitted course. 2. Click Approve. | Status APPROVED. | [ ] | [ ] |
| H02 | HOD | Results | Scores SUBMITTED | 1. View submitted course. 2. Click Reject. | Status DRAFT, Lecturer notified. | [ ] | [ ] |
| H03 | HOD | Results | Results PUBLISHED | 1. Go to Dept Results. 2. View student CGPA. | CGPA visible and calculated correctly. | [ ] | [ ] |
| H04 | HOD | Senate | Meeting active | 1. Go to Senate. 2. Submit Prayer + Attachment. | Prayer SUBMITTED for review. | [ ] | [ ] |
| H05 | HOD | HRMS | Staff applied leave| 1. View Pending Leaves. 2. Approve leave. | Leave APPROVED, staff notified. | [ ] | [ ] |

---

### Hostel Officer (4 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| HO01 | Hostel | Hostels | Logged in as HO | 1. Add Hostel (Male). 2. Add 20 rooms (4 beds each). | Hostel created with 80 bedspaces. | [ ] | [ ] |
| HO02 | Hostel | Hostels | Hostels exist | 1. Set eligibility (Level 100). | Only 100 level students can book. | [ ] | [ ] |
| HO03 | Hostel | Hostels | Student booked | 1. View Pending Allocations. 2. Click Confirm. | Allocation CONFIRMED, room capacity drops. | [ ] | [ ] |
| HO04 | Hostel | Reports | Allocations exist | 1. Download Hostel Occupancy Report. | CSV generated showing bed spaces. | [ ] | [ ] |

---

### VC/Provost (4 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| V01 | VC | Senate | Results PUBLISHED | 1. View Senate Result Sheet. 2. Click Approve. | Sheet digitally signed/approved. | [ ] | [ ] |
| V02 | VC | Senate | Prayer voted | 1. Open Prayer. 2. Click Decide (APPROVED). | Prayer APPROVED, Registrar notified. | [ ] | [ ] |
| V03 | VC | Core | Logged in as VC | 1. View Dashboard. | Global enrolment stats/charts visible. | [ ] | [ ] |
| V04 | VC | Reports | Logged in as VC | 1. Export NYSC List. | CSV downloaded with correct columns. | [ ] | [ ] |

---

### Student (3 Scenarios)
| ID | Actor | Module | Preconditions | Steps | Expected Result | Pass | Fail |
|---|---|---|---|---|---|---|---|
| S01 | Student | Core | Admitted student | 1. Login. 2. Complete Profile. 3. Pay fee via Paystack. | Fee PAID, courses registered successfully. | [ ] | [ ] |
| S02 | Student | Payments | Fee UNPAID | 1. Click Pay. 2. Select Scratch Card. 3. Enter PIN. | Fee PAID, card marked used. | [ ] | [ ] |
| S03 | Student | Transcripts | Fees cleared | 1. Request transcript. 2. Wait for approval. 3. Download. | PDF downloaded with valid verify QR code. | [ ] | [ ] |
