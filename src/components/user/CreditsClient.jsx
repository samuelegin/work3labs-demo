'use client'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

const CREDIT_PACKS = [
  { id: 'starter', name: 'Starter',    credits: 100,  price: 9,   popular: false, perCredit: '$0.09' },
  { id: 'growth',  name: 'Growth',     credits: 500,  price: 39,  popular: true,  perCredit: '$0.08' },
  { id: 'pro',     name: 'Pro',        credits: 1200, price: 89,  popular: false, perCredit: '$0.07' },
  { id: 'studio',  name: 'Studio',     credits: 3000, price: 199, popular: false, perCredit: '$0.07' },
]

const CREDIT_USES = [
  { icon: 'bi-search',             label: 'Talent search boost',     cost: '5 credits / search'  },
  { icon: 'bi-send-check',         label: 'Priority application',    cost: '10 credits / apply'  },
  { icon: 'bi-graph-up-arrow',     label: 'PI Score spotlight',      cost: '20 credits / 7 days' },
  { icon: 'bi-people',             label: 'Pod visibility boost',    cost: '15 credits / 7 days' },
  { icon: 'bi-patch-check-fill',   label: 'Featured on leaderboard', cost: '25 credits / 7 days' },
  { icon: 'bi-bell',               label: 'Deal alert notifications', cost: '5 credits / month'  },
]

export default function CreditsClient() {
  return (
    <div className="min-h-screen bg-paper pb-24 sm:pb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[760px] mx-auto px-5 sm:px-8 h-[58px] flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />Dashboard
          </Link>
          <span className="text-[#E0E0E0] text-[12px]">/</span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">Credits</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </div>

      <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-10" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-3">Platform credits</span>
          <h1 className="font-serif text-[28px] sm:text-[34px] font-light tracking-[-0.04em] text-ink mb-2">Buy Credits</h1>
          <p className="text-[14px] font-light text-[#888] leading-relaxed max-w-[480px]">
            Credits power premium features across Work3 Labs — boost visibility, prioritise applications, and unlock platform perks.
          </p>
        </div>

        {/* Coming soon banner */}
        <div className="bg-ink text-paper rounded-[14px] px-6 py-5 mb-10 flex items-center gap-4" style={{ animation: 'up 0.5s 0.04s both' }}>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-clock text-[18px]" />
          </div>
          <div>
            <p className="font-sans text-[14px] font-medium mb-0.5">Coming soon</p>
            <p className="text-[12.5px] font-light opacity-60">Credit purchasing is under development. Preview the packs and feature costs below.</p>
          </div>
        </div>

        {/* Credit packs */}
        <div style={{ animation: 'up 0.5s 0.06s both' }}>
          <h2 className="font-serif text-[18px] font-light text-ink tracking-[-0.03em] mb-4">Credit packs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.id} className={`bg-white rounded-[14px] px-5 py-5 relative overflow-hidden ${
                pack.popular ? 'border-2 border-green-dark' : 'border border-black/[0.07]'
              }`}>
                {pack.popular && (
                  <span className="absolute top-3 right-3 font-mono text-[8px] tracking-[0.1em] uppercase bg-green-dark text-ink px-2 py-0.5 rounded-full">
                    Most popular
                  </span>
                )}
                <div className="flex items-end gap-2 mb-1">
                  <p className="font-serif text-[28px] font-light text-ink tracking-[-0.04em] leading-none">{pack.credits.toLocaleString()}</p>
                  <p className="font-mono text-[10px] text-[#AAA] mb-1">credits</p>
                </div>
                <p className="font-sans text-[14px] font-medium text-ink mb-0.5">{pack.name}</p>
                <p className="font-mono text-[10px] text-[#AAA] mb-4">{pack.perCredit} per credit</p>
                <div className="flex items-center justify-between">
                  <p className="font-serif text-[22px] font-light text-green-dark tracking-[-0.04em]">${pack.price}</p>
                  <button disabled className="font-mono text-[10px] tracking-[0.08em] uppercase bg-ink text-paper px-4 py-2 rounded-[8px] opacity-40 cursor-not-allowed border-none">
                    Coming soon
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What credits are used for */}
        <div style={{ animation: 'up 0.5s 0.1s both' }}>
          <h2 className="font-serif text-[18px] font-light text-ink tracking-[-0.03em] mb-4">What credits unlock</h2>
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            {CREDIT_USES.map((u, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-black/[0.05] last:border-b-0">
                <div className="w-8 h-8 rounded-[8px] bg-[#F4FAF7] border border-green-dark/15 flex items-center justify-center flex-shrink-0">
                  <i className={`bi ${u.icon} text-[13px] text-green-dark`} />
                </div>
                <p className="font-sans text-[13px] font-medium text-ink flex-1">{u.label}</p>
                <span className="font-mono text-[10px] text-[#AAA] flex-shrink-0">{u.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
