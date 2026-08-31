import { NextRequest, NextResponse } from "next/server"

import {
  getUserByToken,
  hasAnyAdmin,
  SESSION_COOKIE_NAME,
  toPublicUser,
} from "@/lib/session"

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  const [user, adminExists] = await Promise.all([
    token ? getUserByToken(token) : Promise.resolve(null),
    hasAnyAdmin(),
  ])

  return NextResponse.json({
    user: user ? toPublicUser(user) : null,
    hasAdmin: adminExists,
  })
}
