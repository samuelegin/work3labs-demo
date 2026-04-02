'use client'
export const dynamic = 'force-dynamic'
import KYCClient from '@/components/KYCClient'
export default function ProjectKYCPage() {
  return <KYCClient backHref="/project" backLabel="Dashboard" isProject={true} />
}
