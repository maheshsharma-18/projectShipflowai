import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional()
});

export type ShipFlowEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): ShipFlowEnv {
  return envSchema.parse(source);
}

export const productConfig = {
  name: "ShipFlow AI",
  tagline: "Plan, review, and ship code with AI-aware release workflows",
  defaultRiskThreshold: 0.72
} as const;
