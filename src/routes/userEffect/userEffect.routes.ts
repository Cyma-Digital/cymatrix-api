import { Router } from "express"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import { authenticate } from "@/middlewares/auth.middleware"
import {
  createUserEffectSchema,
  userEffectIdSchema,
} from "@/schemas/userEffect/userEffect.schemas"
import * as userEffectController from "@/controllers/userEffect/userEffect.controller"

const router = Router()

router.use(authenticate)

router.post(
  "/",
  validateBody(createUserEffectSchema),
  userEffectController.create,
)
router.get("/", userEffectController.list)
router.get(
  "/:id",
  validateParams(userEffectIdSchema),
  userEffectController.getById,
)
router.get(
  "/user/:id",
  validateParams(userEffectIdSchema),
  userEffectController.getByUserId,
)
router.get(
  "/effect/:id",
  validateParams(userEffectIdSchema),
  userEffectController.getByEffectId,
)
router.delete(
  "/:id",
  validateParams(userEffectIdSchema),
  userEffectController.deleteUserEffect,
)

export default router
