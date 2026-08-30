"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Sidebar } from "@/components/layout/sidebar"

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="mx-auto w-full max-w-6xl p-6">{children}</div>
      </main>
    </div>
  )
}