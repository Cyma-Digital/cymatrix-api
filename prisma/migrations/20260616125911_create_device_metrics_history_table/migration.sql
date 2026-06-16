-- CreateTable
CREATE TABLE "device_metrics_history" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_metrics_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_metrics_history_deviceId_idx" ON "device_metrics_history"("deviceId");

-- CreateIndex
CREATE INDEX "device_metrics_history_createdAt_idx" ON "device_metrics_history"("createdAt");

-- AddForeignKey
ALTER TABLE "device_metrics_history" ADD CONSTRAINT "device_metrics_history_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
