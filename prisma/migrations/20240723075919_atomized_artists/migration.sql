-- Reconstructed from git history (commit 74decea, "artist is now atomic table") to
-- match the migration Postgres already recorded as applied under this name/timestamp.
-- This file was never re-run against that database - it exists so `prisma migrate deploy`
-- builds a fresh database to the same schema the live database already has.
-- DropForeignKey
ALTER TABLE "_tagTotrack" DROP CONSTRAINT "_tagTotrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_tagTotrack" DROP CONSTRAINT "_tagTotrack_B_fkey";

-- DropForeignKey
ALTER TABLE "_presetTotrack" DROP CONSTRAINT "_presetTotrack_A_fkey";

-- DropForeignKey
ALTER TABLE "_presetTotrack" DROP CONSTRAINT "_presetTotrack_B_fkey";

-- AlterTable
ALTER TABLE "track" DROP CONSTRAINT "track_pkey",
DROP COLUMN "artist",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "secondsDuration",
DROP COLUMN "updatedAt",
ADD COLUMN     "artist_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "track_id" SERIAL NOT NULL,
ADD CONSTRAINT "track_pkey" PRIMARY KEY ("track_id");

-- AlterTable
ALTER TABLE "tag" DROP CONSTRAINT "tag_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tag_id" SERIAL NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id");

-- AlterTable
ALTER TABLE "preset" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_tagTotrack";

-- DropTable
DROP TABLE "_presetTotrack";

-- CreateTable
CREATE TABLE "artist" (
    "artist_id" SERIAL NOT NULL,
    "name" VARCHAR(256) NOT NULL,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("artist_id")
);

-- CreateTable
CREATE TABLE "_tag_to_track" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_preset_to_track" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_tag_to_track_AB_unique" ON "_tag_to_track"("A", "B");

-- CreateIndex
CREATE INDEX "_tag_to_track_B_index" ON "_tag_to_track"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_preset_to_track_AB_unique" ON "_preset_to_track"("A", "B");

-- CreateIndex
CREATE INDEX "_preset_to_track_B_index" ON "_preset_to_track"("B");

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artist"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag_to_track" ADD CONSTRAINT "_tag_to_track_A_fkey" FOREIGN KEY ("A") REFERENCES "tag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag_to_track" ADD CONSTRAINT "_tag_to_track_B_fkey" FOREIGN KEY ("B") REFERENCES "track"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_preset_to_track" ADD CONSTRAINT "_preset_to_track_A_fkey" FOREIGN KEY ("A") REFERENCES "preset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_preset_to_track" ADD CONSTRAINT "_preset_to_track_B_fkey" FOREIGN KEY ("B") REFERENCES "track"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;
