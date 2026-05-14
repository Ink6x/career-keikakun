import { UpdateEvidenceMaterialRequestSchema } from "@/lib/keikakun/schemas";
import { apiError, handleUnexpectedError, ok, validationError } from "@/server/api/response";
import { updateEvidenceMaterial } from "@/server/session-store";
import { getOrCreateVisitorId } from "@/server/visitor";
import { ZodError } from "zod";

interface RouteContext {
  params: Promise<{ id: string; materialId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, materialId } = await context.params;
    const body = await request.json();
    const input = UpdateEvidenceMaterialRequestSchema.parse({
      ...body,
      analysisSessionId: id,
      evidenceArtifactId: materialId
    });
    const visitorId = await getOrCreateVisitorId();
    const material = updateEvidenceMaterial(
      id,
      visitorId,
      materialId,
      input.status,
      input.note,
      input.nextAction
    );

    if (!material) {
      return apiError("not_found", "Evidence material was not found.", 404);
    }

    return ok({
      material,
      auditEventReference: `evidence-material:${material.artifactKey}`
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return handleUnexpectedError(error);
  }
}
