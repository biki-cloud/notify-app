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
