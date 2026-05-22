import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  integer
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";


export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 55 }).notNull(),
  description: varchar("description",{length:500}),


  createdBy: uuid('created_by').references(() => usersTable.id).notNull(),

  isLocked: boolean("is_locked").default(false),
  passwordHash: varchar("password_hash"),

  isPublished: boolean("is_published").default(false),
  isPublic: boolean("is_public").default(false),


  themeId: text("theme_id").default("minimal"),

  slug: text("slug").notNull().unique(),

  responseLimit: integer('response_limit'),

  expiresAt: timestamp("expires_at"),




  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
})


export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
