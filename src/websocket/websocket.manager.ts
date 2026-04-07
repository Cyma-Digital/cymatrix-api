import { WebSocket } from "ws"

const devices = new Map<string, WebSocket>()

export function registerDevice(deviceId: string, ws: WebSocket) {
  devices.set(deviceId, ws)
  console.log(`[ws] Device ${deviceId} connected. Total: ${devices.size}`)
}

export function removeDevice(deviceId: string) {
  devices.delete(deviceId)
  console.log(`[ws] Device ${deviceId} disconnected. Total: ${devices.size}`)
}

export function pushToDevice(deviceId: string, data: object) {
  const ws = devices.get(deviceId)
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data))
    return true
  }
  return false
}

export function getConnectedDevices() {
  return Array.from(devices.keys())
}
