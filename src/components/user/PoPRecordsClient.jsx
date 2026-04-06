'use client'
import ThemeToggle from '@/components/ThemeToggle'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchProfile, fetchMyPods } from '@/services/api'
import { MOCK_XP_TASKS } from '@/lib/mockData'

function Skeleton({ className }) {
  return <div className={`bg-black/[0.05] rounded-[8px] animate-pulse ${className}`} />
}

function Spinner({ size = 12 }) {
  return <span style={{ width: size, height: size }} className="inline-block rounded-full border-2 border-black/10 border-t-black/40 spin-anim flex-shrink-0" />
}

/* ── Reusable PI Score progress bar ─────────────────────────── */
function PIBar({ score, showLabel = false }) {
  const pct   = Math.min(100, Math.max(0, score ?? 0))
  const color = pct >= 90 ? '#1DC433' : pct >= 75 ? '#F59E0B' : pct >= 60 ? '#3B82F6' : '#EF4444'
  const label = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : 'Below avg'
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && <span className="font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color }}>{label}</span>}
        {showLabel && <span className="font-mono text-[10px] font-bold" style={{ color }}>{pct}/100</span>}
      </div>
      <div className="w-full bg-black/[0.06] rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

/* ── Single PoP badge card — contains PI Score inside ────────── */
function PoPBadge({ record, podName, index }) {
  const [expanded, setExpanded] = useState(false)
  const piScore = record.piScore ?? record.score ?? null
  const piColor = piScore >= 90 ? '#1DC433' : piScore >= 75 ? '#F59E0B' : piScore >= 60 ? '#3B82F6' : '#EF4444'
  const deliveryColor = record.delivery === 'Early' ? 'text-green-dark' : record.delivery === 'On time' ? 'text-[#3B82F6]' : 'text-[#F59E0B]'
  const issuedDate = record.issuedAt
    ? new Date(typeof record.issuedAt === 'number' ? record.issuedAt * 1000 : record.issuedAt)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently issued'

  return (
    <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden hover:border-black/[0.14] transition-all">
      <button
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 cursor-pointer bg-transparent border-none"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Left — badge icon + title */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-[10px] bg-[#F4FAF7] border border-green-dark/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-patch-check-fill text-green-dark text-[18px]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-green-dark border border-green-dark/20 bg-green-dark/5 rounded-full px-2 py-0.5">
                PoP Verified
              </span>
              <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#AAA]">{record.workType}</span>
              <span className={`font-mono text-[9px] tracking-[0.06em] ${deliveryColor}`}>{record.delivery}</span>
            </div>
            <p className="font-sans text-[14px] font-medium text-ink tracking-[-0.01em] mb-2 truncate">
              {record.jobTitle ?? podName}
            </p>
            {/* PI Score bar sits directly inside PoP card */}
            {piScore != null && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <PIBar score={piScore} />
                </div>
                <span className="font-mono text-[10px] font-bold flex-shrink-0" style={{ color: piColor }}>
                  PI {piScore}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right — date + chevron */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className="font-mono text-[10px] text-[#CCC]">{issuedDate}</p>
          <i className={`bi bi-chevron-down text-[12px] text-[#CCC] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-black/[0.05] px-6 py-5 space-y-4" style={{ animation: 'up 0.2s both' }}>
          {/* Detail grid */}
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

          {/* PI Score breakdown — full bar with label */}
          {piScore != null && (
            <div>
              <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] mb-2">
                Performance Index (PI Score)
              </p>
              <PIBar score={piScore} showLabel />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[9px] text-[#CCC]">0</span>
                <span className="font-mono text-[9px] text-[#CCC]">100</span>
              </div>
            </div>
          )}

          {/* On-chain info if available */}
          {(record.tokenId || record.contractAddress) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['Token ID',  record.tokenId ? `#${record.tokenId}` : 'Pending'],
                ['Contract',  record.contractAddress ? `${record.contractAddress.slice(0,6)}…${record.contractAddress.slice(-4)}` : '—'],
                ['IPFS',      record.metadataUri ? 'Stored' : 'Pending'],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#FAFAF8] rounded-[8px] px-3 py-2.5">
                  <p className="font-mono text-[9px] text-[#CCC] tracking-[0.08em] uppercase mb-0.5">{k}</p>
                  <p className="font-mono text-[12px] text-ink">{v}</p>
                </div>
              ))}
            </div>
          )}

          {record.contractAddress && record.tokenId && (
            <a
              href={`https://basescan.org/token/${record.contractAddress}?a=${record.tokenId}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-[#AAA] hover:text-ink transition-colors"
            >
              <i className="bi bi-box-arrow-up-right text-[11px]" />View on Basescan
            </a>
          )}
        </div>
      )}
    </div>
  )
}

/* ── XP task row ─────────────────────────────────────────────── */
function XPTaskRow({ task }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-black/[0.05] last:border-b-0">
      <div className="w-8 h-8 rounded-[8px] bg-[#F4FAF7] border border-green-dark/15 flex items-center justify-center flex-shrink-0">
        <i className={`bi ${task.icon} text-[13px] text-green-dark`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] font-medium text-ink truncate">{task.task}</p>
        <p className="font-mono text-[10px] text-[#AAA] mt-0.5">
          {task.category} · {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <span className="font-mono text-[13px] font-bold text-[#F59E0B] flex-shrink-0">+{task.xp} XP</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function PoPRecordsClient() {
  const [pods, setPods]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('pop')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([fetchProfile(), fetchMyPods()])
      .then(([, podsRes]) => {
        if (podsRes.data) setPods(podsRes.data.pods ?? podsRes.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  /* Flatten all PoP records from all pods */
  const allRecords = pods
    .flatMap(pod => (pod.popRecords ?? []).map(rec => ({ ...rec, podName: pod.name, podId: pod.id })))
    .sort((a, b) => {
      const ta = typeof a.issuedAt === 'number' ? a.issuedAt * 1000 : new Date(a.issuedAt).getTime()
      const tb = typeof b.issuedAt === 'number' ? b.issuedAt * 1000 : new Date(b.issuedAt).getTime()
      return tb - ta
    })

  const xpTasks  = MOCK_XP_TASKS
  const totalXp  = xpTasks.reduce((a, t) => a + t.xp, 0)
  const avgPI    = allRecords.length
    ? Math.round(allRecords.reduce((a, r) => a + (r.piScore ?? r.score ?? 0), 0) / allRecords.length)
    : null

  return (
    <div className="min-h-screen bg-paper" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Nav */}
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 h-[58px] flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />Dashboard
          </Link>
          <span className="text-[#E0E0E0] text-[12px]">/</span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">
            {tab === 'pop' ? 'Proof of Performance' : 'XP'}
          </span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-10 sm:py-14">

        {/* Hero header */}
        <div className="mb-8" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">On-chain identity</span>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-[-0.04em] text-ink mb-2">
            {tab === 'pop' ? 'Proof of Performance' : 'XP — Experience Points'}
          </h1>
          <p className="text-[14px] font-light text-[#888] leading-relaxed max-w-[520px]">
            {tab === 'pop'
              ? 'ERC-1155 badges issued on-chain for every completed deal. Each PoP includes your Performance Index (PI) Score — a 0–100 rating of your work quality and delivery.'
              : 'XP is earned through platform tasks — onboarding, referrals, skill verification, and more. XP is not earned through deals.'}
          </p>
        </div>

        {/* Tab switcher: PoP / XP */}
        <div className="flex bg-[#F4F4F2] rounded-[10px] p-[3px] gap-[3px] mb-6" style={{ animation: 'up 0.5s 0.03s both' }}>
          {[
            { key: 'pop', icon: 'bi-patch-check-fill', label: 'PoP + PI Score' },
            { key: 'xp',  icon: 'bi-lightning-charge-fill', label: 'XP' },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] font-mono text-[10px] tracking-[0.08em] uppercase transition-all cursor-pointer border-none ${
                tab === t.key ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'text-[#AAA] hover:text-[#666] bg-transparent'
              }`}>
              <i className={`bi ${t.icon} text-[11px]`} />{t.label}
            </button>
          ))}
        </div>

        {/* ── PoP + PI Score tab ─────────────────────────────── */}
        {tab === 'pop' && (
          <>
            {/* Summary stats */}
            {!loading && (
              <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: 'up 0.5s 0.06s both' }}>
                <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                  <p className="font-serif text-[30px] font-light text-ink tracking-[-0.05em] leading-none mb-1">{allRecords.length}</p>
                  <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">PoP Badges</p>
                </div>
                <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                  <p className="font-serif text-[30px] font-light text-green-dark tracking-[-0.05em] leading-none mb-1">{avgPI ?? '—'}</p>
                  <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Avg PI Score</p>
                </div>
                <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                  <p className="font-serif text-[30px] font-light text-ink tracking-[-0.05em] leading-none mb-1">{pods.length}</p>
                  <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Pods</p>
                </div>
              </div>
            )}

            {/* Average PI bar — overall */}
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

            {/* Per-deal PoP badge list */}
            <div className="space-y-3" style={{ animation: 'up 0.5s 0.1s both' }}>
              {loading
                ? [1,2,3].map(i => <Skeleton key={i} className="h-[100px]" />)
                : allRecords.length === 0
                  ? (
                    <div className="bg-white border border-black/[0.07] rounded-[14px] px-8 py-14 text-center">
                      <div className="w-14 h-14 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto mb-5">
                        <i className="bi bi-patch-check text-[22px] text-[#CCC]" />
                      </div>
                      <h3 className="font-serif text-[20px] font-light text-ink tracking-[-0.03em] mb-2">No PoP badges yet</h3>
                      <p className="text-[13.5px] font-light text-[#888] leading-relaxed max-w-[300px] mx-auto">
                        PoP badges are issued on-chain when your pod completes and delivers verified work. Each badge includes your PI Score.
                      </p>
                    </div>
                  )
                  : allRecords.map((rec, i) => (
                      <PoPBadge key={`${rec.podId}-${i}`} record={rec} podName={rec.podName} index={i} />
                    ))
              }
            </div>
          </>
        )}

        {/* ── XP tab ─────────────────────────────────────────── */}
        {tab === 'xp' && (
          <>
            {/* XP stats */}
            <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: 'up 0.5s 0.06s both' }}>
              <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                <p className="font-serif text-[30px] font-light text-[#F59E0B] tracking-[-0.05em] leading-none mb-1">{totalXp}</p>
                <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Total XP</p>
              </div>
              <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                <p className="font-serif text-[30px] font-light text-ink tracking-[-0.05em] leading-none mb-1">{xpTasks.length}</p>
                <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">Tasks done</p>
              </div>
              <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 text-center">
                <p className="font-serif text-[30px] font-light text-[#F59E0B] tracking-[-0.05em] leading-none mb-1">Lv.3</p>
                <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#AAA]">XP Level</p>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 mb-6" style={{ animation: 'up 0.5s 0.08s both' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-sans text-[13px] font-medium text-ink">Level 3 → Level 4</p>
                  <p className="font-mono text-[10px] text-[#AAA]">{totalXp} / 500 XP</p>
                </div>
                <span className="font-mono text-[12px] text-[#F59E0B] font-bold">{500 - totalXp} XP to go</span>
              </div>
              <div className="w-full bg-black/[0.06] rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (totalXp / 500) * 100)}%`, background: '#F59E0B' }} />
              </div>
              <p className="font-mono text-[9px] text-[#CCC] mt-2">XP is earned through platform tasks only — not deals or jobs</p>
            </div>

            {/* Task list */}
            <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden" style={{ animation: 'up 0.5s 0.1s both' }}>
              <div className="px-5 py-3 border-b border-black/[0.06] flex items-center justify-between">
                <h3 className="font-sans text-[13px] font-medium text-ink">Completed platform tasks</h3>
                <span className="font-mono text-[10px] text-[#AAA]">{xpTasks.length} tasks</span>
              </div>
              {xpTasks.map(task => <XPTaskRow key={task.id} task={task} />)}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
