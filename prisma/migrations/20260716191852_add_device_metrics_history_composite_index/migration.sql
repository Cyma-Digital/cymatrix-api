-- DropIndex
DROP INDEX "device_metrics_history_deviceId_idx";

-- CreateIndex
CREATE INDEX "device_metrics_history_deviceId_createdAt_idx" ON "device_metrics_history"("deviceId", "createdAt");
