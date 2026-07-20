-- CreateTable
CREATE TABLE "group_device" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,

    CONSTRAINT "group_device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_device_group_id_device_id_key" ON "group_device"("group_id", "device_id");

-- AddForeignKey
ALTER TABLE "group_device" ADD CONSTRAINT "group_device_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_device" ADD CONSTRAINT "group_device_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
