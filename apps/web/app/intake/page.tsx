import { Card } from "@shipflow/ui";

export default function IntakePage() {
  return <main style={{ padding: 48, maxWidth: 1040, margin: "0 auto" }}>
    <Card>
      <p style={{ color: "var(--primary)", fontWeight: 800 }}>PRD editor</p>
      <h1>Describe the change you want to ship</h1>
      <form style={{ display: "grid", gap: 16 }}>
        <input name="repository" placeholder="Repository, e.g. shipflow/platform" style={fieldStyle} />
        <input name="branch" placeholder="Branch or PR URL" style={fieldStyle} />
        <textarea name="goal" placeholder="What changed, who is impacted, and what does success look like?" rows={8} style={fieldStyle} />
        <button style={{ ...fieldStyle, cursor: "pointer", background: "var(--primary)", color: "var(--primary-foreground)", fontWeight: 800 }}>Generate release plan via tRPC</button>
      </form>
    </Card>
    <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card><h2>Approval screen preview</h2><p style={successStyle}>Success criteria mapped to lime cream.</p><p style={warningStyle}>Finance review needs billing confirmation.</p></Card>
      <Card><h2>Review notes</h2><p style={blockingStyle}>Blocking issue: migration rollback is missing.</p><p style={nonBlockingStyle}>Non-blocking issue: update changelog copy.</p></Card>
    </section>
  </main>;
}

const fieldStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(255,250,240,.72)", color: "var(--foreground)" };
const successStyle = { background: "var(--success)", color: "var(--success-foreground)", borderRadius: 12, padding: 12 };
const warningStyle = { background: "var(--warning)", color: "var(--warning-foreground)", borderRadius: 12, padding: 12 };
const blockingStyle = { background: "var(--blocking-issue)", color: "var(--blocking-issue-foreground)", borderRadius: 12, padding: 12 };
const nonBlockingStyle = { background: "var(--non-blocking-issue)", color: "var(--non-blocking-issue-foreground)", borderRadius: 12, padding: 12 };
