import { type Response } from "supertest"
import request from "supertest"
import app from "../../src/app"

export function getCookie(response: Response, cookie: string) {
  const cookies = response.headers["set-cookie"]

  const refreshCookie = Array.isArray(cookies)
    ? cookies.find((item: string) => item.startsWith(cookie))
    : cookies

  return refreshCookie
}

export async function loginAndGetToken() {
  const response = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "admin123",
  })
  return response.body.data.access
}
