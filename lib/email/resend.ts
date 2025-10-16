import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "EKSU NYSC <noreply@eksu.edu.ng>",
      to,
      subject,
      html,
    })

    if (error) {
      console.error("[v0] Email send error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("[v0] Email send error:", error)
    throw error
  }
}
