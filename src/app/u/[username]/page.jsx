'use client'
export const dynamic = 'force-dynamic'
import PublicProfileClient from '@/components/user/PublicProfileClient'
export default function PublicProfilePage({ params }) {
  const { username } = params
  return <PublicProfileClient username={username} />
}
