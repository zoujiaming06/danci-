CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"cover_url" varchar(1000),
	"book_id" varchar(100) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_book_id_unique" UNIQUE("book_id")
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" varchar(100) NOT NULL,
	"word_rank" integer NOT NULL,
	"head_word" varchar(200) NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "words" ADD CONSTRAINT "words_book_id_books_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("book_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "books_book_id_idx" ON "books" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "words_book_id_idx" ON "words" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "words_head_word_idx" ON "words" USING btree ("head_word");