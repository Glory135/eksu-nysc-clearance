# EKSU NYSC Clearance System

A digital web application for Ekiti State University (EKSU) that automates NYSC mobilization clearance for graduates.

## Features

- **Role-based Access Control**: Student, HOD, Admissions Officer, Super Admin
- **Super Admin Portal**: Manage departments, HODs, and admissions officers
- **HOD Student Management**: Upload students individually or via CSV
- **Invite Flow**: Secure email invitations with password setup
- **Document Upload**: Students upload passport photos and NYSC forms
- **Multi-stage Approval**: HOD review → Admissions Officer final approval
- **Email Notifications**: Automated emails at each stage via Resend
- **File Storage**: Secure document storage via Vercel Blob
- **PDF Generation**: Auto-generates official NYSC clearance forms after final approval
- **Profile Management**: Students complete their profile for clearance form generation

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- MongoDB with Mongoose
- NextAuth v5 (Credentials provider)
- tRPC + TanStack Query
- Tailwind CSS v4 + ShadCN UI
- Vercel Blob (file uploads)
- Resend (transactional emails)
- @react-pdf/renderer (PDF generation)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Resend account
- Vercel account (for Blob storage)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Copy `.env.example` to `.env.local` and fill in your credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for required environment variables.

### Required Variables

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth sessions (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_APP_URL` - Public app URL for email links
- `RESEND_API_KEY` - Resend API key for emails
- `EMAIL_FROM` - Email sender address (e.g., "EKSU NYSC <noreply@eksu.edu.ng>")
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token (auto-configured in Vercel)

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── register/          # Registration pages
│   ├── student/           # Student portal
│   ├── hod/               # HOD portal
│   ├── admissions/        # Admissions portal
│   └── admin/             # Super Admin portal
├── lib/
│   ├── db/
│   │   ├── models/        # Mongoose models
│   │   └── mongoose.ts    # Database connection
│   ├── trpc/
│   │   ├── routers/       # tRPC routers
│   │   └── server.ts      # tRPC server setup
│   ├── auth/              # NextAuth configuration
│   └── email/             # Email utilities
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── student/          # Student components
│   ├── hod/              # HOD components
│   ├── admissions/       # Admissions components
│   ├── admin/            # Super Admin components
│   ├── layout/           # Layout components
│   └── ui/               # ShadCN UI components
└── types/                # TypeScript type definitions
\`\`\`

## Roles & Workflows

### Super Admin
- Creates and manages departments
- Creates HOD accounts and assigns them to departments
- Creates admissions officer accounts with secure admission codes
- Views system-wide statistics
- Monitors overall clearance progress
- Manages all user accounts

### HOD (Head of Department)
- Receives invite email from Super Admin
- Sets password via secure link
- Uploads student accounts (single/CSV)
- Sends invite emails automatically to students
- Reviews department submissions
- Approves or rejects with remarks
- Manages student account status
- Email notifications sent to students on decisions

### Admissions Officer
- Receives invite email from Super Admin with unique admission code
- Sets password via secure link
- Logs in using email, password, and admission code
- Reviews HOD-approved submissions
- Provides final approval or rejection
- Views all submissions across departments
- Email notifications sent to students on final decisions
- **Auto-generates official NYSC clearance PDF upon final approval**

### Student
- Receives invite email from HOD
- Sets password via secure link
- **Completes profile with personal information** (phone, sex, DOB, marital status, state of origin, LGA, graduation date, course of study)
- Uploads passport photo and NYSC form
- Views submission status and remarks
- Receives email notifications at each stage
- **Downloads official clearance form after final approval**

## Email Notifications

The system sends automated emails for:
- **Admin Invites**: When Super Admin creates HOD or Admissions Officer accounts
- **Student Invites**: When HOD creates a student account
- **Submission Confirmation**: When student uploads documents
- **HOD Decision**: When HOD approves or rejects
- **Final Decision**: When Admissions Officer provides final clearance
- **Clearance Ready**: When official clearance PDF is generated and ready for download

All emails are sent via Resend and include:
- Professional EKSU branding (green #006400)
- Clear status indicators
- Relevant remarks and feedback
- Links to dashboard

## NYSC Clearance Form Generation

### How It Works

1. **Student Profile Completion**: Students fill in their personal details (phone, sex, date of birth, marital status, state of origin, LGA, graduation date, course of study)
2. **Document Upload**: Students upload passport photo and NYSC form
3. **HOD Approval**: HOD reviews and approves the submission
4. **Final Approval**: Admissions Officer provides final clearance
5. **Auto-Generation**: System automatically generates an official NYSC Mobilization Form PDF
6. **Email Notification**: Student receives email with clearance ID and download link
7. **Download**: Student can view and download the PDF from their dashboard

### Clearance Form Features

- **Official Format**: Replicates the physical EKSU NYSC Mobilization Form
- **Auto-filled Data**: Populates all student information from the database
- **Verification Sections**: Includes HOD and Admissions Officer approval details
- **Unique Clearance ID**: Format: `EKSU-NYSC-YYYY-XXXXXX`
- **Watermark**: "EKSU NYSC Clearance System – Auto-Generated"
- **Tamper-proof**: Read-only PDF with verification notice
- **Secure Storage**: Stored in Vercel Blob with public access URLs

### Clearance Form Contents

The generated PDF includes:
- EKSU header and logo
- Student passport photograph
- Personal information (name, matric number, email, phone)
- Academic details (faculty, department, course of study, graduation date)
- Demographic information (sex, DOB, marital status, state of origin, LGA)
- HOD verification with name and approval date
- Admissions Office verification with name and approval date
- Unique clearance ID and generation timestamp

## Initial Setup

### Creating the First Super Admin

To create the first super admin account, you'll need to manually insert a user into MongoDB:

\`\`\`javascript
// Connect to your MongoDB database and run:
db.users.insertOne({
  name: "Admin Name",
  email: "admin@eksu.edu.ng",
  password: "$2a$10$...", // Hash your password with bcrypt
  role: "super_admin",
  accountStatus: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
\`\`\`

Or use this Node.js script:

\`\`\`javascript
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function createSuperAdmin() {
  await mongoose.connect('your-mongodb-uri');
  
  const hashedPassword = await bcrypt.hash('your-password', 10);
  
  await mongoose.connection.collection('users').insertOne({
    name: 'Super Admin',
    email: 'admin@eksu.edu.ng',
    password: hashedPassword,
    role: 'super_admin',
    accountStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Super admin created!');
  process.exit(0);
}

createSuperAdmin();
\`\`\`

After creating the super admin, you can:
1. Login at `/login`
2. Create departments
3. Create and assign HODs
4. Create admissions officers
5. HODs can then start uploading students

## CSV Upload Format

When uploading students via CSV, use this format:

\`\`\`csv
name,email,matricNumber,phone,sex,dateOfBirth,maritalStatus,stateOfOrigin,lga,graduationDate,courseOfStudy
John Doe,john@example.com,CSC/2019/001,08012345678,male,2000-01-15,single,Ekiti,Ado-Ekiti,2024-07,Computer Science
Jane Smith,jane@example.com,CSC/2019/002,08087654321,female,1999-05-20,single,Ekiti,Ikere,2024-07,Computer Science
\`\`\`

**Note**: All fields are optional except `name`, `email`, and `matricNumber`. Students can complete missing information in their profile.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The Vercel Blob integration is automatically configured when deployed to Vercel.

### MongoDB Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to the whitelist (or allow all for development)
4. Create a database user
5. Get your connection string and add it to `MONGODB_URI`

### Resend Setup

1. Create a Resend account at https://resend.com
2. Verify your domain (or use the test domain for development)
3. Create an API key
4. Add it to `RESEND_API_KEY`

## License

Proprietary - Ekiti State University
