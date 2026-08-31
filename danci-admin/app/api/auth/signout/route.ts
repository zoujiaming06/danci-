import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { adminSessions } from "@/db/schema"
import { SESSION_COOKIE_NAME, sha256 } from "@/lib/session"

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, sha256(token)))
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
