interface Props {
  params: { jobId: string }
}

export default function ProviderShortlist({ params }: Props) {
  return (
    <section>
      <h3 className="text-lg font-semibold">Shortlist for Job {params.jobId}</h3>
      <p className="mt-2 text-sm text-gray-600">Curate candidate shortlists and share with hiring managers.</p>
    </section>
  )
}
