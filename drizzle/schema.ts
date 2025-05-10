import {
  pgSchema,
  serial,
  text,
  varchar,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// スキーマを定義
export const schema = pgSchema("notify_app");

// スキーマ内にテーブルを定義
export const records = schema.table("records", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  date: varchar("date", { length: 32 }).notNull(), // ISO8601文字列で保存
  mood: jsonb("mood").notNull(), // string[]
  diary: text("diary").notNull(),
});

// 目標テーブル（配列型カラム）
export const goals = schema.table("goals", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().unique(),
  short_term_goals: text("short_term_goals").array(),
  mid_term_goals: text("mid_term_goals").array(),
  long_term_goals: text("long_term_goals").array(),
  life_goals: text("life_goals").array(),
  core_values: text("core_values").array(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 自己分析テーブル（配列型カラム）
export const self_analysis = schema.table("self_analysis", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().unique(),
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// 習慣テーブル（配列型カラム）
export const habits = schema.table("habits", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().unique(),
  ideal_habits: text("ideal_habits").array(),
  bad_habits: text("bad_habits").array(),
  new_habits: text("new_habits").array(),
  tracking_habits: text("tracking_habits").array(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ユーザーテーブル
export const user = schema.table("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
});

// 通知設定テーブル
export const notify_settings = schema.table("notify_settings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  custom_message: text("custom_message").notNull(),
});

// Push通知購読テーブル
export const subscriptions = schema.table("subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  user_id: integer("user_id"),
  keys: jsonb("keys").notNull(), // {p256dh, auth}
});

// AIログテーブル
export const ai_logs = schema.table("ai_logs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  timestamp: varchar("timestamp", { length: 32 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  total_cost_jp_en: varchar("total_cost_jp_en", { length: 64 }).notNull(),
});
