import { NextRequest, NextResponse } from "next/server"
import { desc, ilike, or, eq } from "drizzle-orm"

import { db } from "@/db"
import { books } from "@/db/schema"
import { getUserOrError } from "@/lib/route-auth"

export async function GET(request: NextRequest) {
  const auth = await getUserOrError(request)
  if (auth instanceof NextResponse) return auth

  const query = request.nextUrl.searchParams.get("q")?.trim()
  const rows = await db
    .select()
    .from(books)
    .where(query ? or(ilike(books.title, `%${query}%`), ilike(books.bookId, `%${query}%`)) : undefined)
    .orderBy(desc(books.createdAt))

  return NextResponse.json({ books: rows })
}

export async function POST(request: NextRequest) {
  const auth = await getUserOrError(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json().catch(() => null)
    const title = String(body?.title ?? "").trim()
    const wordCount = Number(body?.wordCount)
    const coverUrl = String(body?.coverUrl ?? "").trim() || null
    const bookId = String(body?.bookId ?? "").trim()
    const tags = String(body?.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!title || !bookId || !Number.isInteger(wordCount) || wordCount < 0) {
      return NextResponse.json({ error: "请填写正确的单词书信息" }, { status: 400 })
    }

    const [book] = await db
      .insert(books)
      .values({ title, wordCount, coverUrl, bookId, tags })
      .returning()

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    if (String(error).includes("books_book_id_unique")) {
      return NextResponse.json({ error: "bookId 已存在" }, { status: 409 })
    }
    console.error("create book error:", error)
    return NextResponse.json({ error: "创建失败，请重试" }, { status: 500 })
  }
}
