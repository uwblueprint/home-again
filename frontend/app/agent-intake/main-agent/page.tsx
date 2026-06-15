import { redirect } from "next/navigation";

import { AGENT_INTAKE } from "@/common/constants/Routes";

export default function LegacyMainAgentRoute() {
  redirect(AGENT_INTAKE);
}
