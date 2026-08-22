-- Reconstructed to match the migration Postgres already recorded as applied under this
-- name/timestamp - applied a day after the artist atomization, once duplicate artist
-- names in the live data had been cleaned up enough to allow the constraint.
-- CreateIndex
CREATE UNIQUE INDEX "artist_name_key" ON "artist"("name");
