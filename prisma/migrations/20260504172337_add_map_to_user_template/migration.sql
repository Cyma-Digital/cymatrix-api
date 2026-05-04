/*
  Warnings:

  - You are about to drop the `UserTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTemplate" DROP CONSTRAINT "UserTemplate_template_id_fkey";

-- DropForeignKey
ALTER TABLE "UserTemplate" DROP CONSTRAINT "UserTemplate_user_id_fkey";

-- DropTable
DROP TABLE "UserTemplate";

-- CreateTable
CREATE TABLE "user_template" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,

    CONSTRAINT "user_template_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_template" ADD CONSTRAINT "user_template_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_template" ADD CONSTRAINT "user_template_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
