import { Button, Card } from "@shipflow/ui";
import Link from "next/link";

const loopSteps = ["Feature Request", "PRD", "Tasks", "Code", "AI Review", "Fixes", "Approval", "Ship"];

const productSections = [
  {
    title: "Product Discovery",
    eyebrow: "01 · Capture",
    description: "Turn customer requests, sales notes, and team ideas into structured opportunities with context, owners, and evidence.",
    accent: "var(--success)"
  },
  {
    title: "Planning",
    eyebrow: "02 · Shape",
    description: "Generate PRDs, acceptance criteria, milestones, and release risks before work reaches the backlog.",
    accent: "var(--secondary)"
  },
  {
    title: "Development",
    eyebrow: "03 · Build",
    description: "Break approved plans into engineering tasks that map directly to branches, pull requests, and progress signals.",
    accent: "var(--accent)"
  },
  {
    title: "AI Review",
    eyebrow: "04 · Verify",
    description: "Let AI review the implementation against the PRD, flag regressions, and recommend safe fixes before approval.",
    accent: "var(--primary)",
    dark: true
  },
  {
    title: "Human Approval",
    eyebrow: "05 · Release",
    description: "Keep product, engineering, design, and leadership in the loop with clear approval gates and ship-ready summaries.",
    accent: "var(--warning)"
  }
];

const teamRoles = ["Product lead", "Designer", "Engineering manager", "Developer", "AI reviewer", "Approver"];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Validate your first AI-assisted delivery loop with one workspace and lightweight planning.",
    features: ["Feature intake", "PRD drafts", "Basic GitHub sync"]
  },
  {
    name: "Paid plans",
    price: "From $49",
    description: "Scale delivery rituals across teams with review automation, approvals, and tenant controls.",
    features: ["Unlimited delivery loops", "AI review gates", "Multi-tenant team workflows"]
  }
];

export default function HomePage() {
  return <main style={{ padding: "32px", maxWidth: 1220, margin: "0 auto" }}>
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, marginBottom: 48 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, letterSpacing: "-.03em" }}>
        <span style={{ width: 34, height: 34, borderRadius: 12, display: "inline-grid", placeItems: "center", background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "0 12px 26px rgba(161,130,118,.24)" }}>S</span>
        ShipFlow AI
      </Link>
      <div style={{ display: "flex", gap: 18, color: "var(--muted-foreground)", flexWrap: "wrap" }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/intake">Plan release</Link>
        <Link href="/workflows">Workflows</Link>
      </div>
    </nav>

    <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, .9fr)", gap: 24, alignItems: "stretch" }}>
      <Card style={{ padding: 36, background: "linear-gradient(135deg, rgba(255,250,240,.9), rgba(252,223,166,.7))" }}>
        <p style={{ color: "var(--primary)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" }}>AI-assisted product delivery</p>
        <h1 style={{ fontSize: "clamp(44px, 7vw, 78px)", lineHeight: .95, margin: "18px 0", letterSpacing: "-.07em" }}>Ship features from request to release with AI-assisted product delivery</h1>
        <p style={{ color: "var(--muted-foreground)", fontSize: 20, lineHeight: 1.65, maxWidth: 720 }}>ShipFlow AI connects discovery, planning, code, review, approvals, and launch coordination in one warm, transparent workflow for modern product teams.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
          <Link href="/dashboard"><Button>Sign up free</Button></Link>
          <Link href="/workflows"><Button style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>Book a demo</Button></Link>
        </div>
      </Card>

      <Card style={{ padding: 28, background: "var(--primary)", color: "var(--primary-foreground)", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <div>
          <p style={{ color: "var(--soft-peach)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" }}>Core loop</p>
          <h2 style={{ fontSize: 34, lineHeight: 1.1, margin: "12px 0 20px" }}>From signal to shipped software.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {loopSteps.map((step, index) => <div key={step} style={{ border: "1px solid rgba(255,250,240,.34)", borderRadius: 16, padding: 14, background: index % 2 === 0 ? "rgba(203,232,150,.24)" : "rgba(244,184,134,.26)" }}>
            <span style={{ opacity: .72, fontSize: 12, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</span>
            <strong style={{ display: "block", marginTop: 6 }}>{step}</strong>
          </div>)}
        </div>
      </Card>
    </section>

    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 14 }}>
      {productSections.map((section) => <Card key={section.title} style={{ minHeight: 260, background: section.accent, color: section.dark ? "var(--primary-foreground)" : "var(--foreground)" }}>
        <p style={{ fontWeight: 900, opacity: .76 }}>{section.eyebrow}</p>
        <h2 style={{ marginTop: 8 }}>{section.title}</h2>
        <p style={{ lineHeight: 1.55 }}>{section.description}</p>
      </Card>)}
    </section>

    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card style={{ background: "linear-gradient(135deg, var(--secondary), rgba(170,192,170,.62))" }}>
        <p style={{ color: "var(--secondary-foreground)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" }}>GitHub integration</p>
        <h2>Keep delivery synced with pull requests.</h2>
        <p style={{ color: "var(--secondary-foreground)", lineHeight: 1.6 }}>Connect repositories so ShipFlow AI can attach PRDs to branches, watch PR status, summarize reviews, and route fixes back into the same delivery loop.</p>
      </Card>
      <Card style={{ background: "linear-gradient(135deg, var(--soft-peach), rgba(203,232,150,.52))" }}>
        <p style={{ color: "var(--primary)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" }}>Multi-tenant workflow</p>
        <h2>One operating rhythm for every team.</h2>
        <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6 }}>Create separate workspaces for clients, departments, or products while preserving shared templates, role-aware approvals, and tenant-specific delivery metrics.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>{teamRoles.map((role) => <span key={role} style={{ border: "1px solid var(--border)", borderRadius: 999, padding: "8px 10px", background: "rgba(255,250,240,.62)", fontWeight: 700 }}>{role}</span>)}</div>
      </Card>
    </section>

    <section style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
      {pricingPlans.map((plan) => <Card key={plan.name} style={{ padding: 30 }}>
        <p style={{ color: "var(--primary)", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" }}>Pricing teaser</p>
        <h2 style={{ fontSize: 38, marginBottom: 8 }}>{plan.name}</h2>
        <strong style={{ fontSize: 32 }}>{plan.price}</strong>
        <p style={{ color: "var(--muted-foreground)", lineHeight: 1.6 }}>{plan.description}</p>
        <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      </Card>)}
    </section>

    <section style={{ marginTop: 24, marginBottom: 24 }}>
      <Card style={{ textAlign: "center", padding: 38, background: "linear-gradient(135deg, var(--primary), var(--dusty-taupe))", color: "var(--primary-foreground)" }}>
        <h2 style={{ fontSize: 44, margin: "0 0 12px" }}>Ready to ship the next request?</h2>
        <p style={{ color: "var(--soft-peach)", fontSize: 18 }}>Start free, then invite your team when your first AI-assisted release loop is ready.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/dashboard"><Button style={{ background: "var(--success)", color: "var(--success-foreground)" }}>Sign up free</Button></Link>
          <Link href="/workflows"><Button style={{ background: "transparent", color: "var(--primary-foreground)", borderColor: "rgba(255,250,240,.54)" }}>Book a demo</Button></Link>
        </div>
      </Card>
    </section>
  </main>;
}
