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

export type DemoRelease = {
  id: string;
  title: string;
  repository: string;
  status: DemoReleaseStatus;
  riskScore: number;
  updatedAt: string;
};

export const demoReleases: DemoRelease[] = [
  {
    id: "rel_checkout",
    title: "Checkout reliability hardening",
    repository: "shipflow/commerce",
    status: "reviewing",
    riskScore: 0.41,
    updatedAt: "2026-07-01T10:00:00.000Z"
  },
  {
    id: "rel_webhooks",
    title: "GitHub webhook ingestion",
    repository: "shipflow/platform",
    status: "ready",
    riskScore: 0.18,
    updatedAt: "2026-07-01T09:30:00.000Z"
  }
];

export const db = {
  release: {
    list: async () => demoReleases,
    byId: async (id: string) => demoReleases.find((release) => release.id === id) ?? null
  }
};
