import { Card } from "@shipflow/ui";

const workflows = ["GitHub webhook triage", "AI release-plan generation", "Pre-deploy check aggregation", "Post-deploy health review"];
const billing = ["Usage reviewed", "PO approved", "Invoice routed"];

export default function WorkflowsPage() {
  return <main style={{ padding: 48, maxWidth: 1040, margin: "0 auto" }}>
    <Card><p style={{ color: "var(--primary)", fontWeight: 800 }}>Inngest workflows</p><h1>Automation map</h1>{workflows.map((workflow, index) => <p key={workflow} style={{ borderLeft: `4px solid ${index % 2 ? "var(--accent)" : "var(--secondary)"}`, paddingLeft: 12 }}>{index + 1}. {workflow}</p>)}</Card>
    <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card><h2>Review timeline</h2><p style={timelineStyle}>10:00 · AI checks started</p><p style={timelineStyle}>10:08 · Blocking issue assigned</p><p style={timelineStyle}>10:21 · Approval requested</p></Card>
      <Card><h2>Billing approval</h2>{billing.map((item) => <p key={item} style={billingStyle}>{item}</p>)}</Card>
    </section>
  </main>;
}

const timelineStyle = { background: "rgba(255,250,240,.62)", border: "1px solid var(--border)", borderRadius: 12, padding: 12 };
const billingStyle = { background: "var(--accent)", color: "var(--accent-foreground)", borderRadius: 12, padding: 12 };
