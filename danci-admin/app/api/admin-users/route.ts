import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { adminUsers } from "@/db/schema"
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/auth"
import { getSuperAdminOrError } from "@/lib/route-auth"
import { hashPassword, toPublicUser } from "@/lib/session"

export async function GET(request: NextRequest) {
  const auth = await getSuperAdminOrError(request)
  if (auth instanceof NextResponse) return auth

  const users = await db.select().from(adminUsers).orderBy(adminUsers.createdAt)
  return NextResponse.json({ users: users.map(toPublicUser) })
}

export async function POST(request: NextRequest) {
  const auth = await getSuperAdminOrError(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json().catch(() => null)
    const name = String(body?.name ?? "").trim()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")
    const role = body?.role

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "请填写完整信息，密码至少 6 位" },
        { status: 400 }
      )
    }

    if (role !== ROLE_ADMIN && role !== ROLE_SUPER_ADMIN) {
      return NextResponse.json({ error: "无效的角色类型" }, { status: 400 })
    }

    const [existing] = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1)

    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const [user] = await db
      .insert(adminUsers)
      .values({ name, email, passwordHash, role })
      .returning()

    return NextResponse.json({ user: toPublicUser(user) })
  } catch (err) {
    console.error("create admin error:", err)
    return NextResponse.json({ error: "创建失败，请重试" }, { status: 500 })
  }
}
