import { Router } from "express"
import * as deviceController from "@/controllers/device/device.controller"
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middlewares/validate.middleware"
import {
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdSchema,
  assignOwnerSchema,
  updateDeviceOverridesSchema,
  deviceCodeSchema,
  updateDeviceMetricsSchema,
  deviceMetricsHistoryQuerySchema,
} from "@/schemas/device/device.schemas"
import { authenticate } from "@/middlewares/auth.middleware"
import { rateLimit } from "@/middlewares/rateLimit.middleware"
import { updateDeviceDataSchema } from "@/schemas/device/device.schemas"

const router = Router()

// Per-user limit for the history endpoint — it can scan up to MAX limit rows
// per request. Exported so tests can reset the in-memory buckets.
export const metricsHistoryRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  keyFn: (req) => String(req.user!.userId),
})

router.get(
  "/:code/data",
  validateParams(deviceCodeSchema),
  deviceController.getDeviceData,
)

router.patch(
  "/:code/metrics",
  validateParams(deviceCodeSchema),
  validateBody(updateDeviceMetricsSchema),
  deviceController.updateDeviceMetrics,
)

router.use(authenticate)

router.post("/", validateBody(createDeviceSchema), deviceController.create)
router.get("/", deviceController.list)
router.get("/:id", validateParams(deviceIdSchema), deviceController.getById)
router.put(
  "/:id",
  validateParams(deviceIdSchema),
  validateBody(updateDeviceSchema),
  deviceController.update,
)
router.delete(
  "/:id",
  validateParams(deviceIdSchema),
  deviceController.deleteDevice,
)
router.patch(
  "/:id/owner",
  validateParams(deviceIdSchema),
  validateBody(assignOwnerSchema),
  deviceController.assignOwner,
)

router.patch(
  "/:id/overrides",
  validateParams(deviceIdSchema),
  validateBody(updateDeviceOverridesSchema),
  deviceController.updateOverrides,
)

router.patch(
  "/:id/data",
  validateParams(deviceIdSchema),
  validateBody(updateDeviceDataSchema),
  deviceController.updateDeviceData,
)

router.get(
  "/:id/metrics/history",
  metricsHistoryRateLimit,
  validateParams(deviceIdSchema),
  validateQuery(deviceMetricsHistoryQuerySchema),
  deviceController.getMetricsHistory,
)

export default router
