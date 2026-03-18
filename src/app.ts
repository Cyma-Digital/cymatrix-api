import express from "express"
import routes from "@/routes"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares"

import morgan from "morgan"

const app = express()

app.use(morgan("dev"))
app.use(cookieParser())
app.use(express.json())

app.use("/api", routes)

app.use(errorHandler)

export default app
