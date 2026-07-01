import { Card } from "@shipflow/ui";

export default function IntakePage() {
  return <main style={{ padding: 48, maxWidth: 920, margin: "0 auto" }}>
    <Card>
      <p style={{ color: "var(--accent)", fontWeight: 700 }}>Release intake</p>
      <h1>Describe the change you want to ship</h1>
      <form style={{ display: "grid", gap: 16 }}>
        <input name="repository" placeholder="Repository, e.g. shipflow/platform" style={fieldStyle} />
        <input name="branch" placeholder="Branch or PR URL" style={fieldStyle} />
        <textarea name="goal" placeholder="What changed, who is impacted, and what does success look like?" rows={8} style={fieldStyle} />
        <button style={{ ...fieldStyle, cursor: "pointer", background: "#38bdf8", color: "#07111f", fontWeight: 800 }}>Generate release plan via tRPC</button>
      </form>
    </Card>
  </main>;
}

const fieldStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 12, padding: 14, background: "rgba(2,6,23,.72)", color: "white" };
