'use client'
import ThemeToggle from '@/components/ThemeToggle'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchMyPods } from '@/services/api'

function Skeleton({ className }) {
  return <div className={`bg-black/[0.05] rounded-[8px] animate-pulse ${className}`} />
}

function PIBar({ score, showLabel = false }) {
  const pct   = Math.min(100, Math.max(0, score ?? 0))
  const color = pct >= 90 ? '#1DC433' : pct >= 75 ? '#F59E0B' : pct >= 60 ? '#3B82F6' : '#EF4444'
  const label = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : 'Below avg'
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color }}>{label}</span>
          <span className="font-mono text-[10px] font-bold" style={{ color }}>{pct}/100</span>
        </div>
      )}
      <div className="w-full bg-black/[0.06] rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function PoPBadgeCard({ record, index }) {
  const [expanded, setExpanded] = useState(false)
  const pi = record.piScore ?? record.score ?? null
  const piColor = !pi ? '#AAA' : pi >= 90 ? '#1DC433' : pi >= 75 ? '#F59E0B' : pi >= 60 ? '#3B82F6' : '#EF4444'
  const deliveryColor = record.delivery === 'Early' ? 'text-green-dark' : record.delivery === 'On time' ? 'text-[#3B82F6]' : 'text-[#F59E0B]'
  const issuedDate = record.issuedAt
    ? new Date(typeof record.issuedAt === 'number' ? record.issuedAt * 1000 : record.issuedAt)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently issued'

  return (
    <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden hover:border-black/[0.14] transition-all">
      <button className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
        onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-[10px] bg-[#F4FAF7] border border-green-dark/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-patch-check-fill text-green-dark text-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-green-dark border border-green-dark/20 bg-green-dark/5 rounded-full px-2 py-0.5">PoP Verified</span>
              <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#AAA]">{record.workType}</span>
              <span className={`font-mono text-[9px] tracking-[0.06em] ${deliveryColor}`}>{record.delivery}</span>
            </div>
            <p className="font-sans text-[14px] font-medium text-ink tracking-[-0.01em] mb-2 truncate">{record.jobTitle}</p>
            {pi != null && (
              <div className="flex items-center gap-3">
                <div className="flex-1"><PIBar score={pi} /></div>
                <span className="font-mono text-[10px] font-bold flex-shrink-0" style={{ color: piColor }}>PI {pi}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className="font-mono text-[10px] text-[#CCC]">{issuedDate}</p>
          <i className={`bi bi-chevron-down text-[12px] text-[#CCC] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-black/[0.05] px-6 py-5 space-y-4" style={{ animation: 'up 0.2s both' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Milestones', record.milestones],
              ['Delivery',   record.delivery],
              ['Chain',      record.chainAnchor ?? 'Base'],
              ['Earned',     record.earnedUsd ? `$${record.earnedUsd.toLocaleString()}` : '—'],
            ].map(([k, v]) => v != null && (
              <div key={k} className="bg-[#FAFAF8] rounded-[8px] px-3 py-2.5">
                <p className="font-mono text-[9px] text-[#CCC] tracking-[0.08em] uppercase mb-0.5">{k}</p>
                <p className="font-mono text-[12px] text-ink">{v}</p>
              </div>
            ))}
          </div>
          {pi != null && (
            <div>
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] mb-2">Performance Index (PI Score)</p>
              <PIBar score={pi} showLabel />
              <div className="flex justify-between mt-1"><span className="font-mono text-[9px] text-[#CCC]">0</span><span className="font-mono text-[9px] text-[#CCC]">100</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PIScoreClient() {
  const [pods, setPods]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPods().then(r => { if (r.data) setPods(r.data.pods ?? r.data ?? []) }).finally(() => setLoading(false))
  }, [])

  const allRecords = pods
    .flatMap(pod => (pod.popRecords ?? []).map(rec => ({ ...rec, podName: pod.name, podId: pod.id })))
    .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))

  const avgPI = allRecords.length
    ? Math.round(allRecords.reduce((a, r) => a + (r.piScore ?? r.score ?? 0), 0) / allRecords.length)
    : null

  return (
    <div className="min-h-screen bg-paper pb-24 sm:pb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 h-[58px] flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />Dashboard
          </Link>
          <span className="text-[#E0E0E0] text-[12px]">/</span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">PI Score</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/profile/xp" className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#AAA] border border-black/[0.09] rounded-full px-3 py-1.5 hover:text-ink hover:border-black/20 transition-colors">
              View XP →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="mb-8" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">Performance</span>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-[-0.04em] text-ink mb-2">PI Score</h1>
          <p className="text-[14px] font-light text-[#888] leading-relaxed max-w-[480px]">
            Your Performance Index — a 0–100 score issued per completed deal as part of your Proof of Performance (PoP) badge. The higher your PI, the better your work quality and delivery.
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: 'up 0.5s 0.05s both' }}>
            <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
              <p className="font-serif text-[30px] font-light text-green-dark tracking-[-0.05em] leading-none mb-1">{avgPI ?? '—'}</p>
              <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Avg PI Score</p>
            </div>
            <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
              <p className="font-serif text-[30px] font-light text-ink tracking-[-0.05em] leading-none mb-1">{allRecords.length}</p>
              <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Deals scored</p>
            </div>
            <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
              <p className="font-serif text-[30px] font-light text-ink tracking-[-0.05em] leading-none mb-1">
                {allRecords.filter(r => (r.piScore ?? r.score ?? 0) >= 90).length}
              </p>
              <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">90+ scores</p>
            </div>
          </div>
        )}

        {/* Overall bar */}
        {avgPI != null && (
          <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 mb-6" style={{ animation: 'up 0.5s 0.08s both' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-sans text-[13px] font-medium text-ink">Overall PI Score</p>
                <p className="font-mono text-[10px] text-[#AAA]">Average across all {allRecords.length} completed deal{allRecords.length !== 1 ? 's' : ''}</p>
              </div>
              <span className="font-serif text-[32px] font-light text-green-dark tracking-[-0.06em]">{avgPI}</span>
            </div>
            <PIBar score={avgPI} showLabel />
            <div className="flex justify-between mt-1.5">
              <span className="font-mono text-[9px] text-[#CCC]">0</span>
              <span className="font-mono text-[9px] text-[#CCC]">100</span>
            </div>
          </div>
        )}

        {/* Per-deal PoP cards */}
        <div className="space-y-3" style={{ animation: 'up 0.5s 0.1s both' }}>
          {loading
            ? [1,2,3].map(i => <Skeleton key={i} className="h-[100px]" />)
            : allRecords.length === 0
              ? (
                <div className="bg-white border border-black/[0.07] rounded-[14px] px-8 py-14 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto mb-5">
                    <i className="bi bi-graph-up-arrow text-[22px] text-[#CCC]" />
                  </div>
                  <h3 className="font-serif text-[20px] font-light text-ink mb-2">No PI Scores yet</h3>
                  <p className="text-[13.5px] font-light text-[#888] max-w-[280px] mx-auto">
                    PI Scores are recorded inside your PoP badge when a deal is completed and verified.
                  </p>
                </div>
              )
              : allRecords.map((rec, i) => <PoPBadgeCard key={`${rec.podId}-${i}`} record={rec} index={i} />)
          }
        </div>
      </div>
    </div>
  )
}
