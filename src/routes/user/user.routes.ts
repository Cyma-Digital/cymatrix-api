import { Router } from "express"
import * as userController from "@/controllers/user/user.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createUserSchama,
  updateUserSchema,
  userIdSchema,
} from "@/schemas/user/user.schemas"
import { authenticate } from "@/middlewares/auth.middleware"

const router = Router()

router.use(authenticate)

router.post("/", validateBody(createUserSchama), userController.create)
router.get("/", userController.list)
router.get("/:id", validateParams(userIdSchema), userController.getById)
router.put(
  "/:id",
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  userController.update,
)
router.delete("/:id", validateParams(userIdSchema), userController.deleteUser)

export default router
