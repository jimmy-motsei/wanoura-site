'use client'

import { ReactNode } from 'react'

export function RoleGuard({
  role,
  allow,
  children,
  fallback
}: {
  role: string
  allow: string[]
  children: ReactNode
  fallback?: ReactNode
}) {
  if (allow.includes(role) || allow.includes('*')) {
    return <>{children}</>
  }

  return <>{fallback ?? null}</>
}
