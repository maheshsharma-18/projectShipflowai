import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { createReleasePlan } from "@shipflow/ai";
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
  projects: router({
    list: workspaceProcedure.query(({ ctx }) => db.prisma.project.findMany({ where: { workspaceId: ctx.workspace.workspaceId }, orderBy: { updatedAt: "desc" } })),
    byId: workspaceProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => db.prisma.project.findFirst({ where: { id: input.id, workspaceId: ctx.workspace.workspaceId } }))
  }),
  github: router({
    summarizeWebhook: workspaceProcedure.input(githubWebhookSchema).mutation(({ input }) => ({ summary: summarizePullRequestEvent(input) }))
  })
});

export type AppRouter = typeof appRouter;
