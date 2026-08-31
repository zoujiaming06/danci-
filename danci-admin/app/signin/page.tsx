"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"

export default function SignInPage() {
  const { user, isLoading, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/books")
    }
  }, [isLoading, user, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!email.trim() || !password) {
      setError("请输入邮箱和密码")
      return
    }
    setSubmitting(true)
    try {
      await signIn(email, password)
      router.replace("/books")
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-heading text-lg font-semibold">单词书管理后台</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>管理员登录</CardTitle>
            <CardDescription>输入邮箱和密码登录管理后台</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="animate-spin" />}
                登录
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          还没有账号？
          <Link href="/signup" className="text-primary hover:underline">
            注册管理员
          </Link>
        </p>
      </div>
    </div>
  )
}
