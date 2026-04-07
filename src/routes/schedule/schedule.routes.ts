import { Router } from "express"
import * as controller from "@/controllers/schedule/schedule.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createContentScheduleSchema,
  updateContentScheduleSchema,
  contentScheduleIdSchema,
} from "@/schemas/schedule/schedule.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", validateBody(createContentScheduleSchema), controller.create)
router.get("/", controller.list)
router.get("/:id", validateParams(contentScheduleIdSchema), controller.getById)
router.get(
  "/device/:id",
  validateParams(contentScheduleIdSchema),
  controller.listByDevice,
)
router.put(
  "/:id",
  validateParams(contentScheduleIdSchema),
  validateBody(updateContentScheduleSchema),
  controller.update,
)
router.delete(
  "/:id",
  validateParams(contentScheduleIdSchema),
  controller.deleteSchedule,
)

export default router
