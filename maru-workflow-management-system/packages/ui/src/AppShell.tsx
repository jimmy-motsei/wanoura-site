'use client'

import { ReactNode } from 'react'

export function AppShell({ header, children }: { header?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {header ? <header className="border-b bg-white p-4">{header}</header> : null}
      <main className="p-4">{children}</main>
    </div>
  )
}
