/*
  Warnings:

  - You are about to drop the `VideoView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoView" DROP CONSTRAINT "VideoView_videoId_fkey";

-- AlterTable
ALTER TABLE "Episode" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "VideoView";

-- CreateTable
CREATE TABLE "EpisodeView" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EpisodeView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeView_episodeId_ipAddress_key" ON "EpisodeView"("episodeId", "ipAddress");

-- AddForeignKey
ALTER TABLE "EpisodeView" ADD CONSTRAINT "EpisodeView_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
