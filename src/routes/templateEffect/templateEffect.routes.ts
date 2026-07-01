import { Router } from "express"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import { authenticate } from "@/middlewares/auth.middleware"
import {
  createTemplateEffectSchema,
  templateEffectIdSchema,
} from "@/schemas/templateEffect/templateEffect.schemas"
import * as templateEffectController from "@/controllers/templateEffect/templateEffect.controller"

const router = Router()

router.use(authenticate)

router.post(
  "/",
  validateBody(createTemplateEffectSchema),
  templateEffectController.create,
)
router.get("/", templateEffectController.list)
router.get(
  "/:id",
  validateParams(templateEffectIdSchema),
  templateEffectController.getById,
)
router.get(
  "/template/:id",
  validateParams(templateEffectIdSchema),
  templateEffectController.getByTemplateId,
)
router.get(
  "/effect/:id",
  validateParams(templateEffectIdSchema),
  templateEffectController.getByEffectId,
)
router.delete(
  "/:id",
  validateParams(templateEffectIdSchema),
  templateEffectController.deleteTemplateEffect,
)

export default router
