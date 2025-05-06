CREATE TABLE "notify_app"."ai_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"timestamp" varchar(32) NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"total_cost_jp_en" varchar(64) NOT NULL
);
