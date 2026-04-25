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
  status: text("status", { enum: ["draft", "active", "completed", "cancelled"] }).default("draft").notNull(),
  max_participants: integer("max_participants").default(0).notNull(),
  qr_anchor_url: text("qr_anchor_url"),
  // 초기 횟수 프리셋 설정
  initial_hearts: integer("initial_hearts").default(3).notNull(),
  initial_cupids: integer("initial_cupids").default(2).notNull(),
  preset_type: text("preset_type", { enum: ["general", "active", "custom"] }).default("general").notNull(),
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

// 4. 참여자 (participants) 테이블
export const participants = pgTable("participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  party_id: uuid("party_id").references(() => parties.id, { onDelete: "cascade" }).notNull(),
  anonymous_id: text("anonymous_id").unique().notNull(), // 디바이스 식별자
  nickname: text("nickname"),
  nickname_change_count: integer("nickname_change_count").default(0).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "banned"] }).default("pending").notNull(),
  // 잔여 횟수 관리
  hearts_count: integer("hearts_count").default(0).notNull(),
  cupids_count: integer("cupids_count").default(0).notNull(),
  is_first_entry: integer("is_first_entry").default(1).notNull(), // 1: 참, 0: 거짓
  is_second_entry: integer("is_second_entry").default(0).notNull(),
  last_active: timestamp("last_active", { withTimezone: true, mode: "date" }).defaultNow(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 5. 상호작용 (interactions) 테이블 - 호감도/큐피드
export const interactions = pgTable("interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  party_id: uuid("party_id").references(() => parties.id, { onDelete: "cascade" }).notNull(),
  sender_id: uuid("sender_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  receiver_id: uuid("receiver_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  type: text("type", { enum: ["heart", "cupid"] }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 6. 쪽지 (messages) 테이블
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  party_id: uuid("party_id").references(() => parties.id, { onDelete: "cascade" }).notNull(),
  sender_id: uuid("sender_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  receiver_id: uuid("receiver_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  is_read: integer("is_read").default(0).notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// 7. 닉네임 변경 로그 (nickname_logs)
export const nicknameLogs = pgTable("nickname_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  participant_id: uuid("participant_id").references(() => participants.id, { onDelete: "cascade" }).notNull(),
  old_nickname: text("old_nickname"),
  new_nickname: text("new_nickname").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});
