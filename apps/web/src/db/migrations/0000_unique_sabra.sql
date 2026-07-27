CREATE TABLE "ayah_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ayah_id" integer NOT NULL,
	"state" text DEFAULT 'new' NOT NULL,
	"box" integer DEFAULT 0,
	"due_date" date,
	"last_reviewed_at" timestamp,
	"memorized_at" timestamp,
	CONSTRAINT "ayah_status_user_id_ayah_id_unique" UNIQUE("user_id","ayah_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"mode" text,
	"start_date" date,
	"target_date" date,
	"pages_per_day" numeric,
	"rest_every" integer,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"locale" text DEFAULT 'ar',
	"tz" text DEFAULT 'Asia/Riyadh',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"date" date NOT NULL,
	"from_ayah" integer,
	"to_ayah" integer,
	"listens" integer DEFAULT 0,
	"repeats" integer DEFAULT 0,
	"recites" integer DEFAULT 0,
	"prayed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ayah_status" ADD CONSTRAINT "ayah_status_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;