import { apiError, ok } from "@/server/api/response";
import { getSessionForVisitor } from "@/server/session-store";
import { getOrCreateVisitorId } from "@/server/visitor";

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

  return ok(bundle.session);
}
