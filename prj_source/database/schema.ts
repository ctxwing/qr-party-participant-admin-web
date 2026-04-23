/**
 * 데이터베이스 스키마 정의 (Drizzle ORM)
 * - parties: 파티 생명주기 및 기본 정보
 * - announcements: 실시간 공지 발송 내역
 * - external_reservations: 외부 예약 연동 내역
 * 작성자: ctxwing@gmail.com
 */
import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. 파티 (parties) 테이블
export const parties = pgTable("parties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  start_at: timestamp("start_at", { withTimezone: true, mode: "date" }).notNull(),
  end_at: timestamp("end_at", { withTimezone: true, mode: "date" }).notNull(),
  status: text("status", { enum: ["draft", "active", "completed"] }).default("draft").notNull(),
  max_participants: integer("max_participants").default(0).notNull(),
  qr_anchor_url: text("qr_anchor_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 2. 실시간 공지 (announcements) 테이블
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  party_id: uuid("party_id").references(() => parties.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["info", "emergency", "notice"] }).default("info").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 3. 외부 예약 연동 (external_reservations) 테이블
export const externalReservations = pgTable("external_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  party_id: uuid("party_id").references(() => parties.id, { onDelete: "cascade" }).notNull(),
  external_id: text("external_id"), // 외부 시스템 ID (예: WP ID)
  name: text("name").notNull(),
  phone_last4: text("phone_last4").notNull(),
  status: text("status"),
  synced_at: timestamp("synced_at", { withTimezone: true, mode: "date" }),
});
