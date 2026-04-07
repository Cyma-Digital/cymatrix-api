import app from "@/app"
import { createWebSocketServer } from "@/websocket/websocket.server"

const port = Number(process.env.PORT) || 3000

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

createWebSocketServer(server)
