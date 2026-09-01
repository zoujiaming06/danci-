import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { books } from "@/db/schema"
import { getUserOrError } from "@/lib/route-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserOrError(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await request.json().catch(() => null)
  const title = String(body?.title ?? "").trim()
  const wordCount = Number(body?.wordCount)
  const coverUrl = String(body?.coverUrl ?? "").trim() || null
  const bookId = String(body?.bookId ?? "").trim()
  const tags = String(body?.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean)

  if (!title || !bookId || !Number.isInteger(wordCount) || wordCount < 0) {
    return NextResponse.json({ error: "请填写正确的单词书信息" }, { status: 400 })
  }

  try {
    const [book] = await db
      .update(books)
      .set({ title, wordCount, coverUrl, bookId, tags, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning()

    if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 })
    return NextResponse.json({ book })
  } catch (error) {
    if (String(error).includes("books_book_id_unique")) {
      return NextResponse.json({ error: "bookId 已存在" }, { status: 409 })
    }
    console.error("update book error:", error)
    return NextResponse.json({ error: "更新失败，请重试" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserOrError(request)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  await db.delete(books).where(eq(books.id, id))
  return NextResponse.json({ ok: true })
}
