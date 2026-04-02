/**
 * Intake Store
 *
 * Persists multi-step intake form data across step navigation.
 * Each step of the agent intake flow writes its slice here before advancing.
 */

import { create } from "zustand";

export interface AgencyFormData {
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  phone: string;
}

const EMPTY_AGENCY: AgencyFormData = {
  name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  province: "",
  country: "",
  postal_code: "",
  phone: "",
};

interface IntakeStore {
  agency: AgencyFormData;
  setAgency: (data: Partial<AgencyFormData>) => void;
  resetIntake: () => void;
}

export const useIntakeStore = create<IntakeStore>((set) => ({
  agency: EMPTY_AGENCY,
  setAgency: (data) =>
    set((state) => ({ agency: { ...state.agency, ...data } })),
  resetIntake: () => set({ agency: EMPTY_AGENCY }),
}));
