import { WebSocketServer } from "ws"
import { Server } from "http"
import { handleConnection } from "./websocket.handler"

export function createWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server })

  wss.on("connection", handleConnection)

  const address = server.address()
  const port = typeof address === "object" ? address?.port : address
  console.log(`WebSocket Server running on ws://localhost:${port}`)

  return wss
}
