import { notFound } from "next/navigation";

import { AgentDashShell } from "../../components/AgentDashShell";
import { ReferralDetailsView } from "../../components/ReferralDetailsView";
import { getReferralDetailsById } from "../../data/mockReferralDetails";

type ReferralDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReferralDetailsPage({
  params,
}: ReferralDetailsPageProps) {
  const { id } = await params;
  const details = getReferralDetailsById(id);

  if (!details) {
    notFound();
  }

  return (
    <AgentDashShell>
      <ReferralDetailsView details={details} />
    </AgentDashShell>
  );
}
