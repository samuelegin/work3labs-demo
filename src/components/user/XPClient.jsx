'use client'
import ThemeToggle from '@/components/ThemeToggle'
import { useState } from 'react'
import Link from 'next/link'
import { MOCK_XP_TASKS } from '@/lib/mockData'

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

export default function XPClient() {
  const xpTasks  = MOCK_XP_TASKS
  const totalXp  = xpTasks.reduce((a, t) => a + t.xp, 0)
  const nextLevel = 500
  const pct = Math.min(100, (totalXp / nextLevel) * 100)

  return (
    <div className="min-h-screen bg-paper pb-24 sm:pb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 h-[58px] flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />Dashboard
          </Link>
          <span className="text-[#E0E0E0] text-[12px]">/</span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">XP</span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/profile/pi" className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#AAA] border border-black/[0.09] rounded-full px-3 py-1.5 hover:text-ink hover:border-black/20 transition-colors">
              View PI Score →
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="mb-8" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">Platform activity</span>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-[-0.04em] text-ink mb-2">XP — Experience Points</h1>
          <p className="text-[14px] font-light text-[#888] leading-relaxed max-w-[480px]">
            XP is earned by completing platform tasks — onboarding steps, verifications, referrals, and more. XP is separate from PI Score and is not earned through deals or jobs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: 'up 0.5s 0.05s both' }}>
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

        {/* Level progress */}
        <div className="bg-white border border-black/[0.07] rounded-[14px] px-5 py-5 mb-6" style={{ animation: 'up 0.5s 0.08s both' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-sans text-[13px] font-medium text-ink">Level 3 → Level 4</p>
              <p className="font-mono text-[10px] text-[#AAA]">{totalXp} / {nextLevel} XP</p>
            </div>
            <span className="font-mono text-[12px] text-[#F59E0B] font-bold">{nextLevel - totalXp} XP to go</span>
          </div>
          <div className="w-full bg-black/[0.06] rounded-full h-2.5 overflow-hidden">
            <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: '#F59E0B' }} />
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
      </div>
    </div>
  )
}
