import type { ReactNode } from 'react'
import type { Role } from '@maru/core'
import { AuthedShell } from '@/components/authed-shell'

const DEFAULT_ROLE: Role = 'consultant'

export default function AuthedLayout({ children }: { children: ReactNode }) {
  // TODO: replace role detection with Azure B2C session lookup
  const role = DEFAULT_ROLE

  return <AuthedShell role={role}>{children}</AuthedShell>
}
