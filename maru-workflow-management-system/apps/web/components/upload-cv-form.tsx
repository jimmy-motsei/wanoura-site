'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UploadCvFormProps {
  candidateId: string
}

export function UploadCvForm({ candidateId }: UploadCvFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setStatus('uploading')
    setMessage('Uploading CV...')

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`/api/candidates/${candidateId}/cv`, {
        method: 'POST',
        body: form
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      setStatus('success')
      setMessage('Upload successful! The recruitment team will review shortly.')
      setFile(null)
      router.refresh()
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Upload failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="cv">
          Upload CV
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(event) => {
            const files = event.target.files
            setFile(files && files[0] ? files[0] : null)
          }}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
        <p className="text-xs text-slate-500">PDF or Word docs recommended. Max 5 MB.</p>
      </div>

      <button
        type="submit"
        disabled={!file || status === 'uploading'}
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === 'uploading' ? 'Uploading…' : 'Upload CV'}
      </button>

      {status !== 'idle' ? (
        <p
          className={
            status === 'error'
              ? 'text-sm font-medium text-red-600'
              : 'text-sm font-medium text-green-600'
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
