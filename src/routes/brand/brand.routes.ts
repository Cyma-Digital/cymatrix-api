import { Router } from "express"
import brandController from "@/controllers/brand/brand.controller"

const router = Router()

router.get("/", brandController)
router.post("/", brandController)
router.put("/", brandController)
router.delete("/", brandController)

export default router
