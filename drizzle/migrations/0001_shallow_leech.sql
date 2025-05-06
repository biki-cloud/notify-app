CREATE TABLE "notify_app"."goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"habit" text NOT NULL,
	"goal" text NOT NULL
);
