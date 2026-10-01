import { notFound } from "next/navigation";

import { AgentDashShell } from "../../components/AgentDashShell";
import { ClientProfileView } from "../../components/ClientProfileView";
import { getClientProfileById } from "../../data/mockClients";

type ClientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientProfilePage({
  params,
}: ClientProfilePageProps) {
  const { id } = await params;
  const profile = getClientProfileById(id);

  if (!profile) {
    notFound();
  }

  return (
    <AgentDashShell activeItem="clients">
      <ClientProfileView clientId={id} />
    </AgentDashShell>
  );
}
