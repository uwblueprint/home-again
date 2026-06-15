import { redirect } from "next/navigation";

import { AGENT_INTAKE } from "@/common/constants/Routes";

export default function LegacyAgencyRoute() {
  redirect(AGENT_INTAKE);
}
