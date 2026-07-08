-- AlterTable
ALTER TABLE "ContactMessage" DROP COLUMN "name",
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eventDate" TIMESTAMP(3),
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "guestCount" TEXT,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

