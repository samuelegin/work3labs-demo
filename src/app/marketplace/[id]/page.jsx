'use client'
export const dynamic = 'force-dynamic'
import JobDetailClient from '@/components/user/JobDetailClient'
export default function JobDetailPage({ params }) {
  const { id } = params
  return <JobDetailClient jobId={id} />
}
