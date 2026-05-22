CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(55) NOT NULL,
	"description" varchar(500),
	"created_by" uuid NOT NULL,
	"is_locked" boolean DEFAULT false,
	"password_hash" varchar,
	"is_published" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"theme_id" text DEFAULT 'minimal',
	"slug" text NOT NULL,
	"response_limit" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;