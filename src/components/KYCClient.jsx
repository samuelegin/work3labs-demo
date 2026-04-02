'use client'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'

export default function KYCClient({ backHref = '/dashboard', backLabel = 'Dashboard', isProject = false }) {
  return (
    <div className="min-h-screen bg-paper" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="sticky top-0 z-20 bg-paper/90 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 h-[58px] flex items-center justify-between">
          <Link href={backHref} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
            <i className="bi bi-arrow-left text-[11px]" />
            {backLabel}
          </Link>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB]">KYC Verification</span>
          <div><ThemeToggle /></div>
        </div>
      </div>

      <main className="max-w-[900px] mx-auto px-5 sm:px-8 py-20 sm:py-28" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#F4F4F2] flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-shield-check text-[40px] text-[#AAA]" />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-[32px] sm:text-[40px] font-light tracking-[-0.04em] text-ink mb-3">
            KYC Verification
          </h1>

          {/* Tagline */}
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#AAA] mb-4">Coming Soon</p>

          {/* Description */}
          <p className="text-[15px] font-light text-[#666] max-w-[500px] mx-auto mb-8 leading-relaxed">
            {isProject ? (
              <>Verify your project identity to unlock premium features, exclusive deal access, and increased visibility on Work3 Labs.</>
            ) : (
              <>Complete your KYC verification to unlock premium features, higher earning limits, and access to exclusive high-value deals.</>
            )}
          </p>

          {/* Features coming */}
          <div className="bg-white border border-black/[0.07] rounded-[14px] px-6 py-8 max-w-[500px] mx-auto mb-8">
            <h2 className="font-serif text-[18px] font-light text-ink mb-4">What you'll verify:</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-[#1DC433] text-[16px] flex-shrink-0" />
                <span className="text-[14px] font-light text-[#666]">Identity verification</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-[#1DC433] text-[16px] flex-shrink-0" />
                <span className="text-[14px] font-light text-[#666]">Proof of funds or credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-[#1DC433] text-[16px] flex-shrink-0" />
                <span className="text-[14px] font-light text-[#666]">Address verification</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="bi bi-check-circle-fill text-[#1DC433] text-[16px] flex-shrink-0" />
                <span className="text-[14px] font-light text-[#666]">Blockchain wallet linking</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <p className="text-[13px] font-light text-[#AAA] max-w-[500px] mx-auto">
            We're preparing a seamless verification experience. Check back soon!
          </p>
        </div>
      </main>
    </div>
  )
}
