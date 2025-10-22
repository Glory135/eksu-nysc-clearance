"use client"

import { UploadForm } from '@/components/student/upload-form';
import { SubmissionStatus } from '@/components/student/submission-status';
import { ClearanceDocument } from '@/components/student/clearance-document';
import { PassportGuidelines } from '@/components/student/passport-guidelines';
import { trpc } from '@/lib/trpc/client';

export default function StudentDashboardPage() {
	const { data: myForm } = trpc.student.getMyForm.useQuery();
	const formApproved = myForm && myForm.status === 'admissions_approved'

	return (
		<div className='container mx-auto py-8 px-5 w-full '>
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

				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full'>
					{

					}
					<div className={`${formApproved ? "lg:col-span-3 max-w-3xl mx-auto" : ""}`}>
						<SubmissionStatus />
					</div>
					{formApproved ? null : (
						<>
							<PassportGuidelines />
							<div className={`md:col-span-2 lg:col-span-1`}>
							<UploadForm />
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
