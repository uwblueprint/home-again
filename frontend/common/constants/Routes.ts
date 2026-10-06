/**
 * Route path constants.
 * Use these for navigation to keep URLs consistent.
 */

export const HOME_PAGE = "/";
export const AGENT_INTAKE = "/agent-intake";
export const AGENT_DASH = "/agent-dash";
export const AGENT_DASH_PROFILE = "/agent-dash/profile";
export const AGENT_DASH_CLIENTS = "/agent-dash/clients";
export const AGENT_DASH_CLIENT = (id: string) => `/agent-dash/clients/${id}`;
export const AGENT_DASH_AGENTS = "/agent-dash/agents";
export const AGENT_DASH_AGENT = (id: string) => `/agent-dash/agents/${id}`;
export const AGENT_DASH_AGENTS_NEW = "/agent-dash/agents/new";
export const AGENT_DASH_SEARCH = "/agent-dash/search";
export const AGENT_DASH_REFERRAL = (id: string) =>
  `/agent-dash/referrals/${id}`;
export const REFERRAL_FORM = "/referral-form";
