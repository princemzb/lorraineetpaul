-- Remove DECLINED from RSVPStatus: an invitation that reaches the app is always confirmed
ALTER TYPE "RSVPStatus" RENAME TO "RSVPStatus_old";
CREATE TYPE "RSVPStatus" AS ENUM ('PENDING', 'CONFIRMED');
ALTER TABLE "Invitation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invitation" ALTER COLUMN "status" TYPE "RSVPStatus" USING ("status"::text::"RSVPStatus");
ALTER TABLE "Invitation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "RSVPStatus_old";

-- Drop accompanistCount: every guest registers individually now
ALTER TABLE "Invitation" DROP COLUMN "accompanistCount";
