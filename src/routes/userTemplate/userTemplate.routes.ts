import { Router } from "express"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import { authenticate } from "@/middlewares/auth.middleware"
import {
  createUserTemplateSchema,
  userTemplateIdSchema,
} from "@/schemas/userTemplate/userTemplate.schemas"
import * as userTemplateController from "@/controllers/userTemplate/userTemplate.controller"

const router = Router()

router.use(authenticate)

router.post(
  "/",
  validateBody(createUserTemplateSchema),
  userTemplateController.create,
)
router.get("/", userTemplateController.list)
router.get(
  "/:id",
  validateParams(userTemplateIdSchema),
  userTemplateController.getById,
)
router.get(
  "/user/:id",
  validateParams(userTemplateIdSchema),
  userTemplateController.getByUserId,
)
router.get(
  "/template/:id",
  validateParams(userTemplateIdSchema),
  userTemplateController.getByTemplateId,
)
router.delete(
  "/:id",
  validateParams(userTemplateIdSchema),
  userTemplateController.deleteUserTemplate,
)

export default router
