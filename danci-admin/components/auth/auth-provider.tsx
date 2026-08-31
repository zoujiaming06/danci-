"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { ROLE_SUPER_ADMIN, type AdminUser } from "@/lib/auth"

interface AuthContextValue {
  user: AdminUser | null
  hasAdmin: boolean
  isLoading: boolean
  isSuperAdmin: boolean
  signIn: (email: string, password: string) => Promise<AdminUser>
  signUp: (name: string, email: string, password: string) => Promise<AdminUser>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "请求失败")
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setUser(data.user ?? null)
        setHasAdmin(data.hasAdmin ?? false)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function signIn(email: string, password: string) {
    const data = await postJson("/api/auth/signin", { email, password })
    setUser(data.user)
    setHasAdmin(true)
    return data.user as AdminUser
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await postJson("/api/auth/signup", { name, email, password })
    setUser(data.user)
    setHasAdmin(true)
    return data.user as AdminUser
  }

  async function signOut() {
    await postJson("/api/auth/signout")
    setUser(null)
  }

  const isSuperAdmin = user?.role === ROLE_SUPER_ADMIN

  return (
    <AuthContext.Provider
      value={{ user, hasAdmin, isLoading, isSuperAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 内使用")
  }
  return ctx
}
