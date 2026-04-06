'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',   icon: 'bi-grid-fill',       label: 'Dashboard'    },
  { href: '/marketplace', icon: 'bi-briefcase-fill',  label: 'Marketplace'  },
  { href: '/marketplace', icon: 'bi-handshake-fill',  label: 'Deals',       matchHref: '/marketplace' },
  { href: '/leaderboard', icon: 'bi-trophy-fill',     label: 'Leaderboard'  },
]

// Show on talent pages
const TALENT_PATHS = ['/dashboard', '/marketplace', '/leaderboard', '/pod', '/profile', '/premium', '/kyc', '/notifications', '/u/']
const PROJECT_PATHS = ['/project']

export default function MobileNav() {
  const pathname = usePathname()

  const isTalent  = TALENT_PATHS.some(p => pathname.startsWith(p)) && !pathname.startsWith('/project')
  const isProject = PROJECT_PATHS.some(p => pathname.startsWith(p))

  if (!isTalent && !isProject) return null

  // For project dashboard use project-specific routes for Deals
  const items = isProject
    ? [
        { href: '/project',          icon: 'bi-grid-fill',      label: 'Dashboard'   },
        { href: '/marketplace',      icon: 'bi-briefcase-fill', label: 'Marketplace' },
        { href: '/project/create-deal', icon: 'bi-handshake-fill', label: 'Deals'    },
        { href: '/leaderboard',      icon: 'bi-trophy-fill',    label: 'Leaderboard' },
      ]
    : [
        { href: '/dashboard',   icon: 'bi-grid-fill',       label: 'Dashboard'   },
        { href: '/marketplace', icon: 'bi-briefcase-fill',  label: 'Marketplace' },
        { href: '/marketplace', icon: 'bi-handshake-fill',  label: 'Deals'       },
        { href: '/leaderboard', icon: 'bi-trophy-fill',     label: 'Leaderboard' },
      ]

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-[9800] bg-paper border-t border-black/[0.07] px-2 pb-safe"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-around">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/project' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-2.5 min-w-[60px] transition-colors"
            >
              <i className={`bi ${item.icon} text-[20px] transition-colors ${active ? 'text-green-dark' : 'text-[#AAA]'}`} />
              <span className={`font-mono text-[9px] tracking-[0.06em] uppercase transition-colors ${active ? 'text-green-dark' : 'text-[#CCC]'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
