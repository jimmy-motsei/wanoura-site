'use client'

import { ButtonHTMLAttributes } from 'react'

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-[#ffffff] shadow-sm transition-colors hover:bg-[#ADD8E6] hover:text-[#000000] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${className}`}
      {...props}
    />
  )
}
