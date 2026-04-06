'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { fetchMyPods } from '@/services/api'

const STATUS = {
  forming:   { label: 'Forming',   color: '#F59E0B' },
  active:    { label: 'Active',    color: '#1DC433' },
  submitted: { label: 'Submitted', color: '#3B82F6' },
  reviewing: { label: 'Reviewing', color: '#8B5CF6' },
  approved:  { label: 'Approved',  color: '#1DC433' },
  claimable: { label: 'Claimable', color: '#2DFC44' },
  completed: { label: 'Completed', color: '#AAA'    },
}

function Skeleton({ className }) {
  return <div className={`bg-black/[0.05] rounded-[8px] animate-pulse ${className}`} />
}

function PodCard({ pod }) {
  const s = STATUS[pod.status] ?? STATUS.forming
  return (
    <Link href={`/pod/${pod.id}`}>
      <div className="group bg-white border border-black/[0.07] rounded-[14px] px-4 py-4 hover:border-black/[0.14] hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all cursor-pointer">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[13.5px] font-medium text-ink tracking-[-0.01em] truncate">{pod.name}</p>
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase mt-0.5" style={{ color: s.color }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-px" style={{ background: s.color }} />
              {s.label}
            </p>
          </div>
          {pod.myRole === 'admin' && (
            <span className="font-mono text-[8px] tracking-[0.08em] uppercase text-green-dark border border-green-dark/20 bg-green-dark/5 rounded-full px-2 py-0.5 flex-shrink-0">Admin</span>
          )}
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-black/[0.05]">
          <span className="flex items-center gap-1 text-[11px] font-light text-[#AAA]">
            <i className="bi bi-people text-[10px]" />{pod.memberCount ?? 0}
          </span>
          {pod.piScore != null && (
            <span className="flex items-center gap-1 text-[11px] font-light text-[#AAA]">
              <i className="bi bi-graph-up-arrow text-[10px]" />{pod.piScore}
            </span>
          )}
          {pod.xp > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-light text-[#AAA]">
              <i className="bi bi-lightning-charge-fill text-[10px] text-[#F59E0B]" />{pod.xp}
            </span>
          )}
          {pod.earningsUsd > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-light text-green-dark ml-auto">
              <i className="bi bi-cash-coin text-[10px]" />${pod.earningsUsd.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function PodIndexPage() {
  const [pods, setPods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPods()
      .then(({ data }) => { if (data) setPods(data.pods ?? data ?? []) })
      .finally(() => setLoading(false))
  }, [])

  const activePods   = pods.filter(p => ['active','submitted','reviewing','approved','claimable'].includes(p.status))
  const completedPods= pods.filter(p => p.status === 'completed')

  return (
    <div className="min-h-screen bg-paper" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <nav className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 h-[58px] flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Work3 Labs" className="h-7" />
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#CCC]">Talent</span>
          </Link>
          <div className="flex items-center gap-2 ml-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
              <i className="bi bi-arrow-left text-[11px]" />Dashboard
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-[28px] font-light text-ink">Your pods</h1>
            <p className="text-[13px] text-[#888]">All pods you participate in</p>
          </div>
          <Link href="/pod/create" className="inline-flex items-center gap-1.5 bg-ink text-paper text-[12.5px] font-medium px-4 py-2 rounded-[8px] hover:bg-[#1A1A1A] transition-colors">
            <i className="bi bi-plus text-[14px]" />Create pod
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-[90px]" />)}</div>
        ) : pods.length === 0 ? (
          <div className="bg-white border border-black/[0.07] rounded-[14px] px-6 py-8 text-center">
            <p className="font-serif text-[16px] text-ink mb-2">No pods yet</p>
            <p className="text-[12.5px] text-[#AAA] mb-4">Create a pod to start collaborating with your team.</p>
            <Link href="/pod/create" className="font-mono text-[11px] text-green-dark">Create your first pod →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pods.map(pod => <PodCard key={pod.id} pod={pod} />)}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-4">
            <p className="font-mono text-[10px] uppercase text-[#AAA] mb-1">Active pods</p>
            <p className="font-serif text-[20px] text-ink">{activePods.length}</p>
          </div>
          <div className="bg-white border border-black/[0.07] rounded-[14px] p-4">
            <p className="font-mono text-[10px] uppercase text-[#AAA] mb-1">Completed pods</p>
            <p className="font-serif text-[20px] text-ink">{completedPods.length}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
