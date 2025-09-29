import Link from 'next/link'
import { prisma } from '@maru/db/src/client'

export const dynamic = 'force-dynamic'

export default async function ConsultantApplications({ searchParams }: { searchParams?: Record<string, string> }) {
  const candidateFilter = searchParams?.candidate

  const applications = await prisma.application
    .findMany({
      where: candidateFilter ? { candidateId: candidateFilter } : undefined,
      include: {
        job: true,
        candidate: {
          select: {
            userId: true,
            summary: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    .catch(() => [])

  if (!applications.length) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600">
        No applications captured yet. Link candidates to jobs from the queue or import from HubSpot.
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Applications Board</h3>
          <p className="text-sm text-slate-500">Monitor candidate progress across live roles.</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{application.candidate.userId}</div>
                  <div className="text-xs text-slate-500">
                    {application.candidate.summary ?? 'No summary yet'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{application.job.title}</div>
                  <div className="text-xs text-slate-500">{application.job.orgId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {application.stage}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{application.score}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Intl.DateTimeFormat('en-ZA', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }).format(application.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
