import { SubmitInterviewAnswerRequestSchema } from "@/lib/keikakun/schemas";
import { apiError, handleUnexpectedError, ok, validationError } from "@/server/api/response";
import { appendInterviewEvaluation } from "@/server/session-store";
import { getOrCreateVisitorId } from "@/server/visitor";
import { ZodError } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = SubmitInterviewAnswerRequestSchema.parse({
      ...body,
      analysisSessionId: id
    });
    const visitorId = await getOrCreateVisitorId();
    const evaluation = appendInterviewEvaluation(
      id,
      visitorId,
      input.interviewQuestionId,
      input.interviewAnswerText
    );

    if (!evaluation) {
      return apiError("not_found", "Analysis session was not found.", 404);
    }

    return ok({
      evaluation,
      rawStorageStored: false,
      auditEventReference: `interview-answer:${input.interviewQuestionId}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return handleUnexpectedError(error);
  }
}
