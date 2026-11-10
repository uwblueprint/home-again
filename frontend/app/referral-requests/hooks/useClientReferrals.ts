"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReferrals, updateReferralStatus } from "../api";
import { MOCK_REFERRALS } from "../mockData";
import type { ClientReferralsData, ReferralStatusUpdate } from "../types";
import { toClientReferral } from "../utils";

export const CLIENT_REFERRALS_KEY = ["referrals", "client-referrals"] as const;

type MoveVars = { id: string } & ReferralStatusUpdate;

// Keep the referral screen usable before the API environment is configured.
const USE_MOCK_REFERRALS =
  process.env.NEXT_PUBLIC_USE_MOCK_REFERRALS === "true" ||
  !process.env.NEXT_PUBLIC_API_URL;

export function useClientReferrals() {
  const qc = useQueryClient();

  const query = useQuery<ClientReferralsData>({
    queryKey: CLIENT_REFERRALS_KEY,
    retry: false,
    queryFn: async () => {
      if (USE_MOCK_REFERRALS) {
        return { referrals: MOCK_REFERRALS, isMock: true };
      }

      try {
        const raw = await fetchReferrals();
        return { referrals: raw.map(toClientReferral), isMock: false };
      } catch (err) {
        // Dev-only fallback so the UI can be built before the endpoint is confirmed.
        if (process.env.NODE_ENV === "production") throw err;
        return { referrals: MOCK_REFERRALS, isMock: true };
      }
    },
  });

  const move = useMutation({
    mutationFn: async ({
      id,
      target,
      rejectionReason,
      isPriority,
    }: MoveVars) => {
      const isMock =
        qc.getQueryData<ClientReferralsData>(CLIENT_REFERRALS_KEY)?.isMock;
      if (isMock) return; // no backend in mock mode
      await updateReferralStatus(id, { target, rejectionReason, isPriority });
    },
    // Optimistic: the card jumps to its new tab immediately.
    onMutate: async ({ id, target, rejectionReason, isPriority }) => {
      await qc.cancelQueries({ queryKey: CLIENT_REFERRALS_KEY });
      const previous =
        qc.getQueryData<ClientReferralsData>(CLIENT_REFERRALS_KEY);
      qc.setQueryData<ClientReferralsData>(
        CLIENT_REFERRALS_KEY,
        (old) =>
          old && {
            ...old,
            referrals: old.referrals.map((r) =>
              r.id === id
                ? {
                    ...r,
                    tab: target,
                    isPriority:
                      target === "waitlisted" && isPriority !== undefined
                        ? isPriority
                        : r.isPriority,
                    reviewStatus:
                      target === "waitlisted" ? "pending-review" : undefined,
                    rejectionReason:
                      target === "rejected" ? rejectionReason : undefined,
                  }
                : r
            ),
          }
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(CLIENT_REFERRALS_KEY, ctx.previous);
    },
    onSettled: () => {
      const isMock =
        qc.getQueryData<ClientReferralsData>(CLIENT_REFERRALS_KEY)?.isMock;
      if (!isMock) qc.invalidateQueries({ queryKey: CLIENT_REFERRALS_KEY });
    },
  });

  return {
    referrals: query.data?.referrals ?? [],
    isMock: query.data?.isMock ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    waitlist: (id: string, isPriority: boolean) =>
      move.mutateAsync({ id, target: "waitlisted", isPriority }),
    reject: (id: string, reason: string) =>
      move.mutateAsync({
        id,
        target: "rejected",
        rejectionReason: reason,
      }),
  };
}
