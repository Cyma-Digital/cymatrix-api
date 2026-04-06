import { WebSocket } from "ws"
import { IncomingMessage } from "http"
import { registerDevice, removeDevice } from "./websocket.manager"

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const deviceId = url.searchParams.get("device")

  if (!deviceId) {
    ws.close(1008, "device required")
    return
  }

  registerDevice(deviceId, ws)

  ws.on("message", (data) => {
    console.log(`[WS] Message from ${deviceId}: ${data}`)
  })

  ws.on("close", () => {
    removeDevice(deviceId)
  })

  // manda uma mensagem de boas vindas pro device
  ws.send(
    JSON.stringify({ type: "connected", message: "Hello from Cymatrix API" }),
  )
}
