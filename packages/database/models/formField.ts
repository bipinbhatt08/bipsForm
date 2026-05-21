import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
  unique,
  jsonb
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const  fieldType = pgEnum("field_type", ["short_text","long_text","email", "number","single_select","multi_select","rating","date","phone",])


export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => formsTable.id).notNull(),

  label: varchar("label", { length: 100 }).notNull(),
  labelKey: varchar('label_key',{length:100}).notNull(),

  description: text('description'),

  placeholder: text("placeholder"),

  isRequired: boolean('is_required').default(false).notNull(),

  index: numeric('index',{scale:2}),//0.0, 9.9


  type: fieldType("type").notNull(),
 
  options: jsonb("options"),
  validations: jsonb("validations"),
  conditions: jsonb("conditions"),


  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
},(table)=>[
    unique().on(table.formId, table.index)
])


export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
