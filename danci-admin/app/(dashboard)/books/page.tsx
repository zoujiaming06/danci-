"use client"

import { useMemo, useState } from "react"
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Book {
  id: string
  name: string
  description: string
  wordCount: number
  status: "已发布" | "草稿"
  createdAt: string
}

const initialBooks: Book[] = [
  {
    id: "1",
    name: "六级核心词汇",
    description: "大学英语六级高频核心词汇",
    wordCount: 2500,
    status: "已发布",
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    name: "考研英语词汇",
    description: "考研英语大纲必备词汇",
    wordCount: 5500,
    status: "已发布",
    createdAt: "2026-03-10",
  },
  {
    id: "3",
    name: "雅思词汇精选",
    description: "雅思考试高频场景词汇",
    wordCount: 3200,
    status: "草稿",
    createdAt: "2026-04-02",
  },
  {
    id: "4",
    name: "托福核心词汇",
    description: "托福听力与阅读核心词汇",
    wordCount: 1800,
    status: "已发布",
    createdAt: "2026-05-18",
  },
  {
    id: "5",
    name: "初中英语词汇",
    description: "初中阶段基础必备词汇",
    wordCount: 1600,
    status: "草稿",
    createdAt: "2026-06-20",
  },
]

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => b.name.toLowerCase().includes(q))
  }, [books, query])

  function removeBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">单词书管理</h1>
        <p className="text-sm text-muted-foreground">
          管理系统中所有的单词书及其学习内容。
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索单词书..."
            className="pl-8"
          />
        </div>
        <Button>
          <Plus /> 新增单词书
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">单词书</TableHead>
              <TableHead>单词数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无单词书
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{book.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {book.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{book.wordCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={book.status === "已发布" ? "default" : "secondary"}
                    >
                      {book.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{book.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="编辑">
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="删除"
                        onClick={() => removeBook(book.id)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}