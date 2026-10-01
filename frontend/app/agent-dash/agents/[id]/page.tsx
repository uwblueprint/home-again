import { notFound } from "next/navigation";

import { AgentDashShell } from "../../components/AgentDashShell";
import { AgentDetailsView } from "../../components/AgentDetailsView";
import { getAgentById } from "../../data/mockAgents";

type AgentDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentDetailsPage({
  params,
}: AgentDetailsPageProps) {
  const { id } = await params;
  const agent = getAgentById(id);

  if (!agent) {
    notFound();
  }

  return (
    <AgentDashShell activeItem="agents">
      <AgentDetailsView agentId={id} />
    </AgentDashShell>
  );
}
