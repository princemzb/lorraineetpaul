-- CreateTable
CREATE TABLE "CeremonyConfig" (
    "id" TEXT NOT NULL,
    "ceremony" "Ceremony" NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '💍',
    "description" TEXT,
    "address" TEXT,
    "date" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CeremonyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CeremonyConfig_ceremony_key" ON "CeremonyConfig"("ceremony");

