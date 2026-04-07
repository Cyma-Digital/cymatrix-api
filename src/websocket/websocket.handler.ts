import { WebSocket } from "ws"
import { IncomingMessage } from "http"
import { registerDevice, removeDevice } from "./websocket.manager"
import scheduleService from "@/services/schedule/schedule.service"
import deviceRepository from "@/repositories/device/device.respository"

export function handleConnection(ws: WebSocket, req: IncomingMessage) {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const deviceCode = url.searchParams.get("device")

  if (!deviceCode) {
    ws.close(1008, "device required")
    return
  }

  registerDevice(deviceCode, ws)
  updateDeviceStatus(deviceCode, "Online")
  sendCurrentContent(deviceCode, ws)

  ws.on("message", (data) => {
    console.log(`[ws] Message from ${deviceCode}: ${data}`)
  })

  ws.on("close", () => {
    removeDevice(deviceCode)
    updateDeviceStatus(deviceCode, "Offline")
  })
}

async function updateDeviceStatus(code: string, status: "Online" | "Offline") {
  try {
    const device = await deviceRepository.getByCode(code)
    if (device) {
      await deviceRepository.updateStatus(device.id, status)
    }
  } catch (error) {
    console.log(`[ws] Failed to update device status: ${error}`)
  }
}

async function sendCurrentContent(code: string, ws: WebSocket) {
  try {
    const device = await deviceRepository.getByCode(code)
    if (!device) return

    const content = await scheduleService.getCurrentContent(device.id)

    ws.send(
      JSON.stringify({
        type: "content:current",
        data: content,
      }),
    )
  } catch (error) {
    console.log(`[ws] Failed to send current content: ${error}`)
  }
}
