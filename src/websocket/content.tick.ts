import isEqual from "fast-deep-equal"
import {
  getConnectedDevices,
  getLastSent,
  setLastSent,
  pushToDevice,
} from "./websocket.manager"
import contentScheduleService from "@/services/schedule/schedule.service"

const TICK_INTERVAL_MS = 60_000

let tickTimer: NodeJS.Timeout | null = null

async function tick() {
  const codes = getConnectedDevices()
  if (codes.length === 0) return

  console.log(
    `[content-tick] checking ${codes.length} device(s): ${codes.join(", ")}`,
  )

  for (const code of codes) {
    try {
      const current = await contentScheduleService.getCurrentContentByCode(code)
      const lastSent = getLastSent(code)

      if (!isEqual(current, lastSent)) {
        pushToDevice(code, { type: "content:update", data: current })
        setLastSent(code, current)
        console.log(
          `[content-tick] → ${code} updated:`,
          JSON.stringify(current),
        )
      } else {
        console.log(`[content-tick] = ${code} no change`)
      }
    } catch (err) {
      console.error(`[content-tick] ✗ ${code} error:`, err)
    }
  }
}

export function startContentTick() {
  if (tickTimer) return
  tickTimer = setInterval(tick, TICK_INTERVAL_MS)
  console.log(`[content-tick] started (every ${TICK_INTERVAL_MS / 1000}s)`)
}

export function stopContentTick() {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}
