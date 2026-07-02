-- DropForeignKey
ALTER TABLE "template_effect" DROP CONSTRAINT "template_effect_template_id_fkey";

-- RenameTable
ALTER TABLE "template_effect" RENAME TO "schedule_effect";

-- RenameColumn
ALTER TABLE "schedule_effect" RENAME COLUMN "template_id" TO "schedule_id";

-- RenamePrimaryKey
ALTER TABLE "schedule_effect" RENAME CONSTRAINT "template_effect_pkey" TO "schedule_effect_pkey";

-- RenameForeignKey
ALTER TABLE "schedule_effect" RENAME CONSTRAINT "template_effect_effect_id_fkey" TO "schedule_effect_effect_id_fkey";

-- RenameIndex
ALTER INDEX "template_effect_effect_id_template_id_key" RENAME TO "schedule_effect_effect_id_schedule_id_key";

-- AddForeignKey
ALTER TABLE "schedule_effect" ADD CONSTRAINT "schedule_effect_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
