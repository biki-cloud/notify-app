CREATE SCHEMA "notify_app";
--> statement-breakpoint
CREATE TABLE "notify_app"."records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"date" varchar(32) NOT NULL,
	"mood" jsonb NOT NULL,
	"diary" text NOT NULL
);
