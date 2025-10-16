import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface InviteEmailProps {
  to: string
  name: string
  token: string
  hodName: string
  departmentName: string
}

export async function sendInviteEmail({ to, name, token, hodName, departmentName }: InviteEmailProps) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register/${token}`

  try {
    await resend.emails.send({
      from: "EKSU NYSC Clearance <noreply@eksu.edu.ng>",
      to,
      subject: "EKSU NYSC Clearance - Account Invitation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006400;">EKSU NYSC Clearance System</h2>
          <p>Dear ${name},</p>
          <p>Your HOD, <strong>${hodName}</strong> from the <strong>${departmentName}</strong> department has created an account for you in the EKSU NYSC Clearance System.</p>
          <p>To activate your account and set your password, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Password</a>
          </div>
          <p>This link will expire in 7 days.</p>
          <p>If you did not expect this invitation, please contact your department.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Ekiti State University, Ado-Ekiti</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send invite email:", error)
    throw error
  }
}

interface SubmissionConfirmationProps {
  to: string
  name: string
  submissionId: string
}

export async function sendSubmissionConfirmation({ to, name, submissionId }: SubmissionConfirmationProps) {
  try {
    await resend.emails.send({
      from: "EKSU NYSC Clearance <noreply@eksu.edu.ng>",
      to,
      subject: "EKSU NYSC Clearance - Submission Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006400;">Submission Received</h2>
          <p>Dear ${name},</p>
          <p>Your NYSC mobilization documents have been successfully submitted.</p>
          <p><strong>Submission ID:</strong> ${submissionId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p>Your submission is now pending review by your Head of Department.</p>
          <p>You will receive an email notification once your submission has been reviewed.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Ekiti State University, Ado-Ekiti</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send submission confirmation:", error)
  }
}

interface HODDecisionEmailProps {
  to: string
  name: string
  approved: boolean
  remarks?: string
  hodName: string
}

export async function sendHODDecisionEmail({ to, name, approved, remarks, hodName }: HODDecisionEmailProps) {
  try {
    await resend.emails.send({
      from: "EKSU NYSC Clearance <noreply@eksu.edu.ng>",
      to,
      subject: `EKSU NYSC Clearance - Submission ${approved ? "Approved" : "Rejected"} by HOD`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${approved ? "#006400" : "#dc2626"};">
            Submission ${approved ? "Approved" : "Rejected"}
          </h2>
          <p>Dear ${name},</p>
          <p>Your HOD, <strong>${hodName}</strong>, has reviewed your NYSC clearance submission.</p>
          <div style="background-color: ${approved ? "#f0fdf4" : "#fef2f2"}; border-left: 4px solid ${approved ? "#006400" : "#dc2626"}; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: ${approved ? "#006400" : "#dc2626"};">
              Status: ${approved ? "APPROVED" : "REJECTED"}
            </p>
          </div>
          ${
            approved
              ? "<p>Your submission has been approved by your HOD and is now awaiting final approval from the Admissions Office.</p>"
              : "<p>Your submission has been rejected. Please review the remarks below and resubmit if necessary.</p>"
          }
          ${
            remarks
              ? `
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Remarks:</p>
              <p style="margin: 0;">${remarks}</p>
            </div>
          `
              : ""
          }
          <p>You can log in to your dashboard to view more details.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/dashboard" style="background-color: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Ekiti State University, Ado-Ekiti</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send HOD decision email:", error)
  }
}

interface AdmissionsFinalDecisionEmailProps {
  to: string
  name: string
  approved: boolean
  remarks?: string
}

export async function sendAdmissionsFinalDecisionEmail({
  to,
  name,
  approved,
  remarks,
}: AdmissionsFinalDecisionEmailProps) {
  try {
    await resend.emails.send({
      from: "EKSU NYSC Clearance <noreply@eksu.edu.ng>",
      to,
      subject: `EKSU NYSC Clearance - ${approved ? "CLEARED" : "Final Rejection"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${approved ? "#006400" : "#dc2626"};">
            ${approved ? "Congratulations! You Are Cleared" : "Final Decision: Rejected"}
          </h2>
          <p>Dear ${name},</p>
          <p>The Admissions Office has completed the final review of your NYSC clearance submission.</p>
          <div style="background-color: ${approved ? "#f0fdf4" : "#fef2f2"}; border-left: 4px solid ${approved ? "#006400" : "#dc2626"}; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: ${approved ? "#006400" : "#dc2626"}; font-size: 18px;">
              ${approved ? "✓ CLEARED FOR NYSC MOBILIZATION" : "✗ REJECTED"}
            </p>
          </div>
          ${
            approved
              ? "<p>Your NYSC clearance has been approved. You are now cleared for NYSC mobilization.</p><p>Please proceed to collect your clearance certificate from the Admissions Office.</p>"
              : "<p>Your submission has been rejected by the Admissions Office. Please review the remarks below.</p>"
          }
          ${
            remarks
              ? `
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Remarks:</p>
              <p style="margin: 0;">${remarks}</p>
            </div>
          `
              : ""
          }
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/dashboard" style="background-color: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Ekiti State University, Ado-Ekiti</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send admissions final decision email:", error)
  }
}

interface ClearanceReadyEmailProps {
  to: string
  name: string
  clearanceId: string
  clearanceUrl: string
}

export async function sendClearanceReadyEmail({ to, name, clearanceId, clearanceUrl }: ClearanceReadyEmailProps) {
  try {
    await resend.emails.send({
      from: "EKSU NYSC Clearance <noreply@eksu.edu.ng>",
      to,
      subject: "Your EKSU NYSC Clearance Form Is Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006400;">🎉 Your NYSC Clearance Form Is Ready!</h2>
          <p>Dear ${name},</p>
          <p><strong>Congratulations!</strong> Your NYSC Mobilization Clearance Form has been approved and is now available for download.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #006400; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #006400;">
              Clearance ID: ${clearanceId}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
              Generated on: ${new Date().toLocaleDateString("en-GB")}
            </p>
          </div>

          <p>You can view or download your clearance form using the buttons below:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/dashboard" style="background-color: #006400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">View Dashboard</a>
            <a href="${clearanceUrl}" target="_blank" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Download PDF</a>
          </div>

          <div style="background-color: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">📋 Important Notes:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
              <li>Keep your Clearance ID safe for reference</li>
              <li>Download and print your clearance form</li>
              <li>Present this form during NYSC registration</li>
              <li>Contact the Admissions Office if you notice any errors</li>
            </ul>
          </div>

          <p>If you have any questions, please contact the Admissions Office.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Ekiti State University, Ado-Ekiti<br>
            This is an automated email from the EKSU NYSC Clearance System
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("[v0] Failed to send clearance ready email:", error)
  }
}
