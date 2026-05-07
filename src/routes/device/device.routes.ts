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
} from "@/schemas/device/device.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.get(
  "/:code/data",
  validateParams(deviceCodeSchema),
  deviceController.getDeviceData,
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

export default router
