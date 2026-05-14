import { StartAnalysisRequestSchema } from "@/lib/keikakun/schemas";
import { apiError, handleUnexpectedError, ok, validationError } from "@/server/api/response";
import { createAnalysisSession } from "@/server/session-store";
import { getOrCreateVisitorId } from "@/server/visitor";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = StartAnalysisRequestSchema.parse(body);
    const visitorId = await getOrCreateVisitorId();
    const bundle = createAnalysisSession(input, visitorId);

    return ok(
      {
        analysisSessionId: bundle.session.id,
        status: bundle.session.status,
        providerMode: bundle.session.providerMode,
        rawStorageStored: bundle.input.rawStorageStored,
        redirectTo: `/workspace/${bundle.session.id}/analyze`
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError("validation_error", "Request body must be valid JSON.", 400);
    }

    if (error instanceof ZodError) {
      return validationError(error);
    }

    return handleUnexpectedError(error);
  }
}
