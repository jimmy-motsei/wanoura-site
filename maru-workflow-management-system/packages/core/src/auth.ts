// Minimal role helper (replace with proper B2C token validation later)
export type Role = 'consultant'|'seeker'|'provider'|'admin'
export function can(role:Role, action:string){
  const matrix: Record<Role, string[]> = {
    admin: ['*'],
    consultant: ['read:candidates','write:applications','read:jobs'],
    provider: ['write:jobs','read:shortlists'],
    seeker: ['write:applications','read:self']
  }
  return matrix[role]?.includes('*') || matrix[role]?.includes(action) || false
}
