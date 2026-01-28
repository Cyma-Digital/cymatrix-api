import { Router } from "express"
import * as brandController from "@/controllers/brand/brand.controller"

const router = Router()

router.post("/", brandController.create)

export default router
