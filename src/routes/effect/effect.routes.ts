import { Router } from "express"
import * as effectController from "@/controllers/effect/effect.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createEffectSchema,
  updateEffectSchema,
  effectIdSchema,
} from "@/schemas/effect/effect.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", validateBody(createEffectSchema), effectController.create)
router.get("/", effectController.list)
router.get("/:id", validateParams(effectIdSchema), effectController.getById)
router.put(
  "/:id",
  validateParams(effectIdSchema),
  validateBody(updateEffectSchema),
  effectController.update,
)
router.delete(
  "/:id",
  validateParams(effectIdSchema),
  effectController.deleteEffect,
)

export default router
