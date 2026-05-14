import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorDetail {
  field: string;
  message: string;
  code: string;
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, init);
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  details: ApiErrorDetail[] = []
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details
      }
    },
    { status }
  );
}

export function validationError(error: ZodError) {
  return apiError(
    "validation_error",
    "Request validation failed",
    400,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code
    }))
  );
}

export function handleUnexpectedError(error: unknown) {
  console.error("Unexpected API error", error);
  return apiError("internal_error", "An unexpected error occurred.", 500);
}
