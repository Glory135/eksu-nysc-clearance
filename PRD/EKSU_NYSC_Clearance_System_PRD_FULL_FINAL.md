# 🧾 EKSU NYSC Clearance System – Product Requirements Document (FINAL)

## 1. Project Overview
The **EKSU NYSC Clearance System** is a digital platform for **Ekiti State University (EKSU)** to manage NYSC mobilization clearance for graduates.  
It replaces the manual process of printing and physical verification by automating form submission, departmental approval, and final clearance verification.

---

## 2. Project Objectives
- Digitize the NYSC clearance workflow for graduates.
- Allow HODs to upload and manage graduates (single or CSV upload).
- Simplify clearance validation and approval tracking.
- Ensure photo authenticity and compliance for passport uploads.
- Generate a final official EKSU clearance form after approval.
- Secure access with unique code verification for Admissions Officer.
- Provide automated notifications and downloadable digital clearance documents.

---

## 3. User Roles & Permissions

### 🧑‍🎓 Student (Graduate)
- Invited by HOD via email.
- Sets password through a secure invite link.
- Logs in to upload passport and NYSC Mobilization Form.
- Must follow strict passport upload validation rules.
- Can view clearance progress, remarks, and final compiled clearance form.
- Receives all updates via email notifications.

### 🧑‍🏫 Head of Department (HOD)
- One per department.
- Uploads student records (single or CSV).
- Sends invite emails to students for onboarding.
- Reviews student submissions and approves or rejects them with remarks.
- Can resend invites or manage account statuses (activate/suspend).

### 🧑‍💼 Admissions Officer
- Only one active officer in the system at any time.
- Requires a **unique access code** to log in and access the clearance dashboard.
- Reviews only HOD-approved submissions.
- Grants final approval or rejection with remarks.
- Triggers generation of final compiled clearance document upon final approval.
- Cannot be duplicated or replaced without deactivation by a super admin.

### 🧑‍💻 Super Admin (Optional)
- Oversees system management.
- Assigns Admissions Officer and resets unique code if necessary.
- Manages departments and system data.

---

## 4. Account Lifecycle
| Status | Description |
|--------|--------------|
| `invited` | Student created by HOD but hasn’t set password yet. |
| `pending` | Student activated but hasn’t uploaded documents. |
| `active` | Student uploaded required documents or cleared for review. |
| `suspended` | Disabled by HOD for irregularities. |
| `inactive` | Account archived after clearance completion. |

---

## 5. Passport Upload Validation

### Rules:
1. Background must be **plain white**.  
2. Student must be **fully clothed**.  
3. The **full face** must be visible and centered.  
4. Only **one person** should appear.  
5. Orientation must be **portrait**.  
6. File format: **JPEG or PNG**, ≤ 5 MB.  

### Behavior:
- System automatically checks every upload for explicit or invalid content.
- Rejects and deletes invalid images before saving.
- Displays a user-friendly error message explaining what’s wrong.
- Shows sample acceptable passport image and short guidelines above upload area.
- Logs rejected uploads with reason and timestamp for admin review.

---

## 6. Admissions Officer Unique Code Verification

- Each Admissions Officer has a **unique access code** (e.g., “EKSU-AO-5HY92Z”).  
- Only one officer can be active at a time.  
- During login, the officer must provide:
  - Email
  - Password
  - Admission Code
- If the code is invalid or inactive, login is denied.  
- The code is required for access to `/admissions/dashboard`.  
- The system provides an API endpoint to reset or generate new codes.
- New codes are sent via email with subject: **“Your EKSU Admissions Officer Access Code”**.

---

## 7. Clearance Workflow

### Student Upload
1. Student provides the following information:
  - Passport photo (validated)
  - NYSC Mobilization Form fields (structured/manual entry) — canonical flow
  - Optional: NYSC Mobilization Form (PDF or image) — retained for backward compatibility and legacy records
2. Data and/or files are stored securely.
3. Form record created with status = `pending`. The record includes a `submissionType` field indicating whether the submission was provided as `manual` (structured fields) or `upload` (file-based), and when `manual` a `formData` object contains the structured values.
4. Email confirmation sent to student.

### HOD Review
1. HOD reviews submissions from their department.
2. Can approve (`hod_approved`) or reject (`rejected`) with remarks.
3. Approval triggers email to student and forwards to Admissions Officer.

### Admissions Review
1. Admissions Officer reviews HOD-approved forms.
2. Approves (`admissions_approved`) or rejects with remarks.
3. On approval:
   - The system automatically generates the **Final Compiled Clearance Form**.
   - Student receives an email with a link to view/download it.

---

## 8. Final Compiled Clearance Form

### Trigger:
- Automatically generated when `nysc_forms.status = "admissions_approved"`.

### Layout:
- Based on the **official EKSU NYSC Mobilization Form** (uploaded template).
- Includes:
  - EKSU logo and header (“APPLICATION FORM FOR NATIONAL YOUTH SERVICE MOBILIZATION”)
  - Student details (name, matric number, department, course, DOB, contact info, etc.)
  - Passport photo (top-right corner)
  - HOD verification section with name, signature, and date
  - Admissions verification section with name, signature, date
  - Unique Clearance ID (e.g., EKSU-NYSC-2025-XXXX)
  - Watermark: “EKSU NYSC Clearance System – Auto Generated”
  - Footer: “Generated by EKSU NYSC Clearance System”

### Document Outputs:
- **Preview page:** `/clearance/[studentId]`
- **Downloadable PDF:** `/api/clearance/pdf/[studentId]`
- **Share link:** Secure, time-limited signed URL (optional)
- PDF stored and linked in database (`compiledUrl`).

### Notifications:
- Email to student:
  - Subject: *“Your EKSU NYSC Clearance Form Is Ready”*
  - Includes view/download link and clearance ID.

---

## 9. Database Schema (Core Collections)

### users
```ts
{
  name: string,
  email: string,
  matricNumber: string,
  password: string | null,
  role: 'student' | 'hod' | 'admissions_officer' | 'super_admin',
  department: ObjectId,
  accountStatus: 'invited' | 'pending' | 'active' | 'suspended' | 'inactive',
  admissionCode?: string | null,
  isActiveOfficer?: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### departments
```ts
{
  name: string,
  hodUserId: ObjectId
}
```

### nysc_forms
```ts
{
  studentId: ObjectId,
  passportUrl: string,
  formUrl: string,
  status: 'pending' | 'hod_approved' | 'admissions_approved' | 'rejected',
  remarks: string,
  history: [
    { by: ObjectId, role: string, action: string, remarks?: string, at: Date }
  ],
  compiledUrl: string | null,
  clearanceId: string | null,
  clearanceGeneratedAt: Date | null,
  updatedBy: ObjectId,
  updatedAt: Date
}
```

---

## 10. tRPC Procedures
- `hod.uploadStudents` — create accounts and send invites.  
- `auth.setPasswordFromInvite` — activate student account.  
- `student.submitForm` — submit passport + NYSC form.  
- `hod.getDepartmentForms` — list department submissions.  
- `hod.approveForm` / `hod.rejectForm` — decision & remarks.  
- `admissions.getApprovedForms` — view HOD-approved records.  
- `admissions.finalizeApproval` — approve/reject and trigger clearance generation.  
- `clearance.generateFinalForm` — create compiled clearance document.  
- `hod.manageStudentStatus` — suspend/reactivate students.  
- `admissions.resetCode` — deactivate old officer and issue new code.

---

## 11. Emails (Automated)
| Trigger | Recipient | Subject | Purpose |
|----------|------------|----------|----------|
| HOD creates student | Student | “Set Up Your EKSU NYSC Account” | Invite with password setup link. |
| Student submits form | Student | “Your Submission Has Been Received” | Confirms upload success. |
| HOD approves/rejects | Student | “Department Review Update” | Notifies decision. |
| Admissions approves/rejects | Student | “Final Clearance Decision” | Notifies final outcome. |
| Clearance generated | Student | “Your EKSU NYSC Clearance Form Is Ready” | Sends download link. |
| Admissions code reset | Admissions Officer | “Your EKSU Admissions Officer Access Code” | Sends new login code. |

---

## 12. Security & Validation
- All uploads and generated documents verified and stored securely.
- File validation for type, size, and content.
- One active admissions officer at a time.
- Role-based access for all endpoints.
- Clearance documents are read-only and tamper-proof.
- Optional watermark or QR for verification.

---

## 13. Success Criteria
- Graduates onboarded and verified smoothly by HODs.
- Proper passport photo enforcement prevents invalid uploads.
- Admissions Officer verified securely by unique code.
- Automated clearance form generated and downloadable.
- All roles receive email notifications for each stage.
- System remains responsive, secure, and accessible on mobile.

---

## 14. Deliverables
- Frontend dashboards for Student, HOD, and Admissions Officer.
- Automated email notification system.
- Final compiled clearance form feature.
- Intelligent passport upload validation.
- Unique admissions officer access code flow.
- Fully functional backend APIs and database structure.
- Ready-to-deploy build for Vercel.

---

## 15. Notes for Future Enhancements
- Add QR code verification on generated clearance PDF.
- Add analytics dashboard for admins.
- Multi-level approval logs and audit trail.
- Export and reporting tools.
