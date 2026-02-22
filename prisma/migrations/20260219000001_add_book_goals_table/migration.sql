-- CreateTable for Goal
CREATE TABLE "public"."book_goals" (
    "sid" VARCHAR NOT NULL,
    "creation_order_id" INTEGER NOT NULL,
    "datetime_created" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datetime_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "goal_type" VARCHAR NOT NULL,
    "target_value" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "book_goals_pkey" PRIMARY KEY ("sid")
);

-- Create sequence for auto-increment
CREATE SEQUENCE IF NOT EXISTS "book_goals_creation_order_id_seq";
ALTER TABLE "public"."book_goals"
  ALTER COLUMN "creation_order_id" SET DEFAULT nextval('book_goals_creation_order_id_seq');
ALTER SEQUENCE "book_goals_creation_order_id_seq" OWNED BY "public"."book_goals"."creation_order_id";
