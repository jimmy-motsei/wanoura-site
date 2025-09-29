'use client'

import { ReactNode } from 'react'

interface AppShellProps {
  header?: ReactNode
  nav?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function AppShell({ header, nav, footer, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {header ? <header className="border-b bg-white/90 backdrop-blur p-4 shadow-sm">{header}</header> : null}
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {nav ? <aside className="hidden w-64 shrink-0 md:block">{nav}</aside> : null}
        <main className="flex-1 space-y-6">{children}</main>
      </div>
      {footer ? <footer className="border-t bg-white p-4 text-sm text-slate-500">{footer}</footer> : null}
    </div>
  )
}
