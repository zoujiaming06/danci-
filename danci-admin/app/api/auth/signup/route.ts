import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { adminSessions, adminUsers } from "@/db/schema"
import { ROLE_SUPER_ADMIN } from "@/lib/auth"
import {
  generateSessionToken,
  hashPassword,
  hasAnyAdmin,
  SESSION_COOKIE_NAME,
  sessionExpiresAt,
  sha256,
  toPublicUser,
} from "@/lib/session"

const SESSION_MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const name = String(body?.name ?? "").trim()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "请填写完整信息，密码至少 6 位" },
        { status: 400 }
      )
    }

    if (await hasAnyAdmin()) {
      return NextResponse.json(
        { error: "系统管理员已存在，请直接登录" },
        { status: 403 }
      )
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
      .values({ name, email, passwordHash, role: ROLE_SUPER_ADMIN })
      .returning()

    const token = generateSessionToken()
    await db.insert(adminSessions).values({
      tokenHash: sha256(token),
      adminUserId: user.id,
      expiresAt: sessionExpiresAt(),
    })

    const response = NextResponse.json({ user: toPublicUser(user) })
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    })
    return response
  } catch (err) {
    console.error("signup error:", err)
    return NextResponse.json({ error: "注册失败，请重试" }, { status: 500 })
  }
}
