-- CreateTable
CREATE TABLE "schedule" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "custom_fields" JSONB NOT NULL,
    "weekdays" JSONB NOT NULL,
    "start_time" VARCHAR(5),
    "end_time" VARCHAR(5),
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" INTEGER,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" INTEGER,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
