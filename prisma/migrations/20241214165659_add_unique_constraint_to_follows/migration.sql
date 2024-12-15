/*
  Warnings:

  - A unique constraint covering the columns `[followerId,followingId]` on the table `UserFollows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserFollows_followerId_followingId_key" ON "UserFollows"("followerId", "followingId");
