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

export default function SignUpPage() {
  const { user, hasAdmin, isLoading, signUp } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (user) {
      router.replace("/books")
    } else if (hasAdmin) {
      // 系统管理员已存在，不允许二次注册，直接跳转登录
      router.replace("/signin")
    }
  }, [isLoading, user, hasAdmin, router])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim()) {
      setError("请输入姓名")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("请输入有效的邮箱地址")
      return
    }
    if (password.length < 6) {
      setError("密码至少 6 位")
      return
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致")
      return
    }
    setSubmitting(true)
    try {
      await signUp(name, email, password)
      router.replace("/books")
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试")
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
            <CardTitle>初始化系统管理员</CardTitle>
            <CardDescription>
              系统中尚无管理员，请先注册首个系统管理员账号
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="请输入姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                  autoComplete="new-password"
                  placeholder="至少 6 位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm">确认密码</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次输入密码"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <Loader2 className="animate-spin" />}
                注册
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          已有账号？
          <Link href="/signin" className="text-primary hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
