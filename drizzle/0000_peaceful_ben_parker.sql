CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_by" varchar(256),
	"updated_by" varchar(256),
	"created_datetime" timestamp DEFAULT now(),
	"updated_datetime" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"image" varchar(256),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_by" varchar(256),
	"updated_by" varchar(256),
	"deleted_datetime" timestamp,
	"created_datetime" timestamp DEFAULT now(),
	"updated_datetime" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"middle_name" varchar(256),
	"suffix" varchar(256),
	"email" varchar(256) NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" varchar(256),
	"role_id" bigint,
	"created_by" varchar(256),
	"updated_by" varchar(256),
	"created_datetime" timestamp DEFAULT now(),
	"updated_datetime" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"post_id" serial NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" varchar(256),
	"updated_by" varchar(256),
	"deleted_datetime" timestamp,
	"created_datetime" timestamp DEFAULT now(),
	"updated_datetime" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
