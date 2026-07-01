import { appRouter } from "@shipflow/api";
import { createAuthContext } from "@shipflow/auth";
import { Card } from "@shipflow/ui";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type StructuredPRD = {
  problemStatement?: string;
  goals?: string[];
  nonGoals?: string[];
  userStories?: { persona?: string; need?: string; benefit?: string }[];
  acceptanceCriteria?: string[];
  edgeCases?: string[];
  successMetrics?: string[];
};

export default async function PRDEditorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workspaceId?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const ctx = await createAuthContext(await headers(), query.workspaceId);
  if (!ctx.session) return <main style={mainStyle}><Card><h1>Sign in to edit PRDs</h1><a href="/api/auth/sign-in" style={buttonStyle}>Sign in</a></Card></main>;
  const caller = appRouter.createCaller(ctx);
  const request = await caller.featureRequests.byId({ id });
  if (!request) notFound();
  const prds = await caller.prds.byFeatureRequest({ featureRequestId: id });
  const latest = prds[0];
  const structured = latest?.structured as StructuredPRD | null | undefined;
  const hrefSuffix = query.workspaceId ? `?workspaceId=${query.workspaceId}` : "";

  async function savePRD(formData: FormData) {
    "use server";
    const ctx = await createAuthContext(await headers(), query.workspaceId);
    const caller = appRouter.createCaller(ctx);
    await caller.prds.update({ id: String(formData.get("prdId")), content: String(formData.get("content")) });
    redirect(`/feature-requests/${id}/prd${hrefSuffix}`);
  }

  async function approvePRD(formData: FormData) {
    "use server";
    const ctx = await createAuthContext(await headers(), query.workspaceId);
    const caller = appRouter.createCaller(ctx);
    await caller.prds.approve({ id: String(formData.get("prdId")) });
    redirect(`/feature-requests/${id}/prd${hrefSuffix}`);
  }

  async function generatePRD() {
    "use server";
    const ctx = await createAuthContext(await headers(), query.workspaceId);
    const caller = appRouter.createCaller(ctx);
    await caller.prds.generate({ featureRequestId: id });
    redirect(`/feature-requests/${id}/prd${hrefSuffix}`);
  }

  async function regeneratePRD() {
    "use server";
    const ctx = await createAuthContext(await headers(), query.workspaceId);
    const caller = appRouter.createCaller(ctx);
    await caller.prds.regenerate({ featureRequestId: id });
    redirect(`/feature-requests/${id}/prd${hrefSuffix}`);
  }

  return <main style={mainStyle}>
    <nav style={navStyle}><Link href={`/feature-requests/${id}${hrefSuffix}`}>← Request</Link><span style={mutedStyle}>{request.project?.name ?? "No project"}</span></nav>
    <Card><p style={eyebrowStyle}>PRD editor · {latest?.status ?? "not generated"}</p><h1>{request.title}</h1><p style={mutedStyle}>Latest PRD must be approved before engineering task generation can begin.</p>{!latest ? <form action={generatePRD}><button style={buttonStyle}>Generate PRD</button></form> : null}</Card>
    {latest ? <>
      <Card style={{ marginTop: 16 }}><h2>Generated sections</h2><Section title="Problem statement" value={structured?.problemStatement} /><List title="Goals" values={structured?.goals} /><List title="Non-goals" values={structured?.nonGoals} /><List title="User stories" values={structured?.userStories?.map((story) => `As ${story.persona}, I want ${story.need}, so that ${story.benefit}.`)} /><List title="Acceptance criteria" values={structured?.acceptanceCriteria} /><List title="Edge cases" values={structured?.edgeCases} /><List title="Success metrics" values={structured?.successMetrics} /></Card>
      <Card style={{ marginTop: 16 }}><h2>Editable markdown / rich text source</h2><form action={savePRD} style={formStyle}><input type="hidden" name="prdId" value={latest.id} /><textarea name="content" rows={24} defaultValue={latest.content} disabled={latest.status === "approved"} style={textAreaStyle} /><button disabled={latest.status === "approved"} style={buttonStyle}>Save changes</button></form><div style={actionRowStyle}><form action={approvePRD}><input type="hidden" name="prdId" value={latest.id} /><button disabled={latest.status === "approved"} style={buttonStyle}>Approve PRD</button></form><form action={regeneratePRD}><button style={secondaryButtonStyle}>Request regeneration</button></form></div></Card>
    </> : null}
  </main>;
}

function Section({ title, value }: { title: string; value?: string }) {
  return <section style={sectionStyle}><h3>{title}</h3><p>{value || "Not generated yet."}</p></section>;
}

function List({ title, values }: { title: string; values?: string[] }) {
  return <section style={sectionStyle}><h3>{title}</h3>{values?.length ? <ul>{values.map((value, index) => <li key={`${title}-${index}`}>{value}</li>)}</ul> : <p style={mutedStyle}>Not generated yet.</p>}</section>;
}

const mainStyle = { padding: 48, maxWidth: 1100, margin: "0 auto" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: 24 };
const formStyle = { display: "grid", gap: 10 };
const sectionStyle = { borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 };
const actionRowStyle = { display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 16 };
const fieldStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.72)", color: "var(--foreground)" };
const textAreaStyle = { ...fieldStyle, fontFamily: "var(--font-mono, monospace)", minHeight: 520 };
const buttonStyle = { ...fieldStyle, cursor: "pointer", background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 800 };
const secondaryButtonStyle = { ...buttonStyle, background: "transparent", color: "var(--foreground)" };
const mutedStyle = { color: "var(--muted-foreground)" };
const eyebrowStyle = { color: "var(--primary)", fontWeight: 800 };
