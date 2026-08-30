"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  type AdminUser,
  getSessionUser,
  signInUser,
  signUpUser,
  clearSessionUser,
} from "@/lib/auth"

interface AuthContextValue {
  user: AdminUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AdminUser>
  signUp: (name: string, email: string, password: string) => Promise<AdminUser>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getSessionUser())
    setIsLoading(false)
  }, [])

  async function signIn(email: string, password: string) {
    const next = signInUser(email, password)
    setUser(next)
    return next
  }

  async function signUp(name: string, email: string, password: string) {
    const next = signUpUser(name, email, password)
    setUser(next)
    return next
  }

  function signOut() {
    clearSessionUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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