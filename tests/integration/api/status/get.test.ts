describe("GET /api/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/status")
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.status).toBeDefined()
      expect(body.database).toBeDefined()
      expect(body.updated_at).toBeDefined()
    })
  })
})
