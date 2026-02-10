import { flattenError, ZodType } from "zod"
import type { Response, Request, NextFunction } from "express"
import { HttpError } from "@/errors/httpError"

export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      const { fieldErrors, formErrors } = flattenError(result.error)

      return next(
        new HttpError(400, "Validation failed", {
          fieldErrors,
          ...(formErrors.length > 0 && { formErrors }),
        }),
      )
    }

    next()
  }
}
