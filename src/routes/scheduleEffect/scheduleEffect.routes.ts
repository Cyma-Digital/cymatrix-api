import { Router } from "express"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import { authenticate } from "@/middlewares/auth.middleware"
import {
  createScheduleEffectSchema,
  scheduleEffectIdSchema,
} from "@/schemas/scheduleEffect/scheduleEffect.schemas"
import * as scheduleEffectController from "@/controllers/scheduleEffect/scheduleEffect.controller"

const router = Router()

router.use(authenticate)

router.post(
  "/",
  validateBody(createScheduleEffectSchema),
  scheduleEffectController.create,
)
router.get("/", scheduleEffectController.list)
router.get(
  "/:id",
  validateParams(scheduleEffectIdSchema),
  scheduleEffectController.getById,
)
router.get(
  "/schedule/:id",
  validateParams(scheduleEffectIdSchema),
  scheduleEffectController.getByScheduleId,
)
router.get(
  "/effect/:id",
  validateParams(scheduleEffectIdSchema),
  scheduleEffectController.getByEffectId,
)
router.delete(
  "/:id",
  validateParams(scheduleEffectIdSchema),
  scheduleEffectController.deleteScheduleEffect,
)

export default router
