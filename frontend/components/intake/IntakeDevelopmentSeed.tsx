"use client";

import { useEffect } from "react";

import { useIntakeFormStore } from "@/stores/intakeFormStore";

function hasExistingIntakeInput() {
  const { agency, mainAgent, otherAgents, submissionCheckpoint } =
    useIntakeFormStore.getState();

  const agencyHasInput = [
    agency.name,
    agency.addressLine1,
    agency.addressLine2,
    agency.city,
    agency.postalCode,
    agency.phone,
    agency.phoneNotes,
  ].some((value) => value.trim());
  const mainAgentHasInput = Object.values(mainAgent).some((value) =>
    value.trim()
  );
  const otherAgentsHaveInput = otherAgents.some((agent) =>
    [agent.firstName, agent.lastName, agent.email, agent.phone].some((value) =>
      value.trim()
    )
  );
  const hasSubmissionProgress =
    submissionCheckpoint.agencyId !== null ||
    submissionCheckpoint.mainAgentId !== null ||
    submissionCheckpoint.mainAgentLinked ||
    submissionCheckpoint.otherAgentsCreated > 0;

  return (
    agencyHasInput ||
    mainAgentHasInput ||
    otherAgentsHaveInput ||
    hasSubmissionProgress
  );
}

function buildSampleIntake() {
  const uniqueSuffix = Date.now().toString(36);

  return {
    agency: {
      name: "Maple Outreach Collective",
      addressLine1: "125 Water Street",
      addressLine2: "Suite 400",
      city: "St. John's",
      province: "Newfoundland and Labrador",
      country: "Canada",
      postalCode: "A1C 1A1",
      phone: "709-555-0184",
      phoneNotes: "Front desk weekdays, 9am to 5pm",
    },
    mainAgent: {
      firstName: "Jordan",
      lastName: "Lee",
      email: `agent-intake-${uniqueSuffix}@example.com`,
      phone: "709-555-0133",
    },
    otherAgents: [
      {
        firstName: "Avery",
        lastName: "Patel",
        email: `agent-intake-avery-${uniqueSuffix}@example.com`,
        phone: "709-555-0111",
        isAdmin: true,
      },
      {
        firstName: "Morgan",
        lastName: "Chen",
        email: `agent-intake-morgan-${uniqueSuffix}@example.com`,
        phone: "709-555-0172",
        isAdmin: false,
      },
    ],
  };
}

export default function IntakeDevelopmentSeed() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    if (hasExistingIntakeInput()) {
      return;
    }

    const sampleIntake = buildSampleIntake();
    const { setAgency, setMainAgent, setOtherAgents } =
      useIntakeFormStore.getState();

    setAgency(sampleIntake.agency);
    setMainAgent(sampleIntake.mainAgent);
    setOtherAgents(sampleIntake.otherAgents);
  }, []);

  return null;
}
