import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/Logo"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Logo />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">NYSC Clearance System</h1>
          <p className="text-muted-foreground text-balance">Ekiti State University, Ado-Ekiti</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
