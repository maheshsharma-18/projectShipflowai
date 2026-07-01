import { PrismaClient } from "@prisma/client";

export { PrismaClient } from "@prisma/client";
export type {
  AIReviewIssue,
  AIReviewRun,
  BillingSubscription,
  ClarificationQuestion,
  EngineeringTask,
  FeatureRequest,
  HumanApproval,
  PRD,
  Project,
  PullRequest,
  PullRequestFile,
  Release,
  Repository,
  TaskBoardColumn,
  UsageLedger,
  User,
  WebhookEvent,
  Workspace,
  WorkspaceMember
} from "@prisma/client";
export {
  AIReviewIssueSeverity,
  AIReviewIssueStatus,
  AIReviewRunStatus,
  BillingSubscriptionStatus,
  ClarificationQuestionStatus,
  CoreLoopStatus,
  EngineeringTaskStatus,
  FeatureRequestPriority,
  HumanApprovalDecision,
  PRDStatus,
  PullRequestStatus,
  ReleaseStatus,
  UsageLedgerEventType,
  WebhookEventStatus,
  WorkspaceRole
} from "@prisma/client";
export type { PrismaClient as PrismaClientType, WorkspaceRole as WorkspaceRoleValue } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { shipflowPrisma?: PrismaClient };
export const prisma = globalForPrisma.shipflowPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.shipflowPrisma = prisma;

export const coreLoopStatuses = [
  "request_intake",
  "clarification",
  "prd_draft",
  "prd_approved",
  "tasks_generated",
  "development",
  "review_running",
  "fixes_needed",
  "ready_for_approval",
  "approved",
  "rejected",
  "shipped"
] as const;

export type CoreLoopStatusValue = (typeof coreLoopStatuses)[number];

export type DemoReleaseStatus = "draft" | "reviewing" | "ready" | "shipping" | "shipped";
export type DemoRelease = { id: string; workspaceId: string; title: string; repository: string; status: DemoReleaseStatus; riskScore: number; updatedAt: string; };

export const demoReleases: DemoRelease[] = [
  { id: "rel_checkout", workspaceId: "demo_workspace", title: "Checkout reliability hardening", repository: "shipflow/commerce", status: "reviewing", riskScore: 0.41, updatedAt: "2026-07-01T10:00:00.000Z" },
  { id: "rel_webhooks", workspaceId: "demo_workspace", title: "GitHub webhook ingestion", repository: "shipflow/platform", status: "ready", riskScore: 0.18, updatedAt: "2026-07-01T09:30:00.000Z" }
];

export const db = {
  prisma,
  workspace: {
    membershipsForUser: (userId: string) => prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: "asc" }
    }),
    byIdForUser: (workspaceId: string, userId: string) => prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: { workspace: true }
    })
  },
  release: {
    list: async (workspaceId?: string) => {
      if (!workspaceId || workspaceId === "demo_workspace") return demoReleases.filter((release) => !workspaceId || release.workspaceId === workspaceId);
      return prisma.release.findMany({ where: { workspaceId }, orderBy: { updatedAt: "desc" } });
    },
    byId: async (id: string, workspaceId?: string) => {
      if (!workspaceId || workspaceId === "demo_workspace") return demoReleases.find((release) => release.id === id && (!workspaceId || release.workspaceId === workspaceId)) ?? null;
      return prisma.release.findFirst({ where: { id, workspaceId } });
    }
  }
};
