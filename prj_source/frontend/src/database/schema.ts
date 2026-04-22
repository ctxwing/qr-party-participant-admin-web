import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. PartySession (파티 세션)
export const partySessions = sqliteTable("party_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  startTime: integer("start_time", { mode: "timestamp_ms" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp_ms" }).notNull(),
  status: text("status", { enum: ["READY", "ONGOING", "FINISHED"] }).notNull().default("READY"),
  participantLimit: integer("participant_limit").notNull().default(100),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 2. Participant (참여자)
export const participants = sqliteTable("participants", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull().references(() => partySessions.id),
  anonymousId: text("anonymous_id").notNull(), // Supabase Auth ID
  nickname: text("nickname").notNull(),
  nicknameChangeCount: integer("nickname_change_count").notNull().default(0),
  appStatus1: integer("app_status_1", { mode: "boolean" }).notNull().default(false),
  appStatus2: integer("app_status_2", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 3. Message (쪽지)
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull().references(() => partySessions.id),
  senderId: text("sender_id").notNull().references(() => participants.id),
  receiverId: text("receiver_id").notNull().references(() => participants.id),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 4. Interaction (상호작용 - 큐피트/호감도)
export const interactions = sqliteTable("interactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type", { enum: ["CUPID", "LIKE"] }).notNull(),
  senderId: text("sender_id").notNull().references(() => participants.id),
  receiverId: text("receiver_id").notNull().references(() => participants.id),
  weight: integer("weight").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 5. Alert (알림 - SOS/시스템)
export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull().references(() => partySessions.id),
  participantId: text("participant_id").notNull().references(() => participants.id),
  type: text("type", { enum: ["SOS", "SYSTEM"] }).notNull(),
  message: text("message").notNull(),
  isResolved: integer("is_resolved", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
