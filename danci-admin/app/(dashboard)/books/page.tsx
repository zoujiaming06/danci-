"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { BookOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Book = {
  id: string
  title: string
  wordCount: number
  coverUrl: string | null
  bookId: string
  tags: string[]
  createdAt: string
}

type FormState = { title: string; wordCount: string; coverUrl: string; bookId: string; tags: string }
const emptyForm: FormState = { title: "", wordCount: "0", coverUrl: "", bookId: "", tags: "" }

async function requestJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || "请求失败")
  return data
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function loadBooks() {
    setLoading(true)
    try { setBooks((await requestJson("/api/books")).books) }
    catch (err) { setError(err instanceof Error ? err.message : "加载失败") }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadBooks() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? books.filter((book) => `${book.title} ${book.bookId}`.toLowerCase().includes(q)) : books
  }, [books, query])

  function openCreate() { setEditing(null); setForm(emptyForm); setError(""); setOpen(true) }
  function openEdit(book: Book) {
    setEditing(book)
    setForm({ title: book.title, wordCount: String(book.wordCount), coverUrl: book.coverUrl || "", bookId: book.bookId, tags: book.tags.join(",") })
    setError(""); setOpen(true)
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("")
    try {
      const url = editing ? `/api/books/${editing.id}` : "/api/books"
      await requestJson(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      setOpen(false); await loadBooks()
    } catch (err) { setError(err instanceof Error ? err.message : "保存失败") }
    finally { setSaving(false) }
  }

  async function removeBook(book: Book) {
    if (!window.confirm(`确定删除「${book.title}」吗？`)) return
    try { await requestJson(`/api/books/${book.id}`, { method: "DELETE" }); await loadBooks() }
    catch (err) { setError(err instanceof Error ? err.message : "删除失败") }
  }

  return <div className="flex flex-col gap-6">
    <div><h1 className="font-heading text-2xl font-semibold">单词书管理</h1><p className="text-sm text-muted-foreground">管理系统中的单词书及其学习内容。</p></div>
    <div className="flex items-center justify-between gap-3"><div className="relative w-full max-w-xs"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题或 bookId..." className="pl-8" /></div><Button onClick={openCreate}><Plus /> 新增单词书</Button></div>
    {error && <p className="text-sm text-destructive">{error}</p>}
    <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>封面</TableHead><TableHead>标题</TableHead><TableHead>单词数量</TableHead><TableHead>bookId</TableHead><TableHead>标签</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow><TableCell colSpan={6} className="h-24 text-center">加载中...</TableCell></TableRow> : filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">暂无单词书</TableCell></TableRow> : filtered.map((book) => <TableRow key={book.id}><TableCell>{book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="size-12 rounded object-cover" /> : <div className="flex size-12 items-center justify-center rounded bg-muted"><BookOpen className="size-5 text-muted-foreground" /></div>}</TableCell><TableCell className="font-medium">{book.title}</TableCell><TableCell>{book.wordCount.toLocaleString()}</TableCell><TableCell className="font-mono text-xs">{book.bookId}</TableCell><TableCell><div className="flex flex-wrap gap-1">{book.tags.map((tag) => <Badge variant="secondary" key={tag}>{tag}</Badge>)}</div></TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" aria-label="编辑" onClick={() => openEdit(book)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label="删除" onClick={() => void removeBook(book)}><Trash2 className="text-destructive" /></Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? "编辑单词书" : "新增单词书"}</DialogTitle></DialogHeader><form onSubmit={submit} className="grid gap-4"><div className="grid gap-2"><Label htmlFor="title">标题</Label><Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="wordCount">单词数量</Label><Input id="wordCount" required type="number" min="0" value={form.wordCount} onChange={(e) => setForm({ ...form, wordCount: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="coverUrl">封面 URL</Label><Input id="coverUrl" type="url" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="bookId">bookId</Label><Input id="bookId" required value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="tags">标签（逗号分隔）</Label><Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button><Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>
}
