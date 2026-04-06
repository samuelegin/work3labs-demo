'use client'
import ThemeToggle from '@/components/ThemeToggle'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchLeaderboard } from '@/services/api'
import { MOCK_POD_LEADERBOARD } from '@/lib/mockData'

function Skeleton({ className }) {
  return <div className={`bg-black/[0.05] rounded-[8px] animate-pulse ${className}`} />
}

const PERIODS = [
  { key: 'weekly',  label: 'This week'  },
  { key: 'monthly', label: 'This month' },
  { key: 'alltime', label: 'All time'   },
]

const BOARD_TYPES = [
  { key: 'talent', label: 'Talent', icon: 'bi-person-fill'  },
  { key: 'pods',   label: 'Pods',   icon: 'bi-people-fill'  },
]

function RankBadge({ rank }) {
  const cls =
    rank === 0 ? 'bg-[#F59E0B] text-white'
    : rank === 1 ? 'bg-[#9CA3AF] text-white'
    : rank === 2 ? 'bg-[#CD7C2E] text-white'
    : 'bg-[#F4F4F2] text-[#888]'
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${cls}`}>
      {rank + 1}
    </div>
  )
}

function TalentRow({ e, rank }) {
  return (
    <Link href={`/u/${e.username}`}>
      <div className="px-5 py-4 grid grid-cols-[40px_1fr_80px_hidden_hidden] sm:grid-cols-[40px_1fr_100px_100px_80px] gap-3 items-center hover:bg-[#FAFAFA] transition-colors min-w-max sm:min-w-full cursor-pointer">
        <RankBadge rank={rank} />
        <div className="flex items-center gap-3 min-w-0">
          {e.avatarUrl ? (
            <img src={e.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[10px] text-paper">{e.displayName?.[0]?.toUpperCase() ?? '?'}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-sans text-[13px] font-medium text-ink truncate">{e.displayName}</p>
              {(e.goldTick || e.blueTick) && (
                <i className={`bi bi-patch-check-fill text-[11px] flex-shrink-0 ${e.goldTick ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}`} />
              )}
            </div>
            <p className="font-mono text-[10px] text-[#AAA]">@{e.username}</p>
          </div>
        </div>
        <span className="font-mono text-[12px] font-medium text-green-dark whitespace-nowrap">${e.earningsUsd?.toLocaleString() ?? 0}</span>
        <span className="hidden sm:inline font-mono text-[12px] text-ink">{e.piScore ?? '—'}</span>
        <span className="hidden sm:inline font-mono text-[12px] text-[#3B82F6]">{e.xp ?? 0}</span>
      </div>
    </Link>
  )
}

function PodRow({ pod, rank }) {
  const STATUS_COLOR = { active: '#1DC433', completed: '#3B82F6', forming: '#F59E0B' }
  const dotColor = STATUS_COLOR[pod.status] ?? '#AAA'
  return (
    <Link href={`/pod/${pod.id}`}>
      <div className="px-5 py-4 grid grid-cols-[40px_1fr_80px_hidden_hidden] sm:grid-cols-[40px_1fr_100px_100px_80px] gap-3 items-center hover:bg-[#FAFAFA] transition-colors min-w-max sm:min-w-full cursor-pointer">
        <RankBadge rank={rank} />
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#F4F4F2] flex items-center justify-center flex-shrink-0">
            <i className="bi bi-people-fill text-[13px] text-[#888]" />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-[13px] font-medium text-ink truncate">{pod.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
              <p className="font-mono text-[10px] text-[#AAA] capitalize">{pod.status} · {pod.memberCount} members</p>
            </div>
          </div>
        </div>
        <span className="font-mono text-[12px] font-medium text-green-dark whitespace-nowrap">${pod.earned?.toLocaleString() ?? 0}</span>
        <span className="hidden sm:inline font-mono text-[12px] text-ink">{pod.piScore ?? '—'}</span>
        <span className="hidden sm:inline font-mono text-[12px] text-[#3B82F6]">{pod.xp ?? 0}</span>
      </div>
    </Link>
  )
}

export default function LeaderboardClient() {
  const [period,    setPeriod]    = useState('alltime')
  const [boardType, setBoardType] = useState('talent')
  const [entries,   setEntries]   = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    if (boardType === 'pods') {
      setTimeout(() => {
        setEntries(MOCK_POD_LEADERBOARD)
        setLoading(false)
      }, 300)
    } else {
      fetchLeaderboard({ period })
        .then(({ data }) => { if (data) setEntries(data.entries ?? []) })
        .finally(() => setLoading(false))
    }
  }, [period, boardType])

  const isTalent = boardType === 'talent'
  const headers  = isTalent
    ? ['#', 'Talent',   'Earnings', 'PI Score', 'XP']
    : ['#', 'Pod Name', 'Earnings', 'PI Score', 'XP']

  return (
    <div className="min-h-screen bg-paper pb-24 sm:pb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[760px] mx-auto px-5 sm:px-8 h-[58px] flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />Dashboard
          </Link>
          <span className="text-[#E0E0E0] text-[12px]">/</span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">Leaderboard</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="mb-8 relative overflow-hidden bg-white border border-black/[0.07] rounded-[18px] px-6 py-6">
          <img src="/images/success-hero.png" alt="" className="absolute right-0 top-0 h-full w-auto object-contain opacity-[0.12] pointer-events-none" />
          <div className="relative" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">Rankings</span>
            <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-[-0.04em] text-ink mb-2">Leaderboard</h1>
            <p className="text-[14px] font-light text-[#888]">Top talent and pods ranked by earnings and performance.</p>
          </div>
        </div>

        {/* Board type selector — Talent vs Pods */}
        <div className="flex bg-[#F4F4F2] rounded-[10px] p-[3px] gap-[3px] mb-4" style={{ animation: 'up 0.5s 0.03s both' }}>
          {BOARD_TYPES.map(bt => (
            <button key={bt.key} type="button" onClick={() => setBoardType(bt.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] font-mono text-[10px] tracking-[0.08em] uppercase transition-all cursor-pointer border-none ${
                boardType === bt.key ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'text-[#AAA] hover:text-[#666] bg-transparent'
              }`}>
              <i className={`bi ${bt.icon} text-[11px]`} />{bt.label}
            </button>
          ))}
        </div>

        {/* Period tabs — only for Talent board */}
        {isTalent && (
          <div className="flex bg-[#F4F4F2] rounded-[10px] p-[3px] gap-[3px] mb-6" style={{ animation: 'up 0.5s 0.05s both' }}>
            {PERIODS.map(p => (
              <button key={p.key} type="button" onClick={() => setPeriod(p.key)}
                className={`flex-1 py-2 rounded-[8px] font-mono text-[10px] tracking-[0.08em] uppercase transition-all cursor-pointer border-none ${
                  period === p.key ? 'bg-white text-ink shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'text-[#AAA] hover:text-[#666] bg-transparent'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-x-auto" style={{ animation: 'up 0.5s 0.08s both' }}>
          <div className="px-5 py-3 border-b border-black/[0.06] grid grid-cols-[40px_1fr_80px_hidden_hidden] sm:grid-cols-[40px_1fr_100px_100px_80px] gap-3 items-center min-w-max sm:min-w-full">
            {headers.map(h => (
              <span key={h} className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC]">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : entries.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <i className="bi bi-trophy text-[28px] text-[#CCC] block mb-3" />
              <p className="text-[13.5px] font-light text-[#AAA]">No data yet for this period.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {entries.map((e, i) =>
                isTalent
                  ? <TalentRow key={e.userId ?? e.id} e={e}   rank={i} />
                  : <PodRow    key={e.id}              pod={e} rank={i} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
