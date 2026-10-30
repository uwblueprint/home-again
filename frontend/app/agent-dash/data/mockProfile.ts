export type AgentProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AgencyDetails = {
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  phone: string;
};

export type AgentProgram = {
  id: string;
  name: string;
};

export type AgentProfileData = {
  agent: AgentProfile;
  agency: AgencyDetails;
  programs: AgentProgram[];
};

export const INITIAL_PROFILE: AgentProfileData = {
  agent: {
    firstName: "Wanyun",
    lastName: "Xue",
    email: "jane@homeagain.com",
    phone: "(+1) 647 123 4567",
  },
  agency: {
    name: "Home Again",
    addressLine1: "226 Phillip Street",
    addressLine2: null,
    city: "Ottawa",
    postalCode: "A1A 1A1",
    phone: "+1 (416) 666-6666",
  },
  programs: [{ id: "program-1", name: "Program Name" }],
};
