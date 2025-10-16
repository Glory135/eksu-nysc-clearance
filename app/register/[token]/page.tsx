import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { appRouter } from "@/lib/trpc/routers/_app"
import { createTRPCContext } from "@/lib/trpc/server"

async function verifyToken(token: string) {
  try {
    const ctx = await createTRPCContext()
    const caller = appRouter.createCaller(ctx)
    const data = await caller.auth.verifyInviteToken({ token })
    return data
  } catch (error) {
    return null
  }
}

export default async function RegisterPage({ params }: { params: { token: string } }) {
  const userData = await verifyToken(params.token)

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">EKSU</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-balance">NYSC Clearance System</h1>
            <p className="text-muted-foreground text-balance">Ekiti State University, Ado-Ekiti</p>
          </div>

          <Card className="w-full max-w-md border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Invalid or Expired Link</CardTitle>
              </div>
              <CardDescription>This invitation link is invalid or has expired.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>What to do next:</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    If you believe this is an error, please contact your Head of Department to resend the invitation.
                  </p>
                  <p className="text-sm">Invitation links expire after 7 days.</p>
                </AlertDescription>
              </Alert>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">EKSU</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">NYSC Clearance System</h1>
          <p className="text-muted-foreground text-balance">Ekiti State University, Ado-Ekiti</p>
        </div>
        <RegisterForm token={params.token} userData={userData} />
      </div>
    </div>
  )
}
