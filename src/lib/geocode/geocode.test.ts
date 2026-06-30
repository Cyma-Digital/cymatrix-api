import { reverseGeocode } from "./index"

const mocks = vi.hoisted(() => ({
  key: "test-key" as string | undefined,
}))

vi.mock("@/config/environment", () => ({
  env: {
    get GOOGLE_MAPS_API_KEY() {
      return mocks.key
    },
  },
}))

function mockFetch(impl: () => unknown) {
  vi.stubGlobal("fetch", vi.fn(impl as never))
}

beforeEach(() => {
  mocks.key = "test-key"
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("reverseGeocode", () => {
  test("maps a well-formed Google response to a GeocodedAddress", async () => {
    mockFetch(() => ({
      ok: true,
      json: async () => ({
        status: "OK",
        results: [
          {
            formatted_address: "Av. Paulista, 1000 - São Paulo, SP, Brasil",
            address_components: [
              {
                long_name: "São Paulo",
                short_name: "São Paulo",
                types: ["administrative_area_level_2"],
              },
              {
                long_name: "São Paulo",
                short_name: "SP",
                types: ["administrative_area_level_1"],
              },
            ],
          },
        ],
      }),
    }))

    const result = await reverseGeocode(-23.5614, -46.6559)

    expect(result).toEqual({
      formattedAddress: "Av. Paulista, 1000 - São Paulo, SP, Brasil",
      city: "São Paulo",
      state: "SP",
    })
  })

  test("returns null when status is not OK", async () => {
    mockFetch(() => ({
      ok: true,
      json: async () => ({ status: "ZERO_RESULTS", results: [] }),
    }))

    expect(await reverseGeocode(0, 0)).toBeNull()
  })

  test("returns null when results are empty", async () => {
    mockFetch(() => ({
      ok: true,
      json: async () => ({ status: "OK", results: [] }),
    }))

    expect(await reverseGeocode(0, 0)).toBeNull()
  })

  test("returns null on non-OK HTTP response", async () => {
    mockFetch(() => ({ ok: false, json: async () => ({}) }))

    expect(await reverseGeocode(0, 0)).toBeNull()
  })

  test("returns null when fetch throws", async () => {
    mockFetch(() => {
      throw new Error("network down")
    })

    expect(await reverseGeocode(0, 0)).toBeNull()
  })

  test("returns null without calling fetch when the key is missing", async () => {
    mocks.key = undefined
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    expect(await reverseGeocode(0, 0)).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
