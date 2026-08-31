import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { adminSessions, adminUsers } from "@/db/schema"
import {
  generateSessionToken,
  SESSION_COOKIE_NAME,
  sessionExpiresAt,
  sha256,
  toPublicUser,
  verifyPassword,
} from "@/lib/session"

const SESSION_MAX_AGE = 7 * 24 * 60 * 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")

    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 })
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1)

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "该账号已被停用" }, { status: 403 })
    }

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
    console.error("signin error:", err)
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 })
  }
}
