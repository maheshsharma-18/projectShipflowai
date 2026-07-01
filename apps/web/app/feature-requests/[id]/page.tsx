import { appRouter } from "@shipflow/api";
import { createAuthContext } from "@shipflow/auth";
import { Card } from "@shipflow/ui";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function FeatureRequestDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ workspaceId?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const ctx = await createAuthContext(await headers(), query.workspaceId);
  if (!ctx.session) return <main style={mainStyle}><Card><h1>Sign in to view this request</h1><a href="/api/auth/sign-in" style={buttonStyle}>Sign in</a></Card></main>;
  const caller = appRouter.createCaller(ctx);
  const request = await caller.featureRequests.byId({ id });
  if (!request) notFound();
  const metadata = request.metadata as { clarification?: { alreadyExists?: boolean; actionable?: boolean; recommendation?: string; rationale?: string; missing?: string[] } } | null;
  const clarification = metadata?.clarification;

  async function answerQuestion(formData: FormData) {
    "use server";
    const ctx = await createAuthContext(await headers(), query.workspaceId);
    const caller = appRouter.createCaller(ctx);
    await caller.featureRequests.answerQuestion({ questionId: String(formData.get("questionId")), answer: String(formData.get("answer")) });
    redirect(`/feature-requests/${id}${query.workspaceId ? `?workspaceId=${query.workspaceId}` : ""}`);
  }

  return <main style={mainStyle}>
    <nav style={navStyle}><Link href={`/feature-requests${query.workspaceId ? `?workspaceId=${query.workspaceId}` : ""}`}>← Feature requests</Link><span style={mutedStyle}>{request.project?.name ?? "No project"}</span></nav>
    <Card><p style={eyebrowStyle}>Request detail · {request.status}</p><h1>{request.title}</h1><p style={{ whiteSpace: "pre-wrap" }}>{request.description}</p><p style={mutedStyle}>Priority: {request.priority} · Source: {String((request as { source?: string }).source ?? (request.metadata as { source?: string } | null)?.source ?? "manual")}</p></Card>
    <Card style={{ marginTop: 16 }}><h2>AI clarification state</h2>{clarification ? <div style={gridStyle}><p><strong>Already exists:</strong> {clarification.alreadyExists ? "Yes" : "No"}</p><p><strong>Actionable:</strong> {clarification.actionable ? "Yes" : "No"}</p><p><strong>Next step:</strong> {clarification.recommendation === "proceed_to_prd" ? "Proceed to PRD generation" : "Ask follow-up questions"}</p><p><strong>Missing:</strong> {clarification.missing?.join(", ") || "None"}</p><p style={{ gridColumn: "1 / -1", ...mutedStyle }}>{clarification.rationale}</p></div> : <p style={mutedStyle}>No clarification run has been stored yet.</p>}</Card>
    <Card style={{ marginTop: 16 }}><h2>Clarification questions and answers</h2><div style={{ display: "grid", gap: 12 }}>{request.clarificationQuestions.map((question) => <div key={question.id} style={questionStyle}><strong>{question.question}</strong><p style={mutedStyle}>Status: {question.status}{question.answeredBy?.email ? ` · answered by ${question.answeredBy.email}` : ""}</p>{question.answer ? <p>{question.answer}</p> : <form action={answerQuestion} style={formStyle}><input type="hidden" name="questionId" value={question.id} /><textarea name="answer" required rows={3} placeholder="Add clarification answer" style={fieldStyle} /><button style={buttonStyle}>Save answer</button></form>}</div>)}</div></Card>
  </main>;
}

const mainStyle = { padding: 48, maxWidth: 980, margin: "0 auto" };
const navStyle = { display: "flex", justifyContent: "space-between", marginBottom: 24 };
const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 };
const questionStyle = { border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.45)" };
const formStyle = { display: "grid", gap: 10 };
const fieldStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.72)", color: "var(--foreground)" };
const buttonStyle = { ...fieldStyle, cursor: "pointer", background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 800 };
const mutedStyle = { color: "var(--muted-foreground)" };
const eyebrowStyle = { color: "var(--primary)", fontWeight: 800 };
