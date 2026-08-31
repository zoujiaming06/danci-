"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ROLE_ADMIN,
  ROLE_LABELS,
  ROLE_SUPER_ADMIN,
  type AdminRole,
  type AdminUser,
} from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN")
}

interface FormState {
  name: string
  email: string
  password: string
  role: AdminRole
  isActive: boolean
}

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: ROLE_ADMIN,
  isActive: true,
}

async function requestJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "请求失败")
  }
  return data
}

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isSuperAdmin) {
      router.replace("/books")
      return
    }
    loadUsers()
  }, [authLoading, isSuperAdmin, router])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await requestJson("/api/admin-users")
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError("")
    setDialogOpen(true)
  }

  function openEdit(user: AdminUser) {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    })
    setFormError("")
    setDialogOpen(true)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("请填写姓名和邮箱")
      return
    }
    if (!editing && form.password.length < 6) {
      setFormError("密码至少 6 位")
      return
    }
    if (editing && form.password && form.password.length < 6) {
      setFormError("密码至少 6 位")
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await requestJson(`/api/admin-users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            password: form.password || undefined,
          }),
        })
      } else {
        await requestJson("/api/admin-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }),
        })
      }
      setDialogOpen(false)
      await loadUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "保存失败")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`确定删除管理员「${user.name}」吗？`)) return
    try {
      await requestJson(`/api/admin-users/${user.id}`, { method: "DELETE" })
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">管理员管理</h1>
        <p className="text-sm text-muted-foreground">
          管理后台的管理员账号及其角色权限。
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索管理员..."
            className="pl-8"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus /> 新增管理员
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">管理员</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无管理员
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (当前)
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === ROLE_SUPER_ADMIN ? "default" : "secondary"
                      }
                    >
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "outline" : "secondary"}>
                      {user.isActive ? "启用" : "停用"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="编辑"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="删除"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑管理员" : "新增管理员"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "修改管理员信息、角色或状态"
                : "创建一个新的管理员账号"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">姓名</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">邮箱</Label>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">
                密码{editing ? "（留空则不修改）" : ""}
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? "留空保持原密码" : "至少 6 位"}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-role">角色</Label>
              <select
                id="admin-role"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as AdminRole })
                }
                className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value={ROLE_ADMIN}>{ROLE_LABELS[ROLE_ADMIN]}</option>
                <option value={ROLE_SUPER_ADMIN}>
                  {ROLE_LABELS[ROLE_SUPER_ADMIN]}
                </option>
              </select>
            </div>

            {editing && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-active">状态</Label>
                <select
                  id="admin-active"
                  value={form.isActive ? "active" : "disabled"}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.value === "active" })
                  }
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="active">启用</option>
                  <option value="disabled">停用</option>
                </select>
              </div>
            )}

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
