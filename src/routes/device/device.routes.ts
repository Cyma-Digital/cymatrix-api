import { Router } from "express"
import * as deviceController from "@/controllers/device/device.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdSchema,
} from "@/schemas/device/device.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

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

export default router
