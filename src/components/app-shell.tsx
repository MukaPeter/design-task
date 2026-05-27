import React from 'react'

interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebar}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
