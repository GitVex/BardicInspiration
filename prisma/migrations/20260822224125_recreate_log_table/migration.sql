-- The `log` table (added in 20230519084442_added_log_field / renamed in
-- 20230519085322_changed_log_data_field_name_to_history) was dropped directly against the
-- database at some point with no corresponding migration or commit. `prisma/schema.prisma`
-- never stopped declaring it, so this recreates it in its last known shape.
-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "history" TEXT[],

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);
