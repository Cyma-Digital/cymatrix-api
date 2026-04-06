-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('Online', 'Offline');

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'Offline',
    "last_seen" TIMESTAMPTZ(6),
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zip_code" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" INTEGER,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_code_key" ON "device"("code");

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
