"use client"

import { UploadForm } from '@/components/student/upload-form';
import { SubmissionStatus } from '@/components/student/submission-status';
import { ClearanceDocument } from '@/components/student/clearance-document';
import { PassportGuidelines } from '@/components/student/passport-guidelines';
import { trpc } from '@/lib/trpc/client';

export default function StudentDashboardPage() {
	const { data: myForm } = trpc.student.getMyForm.useQuery();

	return (
		<div className='container mx-auto py-8 w-full'>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold text-balance'>
						Student Dashboard
					</h1>
					<p className='text-muted-foreground text-balance mt-2'>
						Upload your documents and track your NYSC clearance
						status
					</p>
				</div>

				<ClearanceDocument />

				<div className='grid gap-6 lg:grid-cols-3 w-full'>
					<SubmissionStatus />
					{myForm &&
					myForm.status === 'admissions_approved' ? null : (
						<>
							<PassportGuidelines />
							<UploadForm />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
