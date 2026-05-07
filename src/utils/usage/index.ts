import { Request, Response } from "express"

const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(6)

export function measureHttpResponse(
  req: Request,
  res: Response,
  context: string,
): void {
  res.on("finish", () => {
    const headerBytes = Buffer.byteLength(
      Object.entries(res.getHeaders())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n"),
      "utf8",
    )
    const contentLength = parseInt(
      (res.getHeader("content-length") as string) || "0",
    )
    const statusLine = Buffer.byteLength(
      `HTTP/1.1 ${res.statusCode}\r\n`,
      "utf8",
    )
    const totalBytes = statusLine + headerBytes + contentLength

    console.log(
      `[usage] HTTP ${context} headers=${headerBytes}B payload=${contentLength}B total=${totalBytes}B (${toMB(totalBytes)} MB)`,
    )
  })
}

export function measureWsMessage(deviceId: string, data: object): void {
  const payload = JSON.stringify(data)
  const payloadBytes = Buffer.byteLength(payload, "utf8")
  const wsFrameOverhead = 10 // frame header + masking
  const totalBytes = payloadBytes + wsFrameOverhead

  console.log(
    `[usage] WS device=${deviceId} payload=${payloadBytes}B frame=${wsFrameOverhead}B total=${totalBytes}B`,
  )
}
