import { createAuthContext } from "@shipflow/auth";
import { Card } from "@shipflow/ui";
import { headers } from "next/headers";
import Link from "next/link";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const params = await searchParams;
  const auth = await createAuthContext(await headers(), params.workspaceId);

  if (!auth.session) {
    return <main style={{ padding: 48, maxWidth: 920, margin: "0 auto" }}><Card><h1>Sign in to ShipFlow AI</h1><p style={{ color: "var(--muted)" }}>Use email/password or a configured social provider through BetterAuth.</p><a href="/api/auth/sign-in" style={buttonStyle}>Sign in</a></Card></main>;
  }

  return <main style={{ padding: 48, maxWidth: 1180, margin: "0 auto" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
      <Link href="/"><strong>ShipFlow AI</strong></Link>
      <WorkspaceSwitcher workspaces={auth.workspaces} activeWorkspaceId={auth.workspace?.workspaceId} />
    </nav>
    <Card>
      <p style={{ color: "var(--accent)", fontWeight: 700 }}>Dashboard</p>
      <h1>{auth.workspace ? auth.workspace.workspaceName : "Create your first workspace"}</h1>
      <p style={{ color: "var(--muted)" }}>{auth.workspace ? `Current role: ${auth.workspace.role}` : "Onboarding creates a workspace and assigns you owner access."}</p>
    </Card>
  </main>;
}

function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: { workspaces: { workspaceId: string; workspaceName: string; workspaceSlug: string; role: string }[]; activeWorkspaceId?: string }) {
  return <form action="/dashboard" style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label htmlFor="workspace" style={{ color: "var(--muted)" }}>Workspace</label>
    <select id="workspace" name="workspaceId" defaultValue={activeWorkspaceId} style={selectStyle}>
      {workspaces.map((workspace) => <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.workspaceName} · {workspace.role}</option>)}
    </select>
    <button style={buttonStyle}>Switch</button>
  </form>;
}

const selectStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "rgba(2,6,23,.72)", color: "white" };
const buttonStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", background: "#38bdf8", color: "#07111f", fontWeight: 800, cursor: "pointer" };
