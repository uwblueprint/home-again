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
import apiClient from "@/lib/apiClient";
import type { Agency, Client, Donor, InventoryItem, Referral } from "@/types";

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
      const response = await apiClient.get<Agency[]>("/agencies");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
 * Create a new agency
 *
 * Automatically invalidates the agencies query cache after success.
 */
export function useCreateAgency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      agency: Omit<Agency, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await apiClient.post<Agency>("/agencies", agency);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agencies"] });
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
 * Fetch inventory items
 */
export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const response = await apiClient.get<InventoryItem[]>("/inventory");
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // Shorter stale time for inventory
  });
}

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
