import { UploadSingleStudent } from "@/components/hod/upload-single-student"
import { UploadCSVStudents } from "@/components/hod/upload-csv-students"
import { StudentsList } from "@/components/hod/students-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UploadStudentsPage() {
  return (
    <div className="container mx-auto py-8 px-5 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Upload Students</h1>
          <p className="text-muted-foreground text-balance mt-2">
            Add graduates to the NYSC clearance system and send them invitation emails
          </p>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="single">Single Upload</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload (CSV)</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="space-y-6">
            <UploadSingleStudent />
          </TabsContent>
          <TabsContent value="bulk" className="space-y-6">
            <UploadCSVStudents />
          </TabsContent>
        </Tabs>

        <StudentsList />
      </div>
    </div>
  )
}
