'use client'

import { ReactNode, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AppShell, PrimaryNav, NavItem } from '@maru/ui'
import type { Role } from '@maru/core'

interface NavSection {
  title: string
  roles: Role[]
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    roles: ['admin', 'consultant', 'provider', 'seeker'],
    items: [{ href: '/dashboard', label: 'Dashboard' }]
  },
  {
    title: 'Consultant',
    roles: ['admin', 'consultant'],
    items: [
      { href: '/consultant/queue', label: 'Assessment Queue' },
      { href: '/consultant/applications', label: 'Applications' }
    ]
  },
  {
    title: 'Provider',
    roles: ['admin', 'provider'],
    items: [
      { href: '/provider/jobs', label: 'Jobs' },
      { href: '/provider/shortlists', label: 'Shortlists' }
    ]
  },
  {
    title: 'Candidate',
    roles: ['admin', 'seeker'],
    items: [
      { href: '/seeker/profile', label: 'Profile' },
      { href: '/seeker/cvs', label: 'CVs' },
      { href: '/seeker/applications', label: 'Applications' }
    ]
  }
]

export function AuthedShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname()

  const sections = useMemo(
    () => NAV_SECTIONS.filter((section) => section.roles.includes(role)),
    [role]
  )

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-lg font-semibold text-slate-900">Maru Workflow</p>
        <p className="text-sm text-slate-500">Hiring operations control room</p>
      </div>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
        Role: {role}
      </span>
    </div>
  )

  const nav = (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {section.title}
          </p>
          <PrimaryNav items={section.items} activePath={pathname ?? undefined} />
        </div>
      ))}
    </div>
  )

  return (
    <AppShell header={header} nav={nav}>
      {children}
    </AppShell>
  )
}
