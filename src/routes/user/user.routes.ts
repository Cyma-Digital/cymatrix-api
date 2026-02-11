import { Router } from "express"
import * as userController from "@/controllers/user/user.controller"
import { validateBody, validateParams } from "@/middlewares/validate.middleware"
import {
  createUserSchama,
  updateUserSchema,
  userIdSchema,
} from "@/schemas/user/user.schemas"

const router = Router()

router.post("/", validateBody(createUserSchama), userController.create)
router.get("/", userController.list)
router.get("/:id", validateParams(userIdSchema), userController.getById)
router.put("/:id", validateBody(updateUserSchema), userController.update)

export default router
