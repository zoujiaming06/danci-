"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"

export default function HomePage() {
  const { user, hasAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (user) {
      router.replace("/books")
    } else if (hasAdmin) {
      router.replace("/signin")
    } else {
      router.replace("/signup")
    }
  }, [isLoading, user, hasAdmin, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
