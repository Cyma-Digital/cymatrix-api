import type { Response } from "supertest"

export function getCookie(response: Response, cookie: string) {
  const cookies = response.headers["set-cookie"]

  const refreshCookie = Array.isArray(cookies)
    ? cookies.find((item: string) => item.startsWith(cookie))
    : cookies

  return refreshCookie
}
