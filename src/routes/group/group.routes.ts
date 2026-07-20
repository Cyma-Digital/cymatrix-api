import { Router } from "express"
import * as controller from "@/controllers/group/group.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  addGroupDeviceSchema,
  createGroupSchema,
  updateGroupSchema,
  groupDeviceParamsSchema,
  groupIdSchema,
} from "@/schemas/group/group.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", validateBody(createGroupSchema), controller.create)
router.get("/", controller.list)
router.get("/:id", validateParams(groupIdSchema), controller.getById)
router.patch(
  "/:id",
  validateParams(groupIdSchema),
  validateBody(updateGroupSchema),
  controller.update,
)
router.delete("/:id", validateParams(groupIdSchema), controller.deleteGroup)
router.post(
  "/:id/devices",
  validateParams(groupIdSchema),
  validateBody(addGroupDeviceSchema),
  controller.addDevice,
)
router.delete(
  "/:id/devices/:deviceId",
  validateParams(groupDeviceParamsSchema),
  controller.removeDevice,
)

export default router
