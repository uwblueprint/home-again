import { useQuery } from "@tanstack/react-query";

import { fetchReferralData } from "@/app/client-referrals/api";

export const REFERRAL_DATA_KEY = ["referrals", "data"] as const;

export type ReferralData = Awaited<ReturnType<typeof fetchReferralData>>;

export function useReferralData() {
  return useQuery({
    queryKey: REFERRAL_DATA_KEY,
    queryFn: fetchReferralData,
    retry: false,
  });
}
