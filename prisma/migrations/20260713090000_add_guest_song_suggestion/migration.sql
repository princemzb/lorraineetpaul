-- Chanson proposée par l'invité pour la playlist du mariage (facultatif)
ALTER TABLE "Guest" ADD COLUMN "songTitle" TEXT;
ALTER TABLE "Guest" ADD COLUMN "songArtist" TEXT;
ALTER TABLE "Guest" ADD COLUMN "songYoutubeUrl" TEXT;
