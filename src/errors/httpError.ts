export interface ValidationErrorDetails {
  fieldErrors: Record<string, string[]>
  formErrors?: string[]
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?:
      | ValidationErrorDetails
      | Record<string, string[]>
      | Array<unknown>,
  ) {
    super(message)
  }
}
