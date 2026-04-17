/**
 * API Query Hooks
 *
 * Custom hooks wrapping TanStack Query for data fetching.
 * Each hook manages caching, refetching, and error handling.
 *
 * Pattern:
 * - useQuery for GET requests (derived server state)
 * - useMutation for POST/PUT/DELETE (state updates)
 * - Automatic cache invalidation after mutations
 *
 * @see https://tanstack.com/query/latest
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/common/lib/apiClient";
import type {
  AgencyRecord,
  AgentRecord,
  Client,
  CreateAgencyInput,
  CreateAgentInput,
  CreateDonorInput,
  Donor,
  Furniture,
  Referral,
  UpdateAgencyInput,
} from "@/common/types";

/**
 * Fetch all agencies
 *
 * Uses automatic caching and stale-time management.
 * Cache is invalidated after any agency mutation.
 */
export function useAgencies() {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await apiClient.get<AgencyRecord[]>("/agencies");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: "always", // refetch when navigating to the page so list is up to date
  });
}

/**
 * Fetch a single agency by ID
 */
export function useAgency(agencyId?: string) {
  return useQuery({
    queryKey: ["agency", agencyId],
    queryFn: async () => {
      if (!agencyId) {
        throw new Error("Agency ID is required");
      }
      const response = await apiClient.get<AgencyRecord>(`/agencies/${agencyId}`);
      return response.data;
    },
    enabled: Boolean(agencyId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch all donors
 */
export function useDonors() {
  return useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const response = await apiClient.get<Donor[]>("/donors");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single donor by ID
 */
export function useDonor(donorId?: string | null) {
  return useQuery({
    queryKey: ["donor", donorId],
    queryFn: async () => {
      if (!donorId) throw new Error("Donor ID is required");
      const response = await apiClient.get<Donor>(`/donors/${donorId}`);
      return response.data;
    },
    enabled: Boolean(donorId),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Create a new donor
 *
 * Automatically invalidates the donors query cache after success.
 */
export function useCreateDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDonorInput) => {
      const response = await apiClient.post<Donor>("/donors", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

/**
 * Create a new agency
 *
 * Automatically invalidates the agencies query cache after success.
 */
export function useCreateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agency: CreateAgencyInput) => {
      const response = await apiClient.post<AgencyRecord>("/agencies", agency);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: CreateAgentInput) => {
      const response = await apiClient.post<AgentRecord>("/agents", agent);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", variables.agency_id] });
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
    },
  });
}

/**
 * Delete an agency by ID
 *
 * Invalidates agencies cache and agency detail cache on success.
 */
export function useDeleteAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agencyId: string) => {
      await apiClient.delete(`/agencies/${agencyId}`);
    },
    onSuccess: (_, agencyId) => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agency", agencyId] });
    },
  });
}

/**
 * Fetch all clients
 */
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await apiClient.get<Client[]>("/clients");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch furniture items
 */
export function useFurniture() {
  return useQuery({
    queryKey: ["furniture"],
    queryFn: async () => {
      const response = await apiClient.get<Furniture[]>("/furniture");
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Update an agency by ID
 *
 * Automatically invalidates the agency and agencies query cache after success.
 */
export function useUpdateAgency(agencyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAgencyInput) => {
      const response = await apiClient.put<AgencyRecord>(`/agencies/${agencyId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", agencyId] });
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
    },
  });
}

/**
 * Delete an agency by ID
 *
 * Automatically invalidates the agencies query cache after success.
 */


/**
 * Fetch referrals
 */
export function useReferrals() {
  return useQuery({
    queryKey: ["referrals"],
    queryFn: async () => {
      const response = await apiClient.get<Referral[]>("/referrals");
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
