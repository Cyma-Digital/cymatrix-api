import { env } from "@/config/environment"

export interface GeocodedAddress {
  formattedAddress: string
  city?: string
  state?: string
}

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

// Great-circle distance between two coordinates in meters (haversine). Used to
// decide whether a device actually relocated or just reported GPS jitter, so we
// can skip redundant geocode calls for stationary devices.
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000 // earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

interface GoogleAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

function pickComponent(
  components: GoogleAddressComponent[],
  types: string[],
  field: "long_name" | "short_name",
): string | undefined {
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type))
    if (match) return match[field]
  }
  return undefined
}

// Reverse-geocodes coordinates through Google's Geocoding API. The single point
// in the codebase that knows about Google — swapping providers touches only this.
// Returns null (never throws) on any failure so callers can degrade gracefully.
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodedAddress | null> {
  const key = env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  try {
    const url = `${GEOCODE_URL}?latlng=${lat},${lng}&language=pt-BR&key=${key}`
    // Bound the call: this runs outside the DB transaction, but a hung Google
    // request would still stall the metrics-ingest handler indefinitely. Abort
    // after 5s; the catch below turns the abort into a graceful null.
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })

    if (!response.ok) return null

    const data = await response.json()

    if (data.status !== "OK" || !data.results?.length) return null

    const result = data.results[0]
    // Google can return status OK with a result lacking a usable address; treat
    // that as an unresolved location so callers don't store `undefined`.
    if (typeof result.formatted_address !== "string") return null
    const components: GoogleAddressComponent[] = result.address_components ?? []

    return {
      formattedAddress: result.formatted_address,
      city: pickComponent(
        components,
        ["administrative_area_level_2", "locality"],
        "long_name",
      ),
      state: pickComponent(
        components,
        ["administrative_area_level_1"],
        "short_name",
      ),
    }
  } catch {
    return null
  }
}
