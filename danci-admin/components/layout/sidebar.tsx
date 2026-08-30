"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Users, LogOut, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  { href: "/books", label: "单词书管理", icon: BookOpen },
  { href: "/admin-users", label: "管理员管理", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <span className="font-heading text-sm font-semibold">单词书管理后台</span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        <Separator />
        <div className="flex items-center gap-2 px-1 text-sm text-sidebar-foreground/70">
          <Mail className="size-4 shrink-0" />
          <span className="truncate" title={user?.email}>
            {user?.email}
          </span>
        </div>
        <Button
          variant="ghost"
          className="justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          退出登录
        </Button>
      </div>
    </aside>
  )
}