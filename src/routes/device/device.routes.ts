import { Router } from "express"
import * as deviceController from "@/controllers/device/device.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdSchema,
  assignOwnerSchema,
  updateDeviceOverridesSchema,
  deviceCodeSchema,
  updateDeviceMetricsSchema,
} from "@/schemas/device/device.schemas"
import { authenticate } from "@/middlewares/auth.middleware"
import { updateDeviceDataSchema } from "@/schemas/device/device.schemas"

const router = Router()

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

export default router
