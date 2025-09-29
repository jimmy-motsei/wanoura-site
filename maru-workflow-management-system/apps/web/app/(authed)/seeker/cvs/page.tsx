import Link from 'next/link'
import { UploadCvForm } from '@/components/upload-cv-form'
import { getCandidateAssets } from '@/lib/candidates'

export const dynamic = 'force-dynamic'

export default async function SeekerCvs() {
  // TODO: replace hard-coded candidate ID with authenticated user once B2C is wired up
  const candidateId = 'demo-user'

  const assets = await getCandidateAssets(candidateId)

  return (
    <section className="space-y-8">
      <header>
        <h3 className="text-lg font-semibold text-slate-900">My CVs</h3>
        <p className="text-sm text-slate-500">Upload the latest version of your CV so consultants can triage it quickly.</p>
      </header>

      <UploadCvForm candidateId={candidateId} />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent uploads
        </h4>
        {assets.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500">
            No CVs uploaded yet. Use the form above to add your first CV.
          </p>
        ) : (
          <ul className="space-y-3">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{asset.blobUrl.split('/').pop()}</p>
                  <p className="text-xs text-slate-500">
                    Uploaded {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(asset.createdAt)}
                  </p>
                </div>
                <Link
                  href={asset.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
