import { Router } from "express"
import * as userController from "@/controllers/user/user.controller"
import { validateParams } from "@/middlewares/validate.middleware"
import { userIdSchema } from "@/schemas/user"

const router = Router()

router.post("/", userController.create)
router.get("/", userController.list)
router.get("/:id", validateParams(userIdSchema), userController.getById)

export default router
