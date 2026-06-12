/*
  Warnings:

  - You are about to drop the column `localization` on the `device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "device" DROP COLUMN "localization",
ADD COLUMN     "metrics" JSONB;
