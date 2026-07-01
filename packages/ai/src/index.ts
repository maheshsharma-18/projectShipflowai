export type ShipFlowPlanInput = { goal: string; repository?: string; branch?: string };
export type ShipFlowPlan = { summary: string; checks: string[]; rollout: string[]; risks: string[] };

export const shipFlowSystemPrompt = `You are ShipFlow AI, an engineering release copilot. Convert product goals, pull requests, and deployment context into actionable release plans. Prefer concrete checks, staged rollout steps, and risk notes over generic website generation.`;

export function createReleasePlan(input: ShipFlowPlanInput): ShipFlowPlan {
  const scope = input.repository ? ` for ${input.repository}` : "";
  return {
    summary: `Prepare a release plan${scope}: ${input.goal}`,
    checks: ["Run type checks and unit tests", "Review open GitHub checks", "Confirm observability dashboards and rollback owner"],
    rollout: ["Create a release candidate", "Ship to an internal cohort", "Ramp production traffic after metrics stay healthy"],
    risks: ["Unreviewed schema or API contract drift", "Missing webhook retry coverage", "Insufficient post-deploy monitoring"]
  };
}
