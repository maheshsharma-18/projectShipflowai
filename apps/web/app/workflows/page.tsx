import { Card } from "@shipflow/ui";

const workflows = ["GitHub webhook triage", "AI release-plan generation", "Pre-deploy check aggregation", "Post-deploy health review"];

export default function WorkflowsPage() {
  return <main style={{ padding: 48, maxWidth: 920, margin: "0 auto" }}><Card><p style={{ color: "var(--accent)", fontWeight: 700 }}>Inngest workflows</p><h1>Automation map</h1>{workflows.map((workflow, index) => <p key={workflow}>{index + 1}. {workflow}</p>)}</Card></main>;
}
