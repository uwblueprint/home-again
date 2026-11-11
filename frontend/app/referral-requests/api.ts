import apiClient from "@/common/lib/apiClient";
import type {
  AgentRecord,
  Client,
  Referral,
  UpdateReferralInput,
} from "@/common/types";
import { API_STATUS } from "./constants";
import type { MoveTarget } from "./types";

type ReferralUpdate = {
  target: MoveTarget;
  isPriority?: boolean;
  priorityDescription?: string;
};

export async function fetchReferralData() {
  const [referralsResponse, clientsResponse, agentsResponse] =
    await Promise.all([
      apiClient.get<Referral[]>("/referrals"),
      apiClient.get<Client[]>("/clients"),
      apiClient.get<AgentRecord[]>("/agents"),
    ]);

  return {
    referrals: referralsResponse.data,
    clients: clientsResponse.data,
    agents: agentsResponse.data,
  };
}

export async function updateReferral(
  id: string,
  update: ReferralUpdate
): Promise<Referral> {
  const payload: UpdateReferralInput = {
    status: API_STATUS[update.target],
    ...(update.isPriority === undefined
      ? {}
      : { is_priority: update.isPriority }),
    ...(update.priorityDescription === undefined
      ? {}
      : { priority_description: update.priorityDescription }),
  };

  // The current backend has no rejection-reason field. Keep that value in the
  // optimistic UI state until the API contract adds a dedicated field.
  const response = await apiClient.put<Referral>(`/referrals/${id}`, payload);
  return response.data;
}
