import express from "express"
import routes from "@/routes"
import { errorHandler } from "./middlewares"

import morgan from "morgan"

const app = express()

app.use(morgan("dev"))

app.use(express.json())
app.use("/api", routes)

app.use(errorHandler)

export default app
