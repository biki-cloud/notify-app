import { pgSchema, serial, text, varchar, jsonb } from "drizzle-orm/pg-core";

// スキーマを定義
export const schema = pgSchema("notify_app");

// スキーマ内にテーブルを定義
export const records = schema.table("records", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 64 }).notNull(),
  date: varchar("date", { length: 32 }).notNull(), // ISO8601文字列で保存
  mood: jsonb("mood").notNull(), // string[]
  diary: text("diary").notNull(),
});

// 目標・習慣テーブル
export const goals = schema.table("goals", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 64 }).notNull(),
  habit: text("habit").notNull(),
  goal: text("goal").notNull(),
});

// ユーザー設定テーブル
export const user_settings = schema.table("user_settings", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 64 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  custom_message: text("custom_message").notNull(),
});

// Push通知購読テーブル
export const subscriptions = schema.table("subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  user_id: varchar("user_id", { length: 64 }),
  keys: jsonb("keys").notNull(), // {p256dh, auth}
});
