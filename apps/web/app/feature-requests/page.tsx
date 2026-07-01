import { appRouter } from "@shipflow/api";
import { createAuthContext } from "@shipflow/auth";
import { Card } from "@shipflow/ui";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function FeatureRequestsPage({ searchParams }: { searchParams: Promise<{ workspaceId?: string; projectId?: string }> }) {
  const params = await searchParams;
  const ctx = await createAuthContext(await headers(), params.workspaceId);
  if (!ctx.session) return <main style={mainStyle}><Card><h1>Sign in to create feature requests</h1><a href="/api/auth/sign-in" style={buttonStyle}>Sign in</a></Card></main>;
  if (!ctx.workspace) return <main style={mainStyle}><Card><h1>Select a workspace</h1><p style={mutedStyle}>Feature request intake is scoped to a workspace and project.</p></Card></main>;

  const caller = appRouter.createCaller(ctx);
  const [projects, featureRequests] = await Promise.all([caller.projects.list(), caller.featureRequests.list(params.projectId ? { projectId: params.projectId } : undefined)]);
  const selectedProjectId = params.projectId ?? projects[0]?.id;

  async function createManualRequest(formData: FormData) {
    "use server";
    const ctx = await createAuthContext(await headers(), params.workspaceId);
    const caller = appRouter.createCaller(ctx);
    const request = await caller.featureRequests.create({
      projectId: String(formData.get("projectId")),
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      priority: String(formData.get("priority")) as "low" | "medium" | "high" | "urgent",
      source: "manual"
    });
    redirect(`/feature-requests/${request.id}${params.workspaceId ? `?workspaceId=${params.workspaceId}` : ""}`);
  }

  async function createPlaceholder(formData: FormData) {
    "use server";
    const ctx = await createAuthContext(await headers(), params.workspaceId);
    const caller = appRouter.createCaller(ctx);
    const request = await caller.featureRequests.createPlaceholder({
      projectId: String(formData.get("projectId")),
      source: String(formData.get("source")) as "email_import" | "support_ticket" | "customer_call_transcript"
    });
    redirect(`/feature-requests/${request.id}${params.workspaceId ? `?workspaceId=${params.workspaceId}` : ""}`);
  }

  return <main style={mainStyle}>
    <nav style={navStyle}><Link href="/dashboard"><strong>ShipFlow AI</strong></Link><span style={mutedStyle}>{ctx.workspace.workspaceName}</span></nav>
    <Card>
      <p style={eyebrowStyle}>Feature request intake</p>
      <h1>Create a request under a project</h1>
      <p style={mutedStyle}>Capture manual requests now, or create placeholders for email imports, support tickets, and customer call transcripts while integrations are being wired up.</p>
      {projects.length === 0 ? <p style={warningStyle}>Create a project before adding feature requests.</p> : <form action={createManualRequest} style={formStyle}>
        <select name="projectId" defaultValue={selectedProjectId} style={fieldStyle}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>
        <input name="title" placeholder="Request title" required minLength={4} style={fieldStyle} />
        <textarea name="description" placeholder="Who needs this, what problem it solves, goal, constraints, edge cases, and business context" required minLength={10} rows={7} style={fieldStyle} />
        <select name="priority" defaultValue="medium" style={fieldStyle}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
        <button style={buttonStyle}>Create manual request</button>
      </form>}
    </Card>
    {projects.length > 0 && <Card style={{ marginTop: 16 }}><h2>Placeholder sources</h2><div style={placeholderGridStyle}>{[
      ["email_import", "Email/import placeholder"], ["support_ticket", "Support ticket placeholder"], ["customer_call_transcript", "Customer call transcript placeholder"]
    ].map(([source, label]) => <form key={source} action={createPlaceholder} style={placeholderStyle}><input type="hidden" name="projectId" value={selectedProjectId} /><input type="hidden" name="source" value={source} /><strong>{label}</strong><p style={mutedStyle}>Creates a clarification-ready stub.</p><button style={secondaryButtonStyle}>Create</button></form>)}</div></Card>}
    <section style={{ marginTop: 16, display: "grid", gap: 12 }}>{featureRequests.map((request) => <Card key={request.id}><Link href={`/feature-requests/${request.id}${params.workspaceId ? `?workspaceId=${params.workspaceId}` : ""}`}><strong>{request.title}</strong></Link><p style={mutedStyle}>{request.project?.name ?? "No project"} · {request.status} · {request.clarificationQuestions.filter((q) => q.status === "open").length} open questions</p></Card>)}</section>
  </main>;
}

const mainStyle = { padding: 48, maxWidth: 1080, margin: "0 auto" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: 24 };
const formStyle = { display: "grid", gap: 12, marginTop: 16 };
const fieldStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.72)", color: "var(--foreground)" };
const buttonStyle = { ...fieldStyle, cursor: "pointer", background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 800 };
const secondaryButtonStyle = { ...buttonStyle, background: "var(--secondary)", color: "var(--secondary-foreground)" };
const mutedStyle = { color: "var(--muted-foreground)" };
const eyebrowStyle = { color: "var(--primary)", fontWeight: 800 };
const warningStyle = { background: "var(--warning)", color: "var(--warning-foreground)", borderRadius: 12, padding: 12 };
const placeholderGridStyle = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 };
const placeholderStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.45)" };
