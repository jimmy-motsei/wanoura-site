import React from 'react'

export default function AuthedLayout({children}:{children: React.ReactNode}){
  // TODO: add B2C session/role check & redirect
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="p-4 border-b bg-white">Maru • Dashboard</div>
        <div className="p-4">{children}</div>
      </body>
    </html>
  )
}
