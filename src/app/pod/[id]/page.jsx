'use client'
import { use } from 'react'
import PodDetailClient from '@/components/user/PodDetailClient'

export default function PodPage({ params }) {
  const { id } = params
  return <PodDetailClient podId={id} />
}
