ALTER TABLE "notify_app"."goals" ALTER COLUMN "short_term_goals" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."goals" ALTER COLUMN "mid_term_goals" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."goals" ALTER COLUMN "long_term_goals" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."goals" ALTER COLUMN "life_goals" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."goals" ALTER COLUMN "core_values" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."habits" ALTER COLUMN "ideal_habits" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."habits" ALTER COLUMN "bad_habits" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."habits" ALTER COLUMN "new_habits" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."habits" ALTER COLUMN "tracking_habits" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."self_analysis" ALTER COLUMN "strengths" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_app"."self_analysis" ALTER COLUMN "weaknesses" DROP NOT NULL;