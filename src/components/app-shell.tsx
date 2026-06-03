'use client'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {children}
    </div>
  )
}
