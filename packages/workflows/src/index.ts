import { Inngest } from "inngest";
import { createReleasePlan } from "@shipflow/ai";

export const inngest = new Inngest({ id: "shipflow-ai" });

export const generateReleasePlan = inngest.createFunction(
  { id: "generate-release-plan" },
  { event: "release/plan.requested" },
  async ({ event }) => createReleasePlan({ goal: String(event.data.goal ?? "Review release readiness"), repository: event.data.repository as string | undefined })
);

export const functions = [generateReleasePlan];
