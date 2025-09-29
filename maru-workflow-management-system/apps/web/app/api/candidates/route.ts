import { prisma } from '@maru/db/src/client'
export async function GET(){
  const candidates = await prisma.candidateProfile.findMany({ take: 50 })
  return Response.json(candidates)
}
