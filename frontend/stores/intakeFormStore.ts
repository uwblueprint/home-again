import { create } from "zustand";

export interface AgencyFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phone: string;
  phoneNotes: string;
}

export interface MainAgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface OtherAgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface IntakeFormStore {
  agency: AgencyFormData;
  mainAgent: MainAgentFormData;
  otherAgents: OtherAgentFormData[];

  setAgency: (data: Partial<AgencyFormData>) => void;
  setMainAgent: (data: Partial<MainAgentFormData>) => void;
  setOtherAgents: (agents: OtherAgentFormData[]) => void;
  addOtherAgent: (agent: OtherAgentFormData) => void;
  removeOtherAgent: (index: number) => void;
  updateOtherAgent: (index: number, data: Partial<OtherAgentFormData>) => void;
  reset: () => void;
}

const initialAgency: AgencyFormData = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "Newfoundland & Labrador",
  country: "Canada",
  postalCode: "",
  phone: "",
  phoneNotes: "",
};

const initialMainAgent: MainAgentFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
};

export const useIntakeFormStore = create<IntakeFormStore>((set) => ({
  agency: initialAgency,
  mainAgent: initialMainAgent,
  otherAgents: [],

  setAgency: (data) =>
    set((state) => ({ agency: { ...state.agency, ...data } })),

  setMainAgent: (data) =>
    set((state) => ({ mainAgent: { ...state.mainAgent, ...data } })),

  setOtherAgents: (agents) => set({ otherAgents: agents }),

  addOtherAgent: (agent) =>
    set((state) => ({ otherAgents: [...state.otherAgents, agent] })),

  removeOtherAgent: (index) =>
    set((state) => ({
      otherAgents: state.otherAgents.filter((_, i) => i !== index),
    })),

  updateOtherAgent: (index, data) =>
    set((state) => ({
      otherAgents: state.otherAgents.map((agent, i) =>
        i === index ? { ...agent, ...data } : agent
      ),
    })),

  reset: () =>
    set({ agency: initialAgency, mainAgent: initialMainAgent, otherAgents: [] }),
}));
