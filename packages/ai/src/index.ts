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

export type FeatureClarificationInput = {
  title: string;
  description: string;
  projectContext?: string | null;
  existingFeatures?: { id: string; title: string; description?: string | null }[];
};

export type ClarificationDimension = "user" | "problem" | "goal" | "constraints" | "edge_cases" | "business_context" | "existing_feature" | "actionability";
export type FeatureClarificationResult = {
  alreadyExists: boolean;
  matchingFeatureIds: string[];
  actionable: boolean;
  missing: ClarificationDimension[];
  questions: { dimension: ClarificationDimension; question: string }[];
  recommendation: "ask_follow_up" | "proceed_to_prd";
  rationale: string;
};

const dimensionSignals: Record<Exclude<ClarificationDimension, "existing_feature" | "actionability">, string[]> = {
  user: ["user", "customer", "admin", "manager", "developer", "team", "persona", "role"],
  problem: ["problem", "pain", "issue", "struggle", "cannot", "can't", "slow", "broken", "because"],
  goal: ["goal", "success", "so that", "increase", "reduce", "improve", "enable", "allow"],
  constraints: ["constraint", "must", "must not", "compliance", "deadline", "budget", "permission", "security"],
  edge_cases: ["edge", "exception", "fallback", "empty", "error", "offline", "retry", "failure"],
  business_context: ["revenue", "churn", "deal", "sales", "support", "priority", "business", "enterprise", "segment"]
};

const followUpQuestions: Record<ClarificationDimension, string> = {
  user: "Who is the primary user or customer segment for this request?",
  problem: "What specific problem or pain is this request trying to solve?",
  goal: "What outcome should improve, and how will success be measured?",
  constraints: "Are there technical, compliance, timeline, or UX constraints we must respect?",
  edge_cases: "What edge cases, failure states, or non-happy paths should the product handle?",
  business_context: "What business context, urgency, customer evidence, or priority should shape this work?",
  existing_feature: "How is this different from the existing feature that appears to cover the same need?",
  actionability: "What concrete behavior should be added or changed so engineering can build it?"
};

export function clarifyFeatureRequest(input: FeatureClarificationInput): FeatureClarificationResult {
  const text = `${input.title}\n${input.description}`.toLowerCase();
  const titleWords = new Set(input.title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3));
  const matchingFeatureIds = (input.existingFeatures ?? []).filter((feature) => {
    const existing = `${feature.title} ${feature.description ?? ""}`.toLowerCase();
    const sharedWords = [...titleWords].filter((word) => existing.includes(word));
    return feature.title.toLowerCase() === input.title.toLowerCase() || sharedWords.length >= Math.min(3, titleWords.size);
  }).map((feature) => feature.id);

  const missing = (Object.entries(dimensionSignals) as [Exclude<ClarificationDimension, "existing_feature" | "actionability">, string[]][])
    .filter(([, signals]) => !signals.some((signal) => text.includes(signal)))
    .map(([dimension]) => dimension);

  const hasActionVerb = /\b(add|build|create|change|update|integrate|send|show|allow|enable|prevent|import|export|generate|track|notify)\b/i.test(text);
  const actionable = hasActionVerb && input.description.trim().split(/\s+/).length >= 12 && missing.length <= 3;
  if (!actionable) missing.push("actionability");
  const alreadyExists = matchingFeatureIds.length > 0;
  if (alreadyExists) missing.push("existing_feature");

  const dedupedMissing = [...new Set(missing)];
  const questions = dedupedMissing.map((dimension) => ({ dimension, question: followUpQuestions[dimension] }));
  return {
    alreadyExists,
    matchingFeatureIds,
    actionable,
    missing: dedupedMissing,
    questions,
    recommendation: questions.length > 0 ? "ask_follow_up" : "proceed_to_prd",
    rationale: questions.length > 0 ? "The request needs more clarification before PRD generation." : "The request has enough user, problem, goal, constraint, edge-case, and business context to draft a PRD."
  };
}
