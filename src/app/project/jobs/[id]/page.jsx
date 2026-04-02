'use client'
export const dynamic = 'force-dynamic'
import ProjectJobDetailClient from '@/components/project/ProjectJobDetailClient'
export default function ProjectJobPage({ params }) {
  const { id } = params
  return <ProjectJobDetailClient jobId={id} />
}
