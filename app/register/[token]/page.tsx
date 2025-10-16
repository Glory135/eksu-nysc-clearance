"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc/client"
import { useEffect, use } from "react"
import { toast } from "sonner"

export default function RegisterPage({ params }: { params: Promise<{ token: string }> }) {
  const verifyTokenMutation = trpc.auth.verifyInviteToken.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to verify invitation token")
    },
  })

  const resolvedParams = use(params)

  useEffect(() => {
    if (resolvedParams.token) {
      verifyTokenMutation.mutate({ token: resolvedParams.token })
    }
  }, [resolvedParams.token])

  // Loading state
  if (verifyTokenMutation.isPending) {
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

          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <CardTitle>Verifying invitation...</CardTitle>
              </div>
              <CardDescription className="text-center">
                Please wait while we verify your invitation link.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Error state - invalid or expired token
  if (verifyTokenMutation.isError || (verifyTokenMutation.isSuccess && !verifyTokenMutation.data)) {
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

  // Success state - show registration form
  if (verifyTokenMutation.isSuccess && verifyTokenMutation.data) {
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
          <RegisterForm token={resolvedParams.token} userData={verifyTokenMutation.data} />
        </div>
      </div>
    )
  }

  // Fallback - should not reach here
  return null
}
