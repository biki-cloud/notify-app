CREATE TABLE "notify_app"."user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"type" varchar(32) NOT NULL,
	"custom_message" text NOT NULL
);
