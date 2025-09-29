import { prisma } from '@maru/db/src/client'
import { CreateJobSchema } from '@maru/core/src/validation'

export async function GET(){
  const jobs = await prisma.job.findMany({ take: 50, orderBy: { createdAt: 'desc' } })
  return Response.json(jobs)
}

export async function POST(req:Request){
  const body = await req.json()
  const parsed = CreateJobSchema.safeParse(body)
  if(!parsed.success) return new Response(JSON.stringify(parsed.error.format()), { status: 400 })
  const job = await prisma.job.create({ data: { ...parsed.data, createdBy: 'demo' } })
  return Response.json(job, { status: 201 })
}
