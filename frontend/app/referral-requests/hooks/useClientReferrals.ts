"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReferralData, updateReferral } from "../api";
import type { ClientReferralsData, ReferralStatusUpdate } from "../types";
import { toClientReferral } from "../utils";

export const CLIENT_REFERRALS_KEY = ["referrals", "client-referrals"] as const;

type MoveVars = { id: string } & ReferralStatusUpdate;

export function useClientReferrals() {
  const qc = useQueryClient();

  const query = useQuery<ClientReferralsData>({
    queryKey: CLIENT_REFERRALS_KEY,
    retry: false,
    queryFn: async () => {
      const { referrals, clients, agents } = await fetchReferralData();
      return {
        referrals: referrals.map((referral) =>
          toClientReferral(referral, clients, agents)
        ),
      };
    },
  });

  const move = useMutation({
    mutationFn: async ({
      id,
      target,
      isPriority,
      priorityDescription,
    }: MoveVars) => {
      await updateReferral(id, {
        target,
        isPriority,
        priorityDescription,
      });
    },

    // Update the cache first. Restore it if the API request fails.
    onMutate: async ({
      id,
      target,
      rejectionReason,
      isPriority,
      priorityDescription,
    }) => {
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
                    priorityDescription:
                      target === "waitlisted"
                        ? (priorityDescription ?? r.priorityDescription)
                        : r.priorityDescription,
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
      qc.invalidateQueries({ queryKey: CLIENT_REFERRALS_KEY });
    },
  });

  return {
    referrals: query.data?.referrals ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    waitlist: (id: string, isPriority: boolean, priorityDescription?: string) =>
      move.mutateAsync({
        id,
        target: "waitlisted",
        isPriority,
        priorityDescription,
      }),
    reject: (id: string, reason: string) =>
      move.mutateAsync({
        id,
        target: "rejected",
        rejectionReason: reason,
      }),
  };
}
