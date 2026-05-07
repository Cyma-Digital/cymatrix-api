/*
  Warnings:

  - You are about to drop the column `deviceType` on the `device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "device" DROP COLUMN "deviceType",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'matrix';
