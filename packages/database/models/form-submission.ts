import {
  pgTable,
  uuid,
  timestamp,
  jsonb
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";


export const submissionTable = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),


  formId: uuid('form_id').references(() => formsTable.id).notNull(),

  values: jsonb('values').notNull(),

  createdAt: timestamp("created_at").defaultNow()
})


export type SelectSubmission = typeof submissionTable.$inferSelect;
export type InsertSubmission = typeof submissionTable.$inferInsert;
