import { SubmitWeeklyReviewRequestSchema } from "@/lib/keikakun/schemas";
import { apiError, handleUnexpectedError, ok, validationError } from "@/server/api/response";
import { appendWeeklyReview, getSessionForVisitor } from "@/server/session-store";
import { getOrCreateVisitorId } from "@/server/visitor";
import { ZodError } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const visitorId = await getOrCreateVisitorId();
  const bundle = getSessionForVisitor(id, visitorId);

  if (!bundle) {
    return apiError("not_found", "Analysis session was not found.", 404);
  }

  return ok({
    session: bundle.session,
    ...bundle.review
  });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const input = SubmitWeeklyReviewRequestSchema.parse({
      ...body,
      analysisSessionId: id
    });
    const visitorId = await getOrCreateVisitorId();
    const review = appendWeeklyReview(
      id,
      visitorId,
      input.weekNumber,
      input.weeklyReviewText
    );

    if (!review) {
      return apiError("not_found", "Analysis session was not found.", 404);
    }

    return ok({
      structuredReview: review,
      rawStorageStored: false,
      auditEventReference: `review:${review.reviewKey}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return handleUnexpectedError(error);
  }
}
