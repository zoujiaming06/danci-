import "server-only"

import { NextRequest, NextResponse } from "next/server"

import { ROLE_SUPER_ADMIN } from "@/lib/auth"
import { getUserByToken, SESSION_COOKIE_NAME } from "@/lib/session"

export async function getUserOrError(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const user = token ? await getUserByToken(token) : null
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }
  return user
}
export async function getSuperAdminOrError(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const user = token ? await getUserByToken(token) : null
  if (!user || user.role !== ROLE_SUPER_ADMIN) {
    return NextResponse.json({ error: "无权限访问" }, { status: 403 })
  }
  return user
}

