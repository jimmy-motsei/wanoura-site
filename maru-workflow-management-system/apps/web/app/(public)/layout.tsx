import React from 'react'

export default function PublicLayout({children}:{children: React.ReactNode}){
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
