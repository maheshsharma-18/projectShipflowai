import { createAuthContext } from "@shipflow/auth";
import { Card } from "@shipflow/ui";
import { headers } from "next/headers";
import Link from "next/link";

const kanban = [
  { title: "PRD editor", items: ["Clarify enterprise rollout", "Attach success metrics"], border: "var(--secondary)" },
  { title: "Review timeline", items: ["Security review complete", "QA signoff today"], border: "var(--accent)" },
  { title: "Approval screens", items: ["VP Product approval", "Release captain unblock"], border: "var(--primary)" }
];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const params = await searchParams;
  const auth = await createAuthContext(await headers(), params.workspaceId);

  if (!auth.session) {
    return <main style={{ padding: 48, maxWidth: 920, margin: "0 auto" }}><Card><h1>Sign in to ShipFlow AI</h1><p style={{ color: "var(--muted-foreground)" }}>Use email/password or a configured social provider through BetterAuth.</p><a href="/api/auth/sign-in" style={buttonStyle}>Sign in</a></Card></main>;
  }

  return <main style={{ padding: 48, maxWidth: 1180, margin: "0 auto" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
      <Link href="/"><strong>ShipFlow AI</strong></Link>
      <WorkspaceSwitcher workspaces={auth.workspaces} activeWorkspaceId={auth.workspace?.workspaceId} />
    </nav>
    <Card>
      <p style={{ color: "var(--primary)", fontWeight: 800 }}>Dashboard shell</p>
      <h1>{auth.workspace ? auth.workspace.workspaceName : "Create your first workspace"}</h1>
      <p style={{ color: "var(--muted-foreground)" }}>{auth.workspace ? `Current role: ${auth.workspace.role}` : "Onboarding creates a workspace and assigns you owner access."}</p>
    </Card>
    <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {kanban.map((column) => <Card key={column.title} style={{ borderTop: `6px solid ${column.border}` }}><h2>{column.title}</h2>{column.items.map((item) => <p key={item} style={kanbanCardStyle}>{item}</p>)}</Card>)}
    </section>
    <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card><h2>Billing pages</h2><p style={{ color: "var(--muted-foreground)" }}>Plan, seats, and invoice states use accent and warning tokens.</p><strong style={pillStyle}>Growth plan · $499/mo</strong></Card>
      <Card><h2>Issue legend</h2><p><span style={{ ...dotStyle, background: "var(--blocking-issue)" }} /> Blocking issue</p><p><span style={{ ...dotStyle, background: "var(--non-blocking-issue)" }} /> Non-blocking issue</p></Card>
    </section>
  </main>;
}

function WorkspaceSwitcher({ workspaces, activeWorkspaceId }: { workspaces: { workspaceId: string; workspaceName: string; workspaceSlug: string; role: string }[]; activeWorkspaceId?: string }) {
  return <form action="/dashboard" style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label htmlFor="workspace" style={{ color: "var(--muted-foreground)" }}>Workspace</label>
    <select id="workspace" name="workspaceId" defaultValue={activeWorkspaceId} style={selectStyle}>
      {workspaces.map((workspace) => <option key={workspace.workspaceId} value={workspace.workspaceId}>{workspace.workspaceName} · {workspace.role}</option>)}
    </select>
    <button style={buttonStyle}>Switch</button>
  </form>;
}

const selectStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: 12, background: "var(--card)", color: "var(--foreground)" };
const buttonStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 800, cursor: "pointer" };
const kanbanCardStyle = { background: "rgba(255,250,240,.58)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 };
const pillStyle = { display: "inline-block", background: "var(--warning)", color: "var(--warning-foreground)", borderRadius: 999, padding: "8px 12px" };
const dotStyle = { display: "inline-block", width: 12, height: 12, borderRadius: 999, marginRight: 8 };
