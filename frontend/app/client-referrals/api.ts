import apiClient from "@/common/lib/apiClient";
import type {
  AgentRecord,
  Client,
  InventoryRecord,
  Referral,
  UpdateReferralInput,
  UpdateClientInput,
} from "@/common/types";
import { API_STATUS } from "./constants";
import type { MoveTarget } from "./types";
import type { ReferralRejectionReason } from "@/common/constants/referrals";

type ReferralUpdate = {
  target: MoveTarget;
  isPriority?: boolean;
  priorityDescription?: string;
  rejectionReason?: ReferralRejectionReason;
  rejectionDetails?: string;
};

export async function fetchReferralData() {
  // Referrals store client and agent IDs, so load the related records together.
  const [
    referralsResponse,
    clientsResponse,
    agentsResponse,
    inventoryResponse,
  ] = await Promise.all([
    apiClient.get<Referral[]>("/referrals"),
    apiClient.get<Client[]>("/clients"),
    apiClient.get<AgentRecord[]>("/agents"),
    apiClient.get<InventoryRecord[]>("/inventory"),
  ]);

  return {
    referrals: referralsResponse.data,
    clients: clientsResponse.data,
    agents: agentsResponse.data,
    inventory: inventoryResponse.data,
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
    ...(update.target === "rejected"
      ? {
          rejection_reason: update.rejectionReason,
          rejection_details: update.rejectionDetails ?? null,
        }
      : {}),
  };

  const response = await apiClient.put<Referral>(`/referrals/${id}`, payload);
  return response.data;
}

export async function updateClientDetails(
  id: string,
  payload: UpdateClientInput
): Promise<Client> {
  const response = await apiClient.put<Client>(
    `/clients/${encodeURIComponent(id)}`,
    payload
  );
  return response.data;
}

export async function updateDeliveryDetails(
  id: string,
  payload: UpdateReferralInput
): Promise<Referral> {
  const response = await apiClient.put<Referral>(
    `/referrals/${encodeURIComponent(id)}`,
    payload
  );
  return response.data;
}
