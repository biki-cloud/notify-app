CREATE TABLE "notify_app"."subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"user_id" varchar(64),
	"keys" jsonb NOT NULL,
	CONSTRAINT "subscriptions_endpoint_unique" UNIQUE("endpoint")
);
