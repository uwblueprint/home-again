"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateClientDetails,
  updateDeliveryDetails,
} from "@/app/client-referrals/api";
import {
  toClientUpdate,
  toDeliveryUpdate,
} from "@/app/client-referrals/[id]/data/details";
import type {
  ClientDetailsFormData,
  DeliveryDetailsFormData,
} from "@/app/client-referrals/[id]/types";
import type { Client } from "@/common/types";
import { REFERRAL_DATA_KEY } from "./useReferralData";

export function useUpdateClientDetails(id: string, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ClientDetailsFormData) =>
      updateClientDetails(id, toClientUpdate(draft)),
    onSuccess: async (data) => {
      queryClient.setQueryData<Client[]>(["clients"], (old) =>
        old?.map((client) => (client.id === data.id ? data : client))
      );
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: REFERRAL_DATA_KEY });
      onSaved();
    },
  });
}

export function useUpdateDeliveryDetails(id: string, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: DeliveryDetailsFormData) =>
      updateDeliveryDetails(id, toDeliveryUpdate(draft)),
    onSuccess: async (data) => {
      queryClient.setQueryData(["referrals", "detail", id], data);
      await queryClient.invalidateQueries({ queryKey: ["referrals"] });
      onSaved();
    },
  });
}
