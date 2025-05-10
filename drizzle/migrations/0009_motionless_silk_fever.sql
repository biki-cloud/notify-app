CREATE TABLE "notify_app"."habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ideal_habits" text[] NOT NULL,
	"bad_habits" text[] NOT NULL,
	"new_habits" text[] NOT NULL,
	"tracking_habits" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "habits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notify_app"."self_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"strengths" text[] NOT NULL,
	"weaknesses" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "self_analysis_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notify_app"."goals" ADD COLUMN "short_term_goals" text[];
ALTER TABLE "notify_app"."goals" ADD COLUMN "mid_term_goals" text[];
ALTER TABLE "notify_app"."goals" ADD COLUMN "long_term_goals" text[];
ALTER TABLE "notify_app"."goals" ADD COLUMN "life_goals" text[];
ALTER TABLE "notify_app"."goals" ADD COLUMN "core_values" text[];
ALTER TABLE "notify_app"."goals" ADD COLUMN "created_at" timestamp DEFAULT now();
ALTER TABLE "notify_app"."goals" ADD COLUMN "updated_at" timestamp DEFAULT now();

UPDATE "notify_app"."goals" SET
  "short_term_goals" = '{}',
  "mid_term_goals" = '{}',
  "long_term_goals" = '{}',
  "life_goals" = '{}',
  "core_values" = '{}'
WHERE "short_term_goals" IS NULL OR "mid_term_goals" IS NULL OR "long_term_goals" IS NULL OR "life_goals" IS NULL OR "core_values" IS NULL;

ALTER TABLE "notify_app"."goals" ALTER COLUMN "short_term_goals" SET NOT NULL;
ALTER TABLE "notify_app"."goals" ALTER COLUMN "mid_term_goals" SET NOT NULL;
ALTER TABLE "notify_app"."goals" ALTER COLUMN "long_term_goals" SET NOT NULL;
ALTER TABLE "notify_app"."goals" ALTER COLUMN "life_goals" SET NOT NULL;
ALTER TABLE "notify_app"."goals" ALTER COLUMN "core_values" SET NOT NULL;

ALTER TABLE "notify_app"."goals" DROP COLUMN "habit";
ALTER TABLE "notify_app"."goals" DROP COLUMN "goal";
ALTER TABLE "notify_app"."goals" ADD CONSTRAINT "goals_user_id_unique" UNIQUE("user_id");