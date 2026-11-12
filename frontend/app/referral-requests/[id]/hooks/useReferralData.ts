import { useQuery } from "@tanstack/react-query";
import apiClient from "@/common/lib/apiClient";
import type { AgentRecord, Client, Referral } from "@/common/types";

export const REFERRAL_DATA_KEY = ["referrals", "data"] as const;

export function useReferralData() {
  return useQuery({
    queryKey: REFERRAL_DATA_KEY,
    retry: false,
    queryFn: async () => {
      const [referrals, clients, agents] = await Promise.all([
        apiClient.get<Referral[]>("/referrals"),
        apiClient.get<Client[]>("/clients"),
        apiClient.get<AgentRecord[]>("/agents"),
      ]);
      return {
        referrals: referrals.data,
        clients: clients.data,
        agents: agents.data,
      };
    },
  });
}
