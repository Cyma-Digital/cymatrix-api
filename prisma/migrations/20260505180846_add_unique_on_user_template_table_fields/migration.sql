/*
  Warnings:

  - A unique constraint covering the columns `[user_id,template_id]` on the table `user_template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_template_user_id_template_id_key" ON "user_template"("user_id", "template_id");
