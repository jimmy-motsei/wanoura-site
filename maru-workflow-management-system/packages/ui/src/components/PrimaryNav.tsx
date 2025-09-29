'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export interface NavItem {
  href: string
  label: string
  icon?: ReactNode
  description?: string
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function PrimaryNav({ items, activePath }: { items: NavItem[]; activePath?: string }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = activePath ? activePath === item.href || activePath.startsWith(`${item.href}/`) : false
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            )}
          >
            {item.icon}
            <span className="flex-1">
              {item.label}
              {item.description ? <span className="block text-xs font-normal text-slate-500 group-hover:text-slate-200/90">{item.description}</span> : null}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
