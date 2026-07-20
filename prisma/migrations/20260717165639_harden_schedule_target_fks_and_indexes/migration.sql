-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_device_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_group_id_fkey";

-- CreateIndex
CREATE INDEX "group_device_device_id_idx" ON "group_device"("device_id");

-- CreateIndex
CREATE INDEX "schedule_group_id_idx" ON "schedule"("group_id");

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
