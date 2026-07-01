import { createReleasePlan } from "@shipflow/ai";
import { db } from "@shipflow/db";
import { Button, Card } from "@shipflow/ui";
import Link from "next/link";

const stats = [
  { label: "Blocking issues", value: "2", token: "var(--blocking-issue)", color: "var(--blocking-issue-foreground)" },
  { label: "Non-blocking", value: "7", token: "var(--non-blocking-issue)", color: "var(--non-blocking-issue-foreground)" },
  { label: "Launch confidence", value: "84%", token: "var(--success)", color: "var(--success-foreground)" }
];

const timeline = ["PRD approved", "GitHub signals reviewed", "Stakeholder approval pending"];

export default async function HomePage() {
  const releases = await db.release.list();
  const plan = createReleasePlan({ goal: "Ship the next customer-facing workflow safely", repository: "shipflow/platform" });

  return <main style={{ padding: "48px", maxWidth: 1180, margin: "0 auto" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
      <strong>ShipFlow AI</strong>
      <div style={{ display: "flex", gap: 18, color: "var(--muted-foreground)" }}><Link href="/dashboard">Dashboard</Link><Link href="/intake">Plan release</Link><Link href="/workflows">Workflows</Link></div>
    </nav>
    <section style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 24, alignItems: "stretch" }}>
      <Card>
        <p style={{ color: "var(--primary)", fontWeight: 800 }}>AI release orchestration</p>
        <h1 style={{ fontSize: 64, lineHeight: 1, margin: "16px 0" }}>Turn pull requests into confident launches.</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 20, lineHeight: 1.6 }}>A warm Shadcn/Tailwind token system now guides release planning, Kanban status, PRD editing, review timelines, billing, and approvals.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}><Link href="/intake"><Button>Start a release plan</Button></Link><Link href="/workflows"><Button style={{ background: "transparent", color: "var(--foreground)" }}>View workflows</Button></Link></div>
      </Card>
      <Card>
        <h2>Suggested plan</h2>
        <p style={{ color: "var(--muted-foreground)" }}>{plan.summary}</p>
        <ul>{plan.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </Card>
    </section>
    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {stats.map((stat) => <Card key={stat.label} style={{ background: stat.token, color: stat.color }}><p>{stat.label}</p><strong style={{ fontSize: 34 }}>{stat.value}</strong></Card>)}
    </section>
    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {releases.map((release) => <Card key={release.id}><h3>{release.title}</h3><p style={{ color: "var(--muted-foreground)" }}>{release.repository} · {release.status}</p><p>Risk score: {Math.round(release.riskScore * 100)}%</p></Card>)}
      <Card><h3>Approval timeline</h3>{timeline.map((item) => <p key={item} style={{ borderLeft: "4px solid var(--accent)", paddingLeft: 12 }}>{item}</p>)}</Card>
    </section>
  </main>;
}
