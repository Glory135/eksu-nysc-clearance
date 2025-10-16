import { ProfileForm } from "@/components/student/profile-form"

export default function StudentProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Profile</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Complete your profile information for NYSC clearance
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  )
}
