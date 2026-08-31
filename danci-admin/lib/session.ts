import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { compare, hash } from "bcryptjs"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { adminSessions, adminUsers, type AdminUserRow } from "@/db/schema"
import { type AdminRole } from "@/lib/auth"

export const SESSION_COOKIE_NAME = "danci_admin_session"
export const SESSION_TTL_DAYS = 7

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed)
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

export function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
}

export function toPublicUser(row: AdminUserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as AdminRole,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getUserByToken(rawToken: string) {
  const tokenHash = sha256(rawToken)

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.tokenHash, tokenHash))
    .limit(1)

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null
  }

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, session.adminUserId))
    .limit(1)

  if (!user || !user.isActive) {
    return null
  }

  return user
}

export async function hasAnyAdmin(): Promise<boolean> {
  const rows = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .limit(1)
  return rows.length > 0
}
