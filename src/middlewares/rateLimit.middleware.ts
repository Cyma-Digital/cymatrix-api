import { HttpError } from "@/errors/httpError"
import type { NextFunction, Request, Response } from "express"

interface RateLimitOptions {
  windowMs: number
  max: number
  keyFn: (req: Request) => string
}

interface Bucket {
  count: number
  resetAt: number
}

export interface RateLimitMiddleware {
  (req: Request, res: Response, next: NextFunction): void
  reset: () => void
}

// Buckets are per-process: counts are not shared across instances, so the
// effective limit scales with the number of replicas.
export function rateLimit({
  windowMs,
  max,
  keyFn,
}: RateLimitOptions): RateLimitMiddleware {
  const buckets = new Map<string, Bucket>()
  let nextSweepAt = 0

  function rateLimitMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    const key = keyFn(req)
    const now = Date.now()

    // Evict expired buckets at most once per window so keys seen only once
    // (e.g. rotating users) don't accumulate forever.
    if (now >= nextSweepAt) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k)
      }
      nextSweepAt = now + windowMs
    }

    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (bucket.count >= max) {
      return next(new HttpError(429, "Too many requests"))
    }

    bucket.count += 1
    next()
  }

  rateLimitMiddleware.reset = () => buckets.clear()

  return rateLimitMiddleware
}
