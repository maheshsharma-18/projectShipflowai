import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { clarifyFeatureRequest, createReleasePlan } from "@shipflow/ai";
import { db, type WorkspaceRole } from "@shipflow/db";
import { summarizePullRequestEvent, githubWebhookSchema } from "@shipflow/github";
import type { AuthContext } from "@shipflow/auth";

type Context = AuthContext;
const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to continue." });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const requireWorkspaceAccess = t.middleware(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in to continue." });
  if (!ctx.workspace) throw new TRPCError({ code: "FORBIDDEN", message: "Create or select a workspace first." });
  return next({ ctx: { ...ctx, session: ctx.session, workspace: ctx.workspace } });
});

export function requireRole(roles: WorkspaceRole[]) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.workspace) throw new TRPCError({ code: "FORBIDDEN", message: "Workspace access is required." });
    if (!roles.includes(ctx.workspace.role)) throw new TRPCError({ code: "FORBIDDEN", message: "Your workspace role cannot perform this action." });
    return next({ ctx });
  });
}

const authedProcedure = publicProcedure.use(requireAuth);
const workspaceProcedure = publicProcedure.use(requireWorkspaceAccess);
const adminProcedure = workspaceProcedure.use(requireRole(["owner", "admin"]));

const featureRequestSourceSchema = z.enum(["manual", "email_import", "support_ticket", "customer_call_transcript"]);
const featureRequestPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
const placeholderFeatureRequestSourceSchema = z.enum(["email_import", "support_ticket", "customer_call_transcript"]);

async function runAndPersistClarification(featureRequestId: string, workspaceId: string, projectId?: string | null) {
  const featureRequest = await db.prisma.featureRequest.findFirst({ where: { id: featureRequestId, workspaceId } });
  if (!featureRequest) throw new TRPCError({ code: "NOT_FOUND", message: "Feature request not found." });
  const existingFeatures = await db.prisma.featureRequest.findMany({
    where: { workspaceId, projectId: projectId ?? featureRequest.projectId, id: { not: featureRequestId } },
    select: { id: true, title: true, description: true },
    take: 25,
    orderBy: { updatedAt: "desc" }
  });
  const project = featureRequest.projectId ? await db.prisma.project.findFirst({ where: { id: featureRequest.projectId, workspaceId } }) : null;
  const clarification = clarifyFeatureRequest({
    title: featureRequest.title,
    description: featureRequest.description,
    projectContext: project?.description,
    existingFeatures
  });
  await db.prisma.clarificationQuestion.deleteMany({ where: { featureRequestId, status: "open" } });
  if (clarification.questions.length > 0) {
    await db.prisma.clarificationQuestion.createMany({
      data: clarification.questions.map((item) => ({ workspaceId, featureRequestId, question: item.question }))
    });
  }
  return db.prisma.featureRequest.update({
    where: { id: featureRequestId },
    data: {
      status: clarification.recommendation === "ask_follow_up" ? "clarification" : "prd_draft",
      metadata: { ...((featureRequest.metadata as Record<string, unknown> | null) ?? {}), clarification }
    },
    include: { project: true, requester: true, clarificationQuestions: { orderBy: { createdAt: "asc" } } }
  });
}

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "shipflow-api" })),
  viewer: authedProcedure.query(({ ctx }) => ({ user: ctx.session, workspace: ctx.workspace, workspaces: ctx.workspaces })),
  workspaces: router({
    list: authedProcedure.query(({ ctx }) => ctx.workspaces),
    create: authedProcedure.input(z.object({ name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/).optional() })).mutation(async ({ ctx, input }) => {
      const workspace = await db.prisma.workspace.create({
        data: { name: input.name, slug: input.slug ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), members: { create: { userId: ctx.session.userId, role: "owner" } } }
      });
      return workspace;
    }),
    members: workspaceProcedure.query(({ ctx }) => db.prisma.workspaceMember.findMany({ where: { workspaceId: ctx.workspace.workspaceId }, include: { user: true }, orderBy: { createdAt: "asc" } })),
    updateMemberRole: adminProcedure.input(z.object({ userId: z.string(), role: z.enum(["owner", "admin", "product", "engineer", "reviewer", "billing"]) })).mutation(({ ctx, input }) => db.prisma.workspaceMember.update({ where: { workspaceId_userId: { workspaceId: ctx.workspace.workspaceId, userId: input.userId } }, data: { role: input.role } }))
  }),
  releases: router({
    list: workspaceProcedure.query(({ ctx }) => db.release.list(ctx.workspace.workspaceId)),
    byId: workspaceProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => db.release.byId(input.id, ctx.workspace.workspaceId)),
    plan: workspaceProcedure.input(z.object({ goal: z.string().min(8), repository: z.string().optional(), branch: z.string().optional() })).mutation(({ input }) => createReleasePlan(input))
  }),

  featureRequests: router({
    list: workspaceProcedure.input(z.object({ projectId: z.string().optional() }).optional()).query(({ ctx, input }) => db.prisma.featureRequest.findMany({
      where: { workspaceId: ctx.workspace.workspaceId, projectId: input?.projectId },
      include: { project: true, clarificationQuestions: true },
      orderBy: { updatedAt: "desc" }
    })),
    byId: workspaceProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => db.prisma.featureRequest.findFirst({
      where: { id: input.id, workspaceId: ctx.workspace.workspaceId },
      include: { project: true, requester: true, clarificationQuestions: { include: { answeredBy: true }, orderBy: { createdAt: "asc" } } }
    })),
    create: workspaceProcedure.input(z.object({
      projectId: z.string(),
      title: z.string().min(4),
      description: z.string().min(10),
      priority: featureRequestPrioritySchema.default("medium"),
      source: featureRequestSourceSchema.default("manual")
    })).mutation(async ({ ctx, input }) => {
      const project = await db.prisma.project.findFirst({ where: { id: input.projectId, workspaceId: ctx.workspace.workspaceId } });
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
      const featureRequest = await db.prisma.featureRequest.create({
        data: {
          workspaceId: ctx.workspace.workspaceId,
          projectId: input.projectId,
          requesterId: ctx.session.userId,
          title: input.title,
          description: input.description,
          priority: input.priority,
          source: input.source as never,
          metadata: { source: input.source }
        } as never
      });
      return runAndPersistClarification(featureRequest.id, ctx.workspace.workspaceId, input.projectId);
    }),
    createPlaceholder: workspaceProcedure.input(z.object({ projectId: z.string(), source: placeholderFeatureRequestSourceSchema })).mutation(async ({ ctx, input }) => {
      const labels = { email_import: "Email/import", support_ticket: "Support ticket", customer_call_transcript: "Customer call transcript" };
      const featureRequest = await db.prisma.featureRequest.create({
        data: {
          workspaceId: ctx.workspace.workspaceId,
          projectId: input.projectId,
          requesterId: ctx.session.userId,
          title: `${labels[input.source]} placeholder`,
          description: `Placeholder created for ${labels[input.source].toLowerCase()} intake. Replace this with imported customer evidence before PRD generation.`,
          source: input.source as never,
          metadata: { source: input.source, placeholder: true }
        } as never
      });
      return runAndPersistClarification(featureRequest.id, ctx.workspace.workspaceId, input.projectId);
    }),
    answerQuestion: workspaceProcedure.input(z.object({ questionId: z.string(), answer: z.string().min(1) })).mutation(({ ctx, input }) => db.prisma.clarificationQuestion.update({
      where: { id: input.questionId },
      data: { answer: input.answer, status: "answered", answeredById: ctx.session.userId, answeredAt: new Date() }
    }))
  }),
  projects: router({
    list: workspaceProcedure.query(({ ctx }) => db.prisma.project.findMany({ where: { workspaceId: ctx.workspace.workspaceId }, orderBy: { updatedAt: "desc" } })),
    byId: workspaceProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => db.prisma.project.findFirst({ where: { id: input.id, workspaceId: ctx.workspace.workspaceId } }))
  }),
  github: router({
    summarizeWebhook: workspaceProcedure.input(githubWebhookSchema).mutation(({ input }) => ({ summary: summarizePullRequestEvent(input) }))
  })
});

export type AppRouter = typeof appRouter;
