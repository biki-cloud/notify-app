CREATE SCHEMA IF NOT EXISTS "notify_app";
--> statement-breakpoint
CREATE TABLE "notify_app"."ai_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"timestamp" varchar(32) NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"total_cost_jp_en" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notify_app"."goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"habit" text NOT NULL,
	"goal" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notify_app"."notify_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"custom_message" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notify_app"."records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" varchar(32) NOT NULL,
	"mood" jsonb NOT NULL,
	"diary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notify_app"."subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"user_id" integer,
	"keys" jsonb NOT NULL,
	CONSTRAINT "subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "notify_app"."user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
