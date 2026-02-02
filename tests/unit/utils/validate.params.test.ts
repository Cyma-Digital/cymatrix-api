import { validateIdParam } from "@/utils/http"
import { Request } from "express"

const createMockRequest = (
  params?: Record<string, string | number>,
  body?: unknown,
): Partial<Request> => ({
  params: (params || {}) as Record<string, string>,
  body,
})

describe("@utils/validateParams", () => {
  describe("validatedParams()", () => {
    describe("When ID is valid", () => {
      test("Should return parsed integer", () => {
        const request = createMockRequest({ id: "123" }) as Request

        const result = validateIdParam(request)

        expect(result).toBe(123)
      })
    })

    describe("When ID is invalid", () => {
      test("Should throw erro fot non-numeric string", () => {
        const request = createMockRequest({ id: "abc" }) as Request
        expect(() => validateIdParam(request)).toThrow("Invalid param")
      })

      test("Should throw error for negative number", () => {
        const request = createMockRequest({ id: -1 }) as Request
        expect(() => validateIdParam(request)).toThrow("Invalid param")
      })

      test("Should throw error for zero", () => {
        const request = createMockRequest({ id: 0 }) as Request
        expect(() => validateIdParam(request)).toThrow("Param is missing")
      })
    })

    describe("When ID is missing", () => {
      test("Should throw error for undefined", () => {
        const request = createMockRequest({}) as Request
        expect(() => validateIdParam(request)).toThrow("Param is missing")
      })

      test("Should throw error empty string", () => {
        const request = createMockRequest({ id: "" }) as Request
        expect(() => validateIdParam(request)).toThrow("Param is missing")
      })
    })
  })
})
