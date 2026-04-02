'use client'
export const dynamic = 'force-dynamic'
import KYCClient from '@/components/KYCClient'
export default function UserKYCPage() {
  return <KYCClient backHref="/dashboard" backLabel="Dashboard" isProject={false} />
}
