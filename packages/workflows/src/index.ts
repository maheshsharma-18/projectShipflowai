import { generatePRD, createReleasePlan } from "@shipflow/ai";
import { db } from "@shipflow/db";
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "shipflow-ai" });

export const generateReleasePlan = inngest.createFunction(
  { id: "generate-release-plan" },
  { event: "release/plan.requested" },
  async ({ event }) => createReleasePlan({ goal: String(event.data.goal ?? "Review release readiness"), repository: event.data.repository as string | undefined })
);

export const generateFeatureRequestPRD = inngest.createFunction(
  { id: "generate-feature-request-prd" },
  { event: "feature-request/prd.generate" },
  async ({ event }) => {
    const featureRequestId = String(event.data.featureRequestId ?? "");
    const workspaceId = String(event.data.workspaceId ?? "");
    if (!featureRequestId || !workspaceId) throw new Error("featureRequestId and workspaceId are required");

    const featureRequest = await db.prisma.featureRequest.findFirst({
      where: { id: featureRequestId, workspaceId },
      include: {
        project: true,
        clarificationQuestions: { orderBy: { createdAt: "asc" } },
        prds: { orderBy: { version: "desc" }, take: 1 }
      }
    });
    if (!featureRequest) throw new Error("Feature request not found");

    const generated = generatePRD({
      title: featureRequest.title,
      description: featureRequest.description,
      projectContext: featureRequest.project?.description,
      clarificationAnswers: featureRequest.clarificationQuestions.map((question) => ({ question: question.question, answer: question.answer }))
    });
    const latestVersion = featureRequest.prds[0]?.version ?? 0;
    await db.prisma.pRD.updateMany({ where: { featureRequestId, workspaceId, status: "draft" }, data: { status: "superseded" } });
    const prd = await db.prisma.pRD.create({
      data: {
        workspaceId,
        featureRequestId,
        title: `${featureRequest.title} PRD`,
        content: generated.editableMarkdown,
        structured: generated,
        version: latestVersion + 1
      }
    });
    await db.prisma.featureRequest.update({ where: { id: featureRequestId }, data: { status: "prd_draft" } });
    return prd;
  }
);

export const functions = [generateReleasePlan, generateFeatureRequestPRD];
