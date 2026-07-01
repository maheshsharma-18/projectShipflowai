import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createReleasePlan } from "@shipflow/ai";
import { db } from "@shipflow/db";
import { summarizePullRequestEvent, githubWebhookSchema } from "@shipflow/github";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  health: publicProcedure.query(() => ({ ok: true, service: "shipflow-api" })),
  releases: router({
    list: publicProcedure.query(() => db.release.list()),
    byId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => db.release.byId(input.id)),
    plan: publicProcedure.input(z.object({ goal: z.string().min(8), repository: z.string().optional(), branch: z.string().optional() })).mutation(({ input }) => createReleasePlan(input))
  }),
  github: router({
    summarizeWebhook: publicProcedure.input(githubWebhookSchema).mutation(({ input }) => ({ summary: summarizePullRequestEvent(input) }))
  })
});

export type AppRouter = typeof appRouter;
