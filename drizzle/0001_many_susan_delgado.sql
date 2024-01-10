CREATE TABLE IF NOT EXISTS "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"is_active" boolean DEFAULT true,
	"created_by" varchar(256),
	"updated_by" varchar(256),
	"deleted_datetime" timestamp,
	"created_datetime" timestamp DEFAULT now(),
	"updated_datetime" timestamp DEFAULT now()
);
