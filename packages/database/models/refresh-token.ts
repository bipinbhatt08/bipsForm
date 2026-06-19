import {
  pgTable,
  uuid,
  timestamp,
  text
  
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";



export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  token : text('token').unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})


export type SelectRefreshToken = typeof refreshTokensTable.$inferSelect;
export type InsertRefreshToken = typeof refreshTokensTable.$inferInsert;
