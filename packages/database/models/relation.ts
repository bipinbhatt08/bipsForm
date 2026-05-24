import { relations } from "drizzle-orm"
import { usersTable } from "./user"
import { formsTable } from "./form"
import { formFieldsTable } from "./form-field"
import { submissionTable } from "./form-submission"

export const usersRelations = relations(usersTable, ({ many }) => ({
  forms: many(formsTable),
}))

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [formsTable.createdBy],
    references: [usersTable.id],
  }),
  fields: many(formFieldsTable),
  submissions: many(submissionTable),
}))

export const formFieldsRelations = relations(formFieldsTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [formFieldsTable.formId],
    references: [formsTable.id],
  }),
}))

export const submissionsRelations = relations(submissionTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [submissionTable.formId],
    references: [formsTable.id],
  }),
}))