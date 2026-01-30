/*
  Warnings:

  - You are about to drop the column `update_at` on the `brand` table. All the data in the column will be lost.
  - You are about to alter the column `document` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `VarChar(18)`.
  - Added the required column `updated_at` to the `brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "brand" DROP COLUMN "update_at",
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL,
ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "last_login" TIMESTAMPTZ(6),
ALTER COLUMN "document" SET DATA TYPE VARCHAR(18),
ALTER COLUMN "created_by" DROP NOT NULL,
ALTER COLUMN "updated_by" DROP NOT NULL,
ALTER COLUMN "deleted_at" DROP DEFAULT;
