"use client";

import { useMemo, useState } from "react";
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
  const [rejectionReasons, setRejectionReasons] = useState<
    Record<string, string>
  >({});
  const referrals = useMemo(
    () =>
      query.data?.referrals.map((referral) => ({
        ...toClientReferral(referral, query.data.clients, query.data.agents),
        rejectionReason: rejectionReasons[referral.id],
      })) ?? [],
    [query.data, rejectionReasons]
  );

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
      await qc.cancelQueries({ queryKey: REFERRAL_DATA_KEY });
      const previous = qc.getQueryData<ReferralData>(REFERRAL_DATA_KEY);
      const previousRejectionReasons = rejectionReasons;
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
                    }
                  : referral
              ),
            }
          : old
      );
      if (target === "rejected" && rejectionReason) {
        setRejectionReasons((current) => ({
          ...current,
          [id]: rejectionReason,
        }));
      }
      return { previous, previousRejectionReasons };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(REFERRAL_DATA_KEY, ctx.previous);
      if (ctx?.previousRejectionReasons) {
        setRejectionReasons(ctx.previousRejectionReasons);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: REFERRAL_DATA_KEY });
    },
  });

  return {
    referrals,
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
