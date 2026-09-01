import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("admin"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("admin_users_email_idx").on(table.email)]
)

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("admin_sessions_token_hash_idx").on(table.tokenHash),
    index("admin_sessions_user_idx").on(table.adminUserId),
  ]
)

export const books = pgTable(
  "books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    wordCount: integer("word_count").notNull().default(0),
    coverUrl: varchar("cover_url", { length: 1000 }),
    bookId: varchar("book_id", { length: 100 }).notNull().unique(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("books_book_id_idx").on(table.bookId)]
)

export const words = pgTable(
  "words",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookId: varchar("book_id", { length: 100 })
      .notNull()
      .references(() => books.bookId, { onDelete: "cascade" }),
    wordRank: integer("word_rank").notNull(),
    headWord: varchar("head_word", { length: 200 }).notNull(),
    content: jsonb("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("words_book_id_idx").on(table.bookId),
    index("words_head_word_idx").on(table.headWord),
  ]
)

export type AdminUserRow = typeof adminUsers.$inferSelect
export type BookRow = typeof books.$inferSelect
export type WordRow = typeof words.$inferSelect

