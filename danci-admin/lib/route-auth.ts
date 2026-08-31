import "server-only"

import { NextRequest, NextResponse } from "next/server"

import { ROLE_SUPER_ADMIN } from "@/lib/auth"
import { getUserByToken, SESSION_COOKIE_NAME } from "@/lib/session"

// 校验当前请求是否已登录且为系统管理员。
// 返回 NextResponse 表示鉴权失败，返回用户行表示通过。
export async function getSuperAdminOrError(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const user = token ? await getUserByToken(token) : null
  if (!user || user.role !== ROLE_SUPER_ADMIN) {
    return NextResponse.json({ error: "无权限访问" }, { status: 403 })
  }
  return user
}
