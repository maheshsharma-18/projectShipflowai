import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db, type PrismaClient, type WorkspaceRole } from "@shipflow/db";
import { getEnv } from "@shipflow/config";

export type AuthSession = { userId: string; email: string; name?: string };

const env = getEnv();

export const auth = betterAuth({
  appName: "ShipFlow AI",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db.prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    } : undefined,
    google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    } : undefined
  },
  user: {
    additionalFields: {
      avatarUrl: {
        type: "string",
        required: false,
        input: false
      }
    }
  }
});

export function createAuthConfig() {
  return {
    appName: "ShipFlow AI",
    baseURL: env.BETTER_AUTH_URL,
    secretConfigured: Boolean(env.BETTER_AUTH_SECRET),
    emailAndPassword: true,
    socialProviders: ["github", "google"].filter((provider) => provider === "github" ? Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) : Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET))
  };
}

export async function getCurrentSession(headers?: Headers): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: headers ?? new Headers() });
  if (!session?.user) return null;
  return { userId: session.user.id, email: session.user.email, name: session.user.name ?? undefined };
}

export type WorkspaceMembership = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
};

export type AuthContext = {
  session: AuthSession | null;
  workspace: WorkspaceMembership | null;
  workspaces: WorkspaceMembership[];
};

export async function createAuthContext(headers: Headers, workspaceId?: string | null): Promise<AuthContext> {
  const session = await getCurrentSession(headers);
  if (!session) return { session: null, workspace: null, workspaces: [] };

  const memberships = await db.workspace.membershipsForUser(session.userId);
  const workspaces = memberships.map((member) => ({
    workspaceId: member.workspaceId,
    workspaceName: member.workspace.name,
    workspaceSlug: member.workspace.slug,
    role: member.role
  }));
  const workspace = workspaces.find((member) => member.workspaceId === workspaceId || member.workspaceSlug === workspaceId) ?? workspaces[0] ?? null;

  return { session, workspace, workspaces };
}

export async function createOnboardingWorkspace(input: { userId: string; name: string; slug?: string }, prisma: PrismaClient = db.prisma) {
  const slug = input.slug ?? slugify(input.name);
  return prisma.workspace.create({
    data: {
      name: input.name,
      slug,
      members: {
        create: {
          userId: input.userId,
          role: "owner"
        }
      }
    },
    include: { members: true }
  });
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "workspace";
}
