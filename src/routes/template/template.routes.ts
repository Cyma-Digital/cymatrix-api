import { Router } from "express"
import * as templateController from "@/controllers/template/template.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdSchema,
} from "@/schemas/template/template.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", validateBody(createTemplateSchema), templateController.create)
router.get("/", templateController.list)
router.get("/:id", validateParams(templateIdSchema), templateController.getById)
router.put(
  "/:id",
  validateParams(templateIdSchema),
  validateBody(updateTemplateSchema),
  templateController.update,
)
router.delete(
  "/:id",
  validateParams(templateIdSchema),
  templateController.deleteTemplate,
)

export default router
