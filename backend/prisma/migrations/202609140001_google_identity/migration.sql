ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "googleSub" TEXT;
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");
