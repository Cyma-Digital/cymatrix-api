/*
  Warnings:

  - You are about to drop the column `userId` on the `device` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "device" DROP CONSTRAINT "device_userId_fkey";

-- AlterTable
ALTER TABLE "device" DROP COLUMN "userId";
