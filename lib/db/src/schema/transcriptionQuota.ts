import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transcriptionQuotaTable = pgTable("transcription_quota", {
  rcAppUserId: text("rc_app_user_id").primaryKey(),
  monthKey: text("month_key").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTranscriptionQuotaSchema = createInsertSchema(transcriptionQuotaTable);
export type InsertTranscriptionQuota = z.infer<typeof insertTranscriptionQuotaSchema>;
export type TranscriptionQuota = typeof transcriptionQuotaTable.$inferSelect;
