import { NextRequest, NextResponse } from "next/server"
import { and, eq, ne } from "drizzle-orm"

import { db } from "@/db"
import { adminUsers } from "@/db/schema"
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from "@/lib/auth"
import { getSuperAdminOrError } from "@/lib/route-auth"
import { hashPassword, toPublicUser } from "@/lib/session"

async function superAdminCount() {
  const rows = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.role, ROLE_SUPER_ADMIN))
  return rows.length
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getSuperAdminOrError(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const [target] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1)

    if (!target) {
      return NextResponse.json({ error: "管理员不存在" }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const name = body?.name !== undefined ? String(body.name).trim() : undefined
    const email = body?.email !== undefined ? String(body.email).trim().toLowerCase() : undefined
    const role = body?.role
    const isActive = body?.isActive !== undefined ? Boolean(body.isActive) : undefined
    const password = body?.password !== undefined ? String(body.password) : undefined

    if (role !== undefined && role !== ROLE_ADMIN && role !== ROLE_SUPER_ADMIN) {
      return NextResponse.json({ error: "无效的角色类型" }, { status: 400 })
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
    }
    if (password !== undefined && password.length > 0 && password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 })
    }

    // 防止把最后一个系统管理员降级或停用
    const isDemoting =
      target.role === ROLE_SUPER_ADMIN && role !== undefined && role !== ROLE_SUPER_ADMIN
    const isDisabling = target.role === ROLE_SUPER_ADMIN && isActive === false
    if ((isDemoting || isDisabling) && (await superAdminCount()) <= 1) {
      return NextResponse.json(
        { error: "至少需要保留一个系统管理员" },
        { status: 403 }
      )
    }

    if (email && email !== target.email) {
      const [dup] = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .where(and(eq(adminUsers.email, email), ne(adminUsers.id, id)))
        .limit(1)
      if (dup) {
        return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 })
      }
    }

    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    }
    if (name !== undefined) update.name = name
    if (email !== undefined) update.email = email
    if (role !== undefined) update.role = role
    if (isActive !== undefined) update.isActive = isActive
    if (password) update.passwordHash = await hashPassword(password)

    const [updated] = await db
      .update(adminUsers)
      .set(update)
      .where(eq(adminUsers.id, id))
      .returning()

    return NextResponse.json({ user: toPublicUser(updated) })
  } catch (err) {
    console.error("update admin error:", err)
    return NextResponse.json({ error: "更新失败，请重试" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getSuperAdminOrError(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    if (id === auth.id) {
      return NextResponse.json({ error: "不能删除当前登录账号" }, { status: 403 })
    }

    const [target] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1)

    if (!target) {
      return NextResponse.json({ error: "管理员不存在" }, { status: 404 })
    }

    if (target.role === ROLE_SUPER_ADMIN && (await superAdminCount()) <= 1) {
      return NextResponse.json(
        { error: "至少需要保留一个系统管理员" },
        { status: 403 }
      )
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("delete admin error:", err)
    return NextResponse.json({ error: "删除失败，请重试" }, { status: 500 })
  }
}
