import { getEnv } from "@shipflow/config";

export type AuthSession = { userId: string; email: string; name?: string };

export function createAuthConfig() {
  const env = getEnv();
  return {
    appName: "ShipFlow AI",
    baseURL: env.BETTER_AUTH_URL,
    secretConfigured: Boolean(env.BETTER_AUTH_SECRET)
  };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  return null;
}
