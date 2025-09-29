import { prisma } from '@maru/db/src/client'

export async function getCandidateAssets(candidateId: string) {
  return prisma.cvAsset.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
}
