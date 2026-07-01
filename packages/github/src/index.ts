import { z } from "zod";

export const githubWebhookSchema = z.object({
  action: z.string().optional(),
  repository: z.object({ full_name: z.string() }).optional(),
  pull_request: z.object({ number: z.number(), title: z.string(), html_url: z.string().url() }).optional()
});

export type GitHubWebhookEvent = z.infer<typeof githubWebhookSchema>;

export function summarizePullRequestEvent(event: GitHubWebhookEvent) {
  if (!event.pull_request || !event.repository) return "GitHub event received without pull request context.";
  return `${event.action ?? "updated"} PR #${event.pull_request.number} in ${event.repository.full_name}: ${event.pull_request.title}`;
}

export function verifyWebhookSignature() {
  return { verified: true, mode: "placeholder" as const };
}
