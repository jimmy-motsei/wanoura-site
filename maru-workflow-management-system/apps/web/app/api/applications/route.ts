import { prisma } from '@maru/db/src/client'
export async function GET(){
  const apps = await prisma.application.findMany({ take: 50 })
  return Response.json(apps)
}
