import { create } from "zustand";

export interface AgencyFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
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

export interface IntakeSubmissionCheckpoint {
  agencyId: string | null;
  mainAgentId: string | null;
  mainAgentLinked: boolean;
  otherAgentsCreated: number;
}

interface IntakeFormStore {
  agency: AgencyFormData;
  mainAgent: MainAgentFormData;
  otherAgents: OtherAgentFormData[];
  submissionCheckpoint: IntakeSubmissionCheckpoint;

  setAgency: (data: Partial<AgencyFormData>) => void;
  setMainAgent: (data: Partial<MainAgentFormData>) => void;
  setOtherAgents: (agents: OtherAgentFormData[]) => void;
  addOtherAgent: (agent: OtherAgentFormData) => void;
  removeOtherAgent: (index: number) => void;
  updateOtherAgent: (index: number, data: Partial<OtherAgentFormData>) => void;
  updateSubmissionCheckpoint: (
    data: Partial<IntakeSubmissionCheckpoint>
  ) => void;
  resetSubmissionCheckpoint: () => void;
  reset: () => void;
}

const initialAgency: AgencyFormData = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
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

const initialSubmissionCheckpoint: IntakeSubmissionCheckpoint = {
  agencyId: null,
  mainAgentId: null,
  mainAgentLinked: false,
  otherAgentsCreated: 0,
};

export const useIntakeFormStore = create<IntakeFormStore>((set) => ({
  agency: initialAgency,
  mainAgent: initialMainAgent,
  otherAgents: [],
  submissionCheckpoint: initialSubmissionCheckpoint,

  setAgency: (data) =>
    set((state) => ({
      agency: { ...state.agency, ...data },
      submissionCheckpoint: initialSubmissionCheckpoint,
    })),

  setMainAgent: (data) =>
    set((state) => ({
      mainAgent: { ...state.mainAgent, ...data },
      submissionCheckpoint: initialSubmissionCheckpoint,
    })),

  setOtherAgents: (agents) =>
    set({
      otherAgents: agents,
      submissionCheckpoint: initialSubmissionCheckpoint,
    }),

  addOtherAgent: (agent) =>
    set((state) => ({
      otherAgents: [...state.otherAgents, agent],
      submissionCheckpoint: initialSubmissionCheckpoint,
    })),

  removeOtherAgent: (index) =>
    set((state) => ({
      otherAgents: state.otherAgents.filter((_, i) => i !== index),
      submissionCheckpoint: initialSubmissionCheckpoint,
    })),

  updateOtherAgent: (index, data) =>
    set((state) => ({
      otherAgents: state.otherAgents.map((agent, i) =>
        i === index ? { ...agent, ...data } : agent
      ),
      submissionCheckpoint: initialSubmissionCheckpoint,
    })),

  updateSubmissionCheckpoint: (data) =>
    set((state) => ({
      submissionCheckpoint: { ...state.submissionCheckpoint, ...data },
    })),

  resetSubmissionCheckpoint: () =>
    set({ submissionCheckpoint: initialSubmissionCheckpoint }),

  reset: () =>
    set({
      agency: initialAgency,
      mainAgent: initialMainAgent,
      otherAgents: [],
      submissionCheckpoint: initialSubmissionCheckpoint,
    }),
}));
