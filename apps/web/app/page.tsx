import { createReleasePlan } from "@shipflow/ai";
import { db } from "@shipflow/db";
import { Button, Card } from "@shipflow/ui";
import Link from "next/link";

export default async function HomePage() {
  const releases = await db.release.list();
  const plan = createReleasePlan({ goal: "Ship the next customer-facing workflow safely", repository: "shipflow/platform" });

  return <main style={{ padding: "48px", maxWidth: 1180, margin: "0 auto" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 56 }}>
      <strong>ShipFlow AI</strong>
      <div style={{ display: "flex", gap: 18, color: "var(--muted)" }}><Link href="/intake">Plan release</Link><Link href="/workflows">Workflows</Link></div>
    </nav>
    <section style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 24, alignItems: "stretch" }}>
      <Card>
        <p style={{ color: "var(--accent)", fontWeight: 700 }}>AI release orchestration</p>
        <h1 style={{ fontSize: 64, lineHeight: 1, margin: "16px 0" }}>Turn pull requests into confident launches.</h1>
        <p style={{ color: "var(--muted)", fontSize: 20, lineHeight: 1.6 }}>ShipFlow AI replaces the old website-builder prompt flow with release planning, GitHub signal intake, workflow automation, and AI-generated readiness checks.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}><Link href="/intake"><Button>Start a release plan</Button></Link><Link href="/workflows"><Button style={{ background: "transparent", color: "white", border: "1px solid var(--border)" }}>View workflows</Button></Link></div>
      </Card>
      <Card>
        <h2>Suggested plan</h2>
        <p style={{ color: "var(--muted)" }}>{plan.summary}</p>
        <ul>{plan.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </Card>
    </section>
    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {releases.map((release) => <Card key={release.id}><h3>{release.title}</h3><p style={{ color: "var(--muted)" }}>{release.repository} · {release.status}</p><p>Risk score: {Math.round(release.riskScore * 100)}%</p></Card>)}
    </section>
  </main>;
}
