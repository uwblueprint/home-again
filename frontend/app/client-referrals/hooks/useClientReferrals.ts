"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReferral } from "../api";
import { API_STATUS } from "../constants";
import type { ReferralStatusUpdate } from "../types";
import { toClientReferral } from "../utils";
import {
  REFERRAL_DATA_KEY,
  useReferralData,
  type ReferralData,
} from "./useReferralData";

type MoveVars = { id: string } & ReferralStatusUpdate;

export function useClientReferrals() {
  const qc = useQueryClient();
  const query = useReferralData();
  const referrals = useMemo(
    () =>
      query.data?.referrals.map((referral) => ({
        ...toClientReferral(
          referral,
          query.data.clients,
          query.data.agents,
          query.data.inventory
        ),
      })) ?? [],
    [query.data]
  );

  const move = useMutation({
    mutationFn: async ({
      id,
      target,
      isPriority,
      priorityDescription,
      rejectionReason,
      rejectionDetails,
    }: MoveVars) => {
      await updateReferral(id, {
        target,
        isPriority,
        priorityDescription,
        rejectionReason: target === "rejected" ? rejectionReason : undefined,
        rejectionDetails:
          target === "rejected" && rejectionDetails
            ? rejectionDetails
            : undefined,
      });
    },

    // Update the cache first. Restore it if the API request fails.
    onMutate: async ({
      id,
      target,
      rejectionReason,
      rejectionDetails,
      isPriority,
      priorityDescription,
    }) => {
      await qc.cancelQueries({ queryKey: REFERRAL_DATA_KEY });
      const previous = qc.getQueryData<ReferralData>(REFERRAL_DATA_KEY);
      qc.setQueryData<ReferralData>(REFERRAL_DATA_KEY, (old) =>
        old
          ? {
              ...old,
              referrals: old.referrals.map((referral) =>
                referral.id === id
                  ? {
                      ...referral,
                      status: API_STATUS[target],
                      is_priority:
                        target === "waitlisted" && isPriority !== undefined
                          ? isPriority
                          : referral.is_priority,
                      priority_description:
                        target === "waitlisted"
                          ? (priorityDescription ??
                            referral.priority_description)
                          : referral.priority_description,
                      rejection_reason:
                        target === "rejected"
                          ? (rejectionReason ?? null)
                          : null,
                      rejection_details:
                        target === "rejected"
                          ? (rejectionDetails ?? null)
                          : null,
                    }
                  : referral
              ),
            }
          : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(REFERRAL_DATA_KEY, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: REFERRAL_DATA_KEY });
    },
  });

  return {
    referrals,
    isLoading: query.isLoading,
    isError: query.isError,
    isUpdating: move.isPending,
    waitlist: (id: string, isPriority: boolean, priorityDescription?: string) =>
      move.mutateAsync({
        id,
        target: "waitlisted",
        isPriority,
        priorityDescription,
      }),
    reject: (
      id: string,
      reason: ReferralStatusUpdate["rejectionReason"],
      details?: string
    ) =>
      move.mutateAsync({
        id,
        target: "rejected",
        rejectionReason: reason,
        rejectionDetails: details,
      }),
  };
}
