import Link from 'next/link'
import { prisma } from '@maru/db/src/client'

export const dynamic = 'force-dynamic'

export default async function ConsultantQueue() {
  const candidates = await prisma.candidateProfile
    .findMany({
      include: {
        cvs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        cvs: { _max: { createdAt: 'desc' } }
      }
    })
    .catch(() => [])

  if (!candidates.length) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600">
        No candidates in the queue yet. Ask seekers to upload a CV or import profiles from HubSpot.
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Assessment Queue</h3>
          <p className="text-sm text-slate-500">Review the latest CV drop-offs and move them through the pipeline.</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Latest CV</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {candidates.map((candidate) => {
              const latestCv = candidate.cvs[0]
              return (
                <tr key={candidate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{candidate.userId}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{candidate.summary ?? 'Not yet parsed'}</td>
                  <td className="px-4 py-3">
                    {latestCv ? (
                      <Link
                        href={latestCv.blobUrl}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View CV
                      </Link>
                    ) : (
                      <span className="text-slate-400">Pending upload</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/consultant/applications?candidate=${candidate.id}`}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Open board
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
