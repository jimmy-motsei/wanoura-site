import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { getContainerClient } from '@/lib/blob'
import { prisma } from '@maru/db/src/client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return new Response('No file', { status: 400 })

    const candidateId = params.id
    const bytes = Buffer.from(await file.arrayBuffer())
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase()
    const blobName = `candidates/${candidateId}/${randomUUID()}.${ext}`

    const container = getContainerClient()
    const block = container.getBlockBlobClient(blobName)
    await block.uploadData(bytes, {
      blobHTTPHeaders: { blobContentType: file.type || 'application/octet-stream' }
    })

    const asset = await prisma.cvAsset.create({
      data: {
        candidateId,
        blobUrl: block.url,
        checksum: undefined
      }
    })

    await prisma.candidateProfile.upsert({
      where: { userId: candidateId },
      update: {},
      create: { userId: candidateId, summary: null }
    })

    return Response.json({ ok: true, asset })
  } catch (e: any) {
    console.error(e)
    return new Response(`Upload failed: ${e.message}`, { status: 500 })
  }
}
