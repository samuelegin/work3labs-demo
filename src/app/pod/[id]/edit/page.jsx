'use client'
import EditPodClient from '@/components/user/EditPodClient'

export default function EditPodPage({ params }) {
  const { id } = params
  return <EditPodClient podId={id} />
}
