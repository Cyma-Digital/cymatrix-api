-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_device_id_fkey";

-- AlterTable
ALTER TABLE "schedule" ADD COLUMN     "group_id" INTEGER,
ALTER COLUMN "device_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
