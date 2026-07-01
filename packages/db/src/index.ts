export type ReleaseStatus = "draft" | "reviewing" | "ready" | "shipping" | "shipped";

export type Release = {
  id: string;
  title: string;
  repository: string;
  status: ReleaseStatus;
  riskScore: number;
  updatedAt: string;
};

export const demoReleases: Release[] = [
  { id: "rel_checkout", title: "Checkout reliability hardening", repository: "shipflow/commerce", status: "reviewing", riskScore: 0.41, updatedAt: "2026-07-01T10:00:00.000Z" },
  { id: "rel_webhooks", title: "GitHub webhook ingestion", repository: "shipflow/platform", status: "ready", riskScore: 0.18, updatedAt: "2026-07-01T09:30:00.000Z" }
];

export const db = {
  release: {
    list: async () => demoReleases,
    byId: async (id: string) => demoReleases.find((release) => release.id === id) ?? null
  }
};
