"use client";

import { useEffect } from "react";

import { useIntakeFormStore } from "@/stores/intakeFormStore";

function hasExistingIntakeInput() {
  const { agency, mainAgent, otherAgents, submissionCheckpoint } =
    useIntakeFormStore.getState();

  const agencyHasInput = Object.values(agency).some((value) => value.trim());
  const mainAgentHasInput = Object.values(mainAgent).some((value) =>
    value.trim()
  );
  const otherAgentsHaveInput = otherAgents.some((agent) =>
    Object.values(agent).some((value) => value.trim())
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
      addressLine1: "125 Dundas Street West",
      addressLine2: "Suite 400",
      city: "Toronto",
      province: "Ontario",
      phone: "416-555-0184",
      phoneNotes: "Front desk weekdays, 9am to 5pm",
    },
    mainAgent: {
      firstName: "Jordan",
      lastName: "Lee",
      email: `agent-intake-${uniqueSuffix}@example.com`,
      phone: "416-555-0133",
      role: "Program Coordinator",
    },
    otherAgents: [
      {
        firstName: "Avery",
        lastName: "Patel",
        email: `agent-intake-avery-${uniqueSuffix}@example.com`,
        phone: "416-555-0111",
      },
      {
        firstName: "Morgan",
        lastName: "Chen",
        email: `agent-intake-morgan-${uniqueSuffix}@example.com`,
        phone: "416-555-0172",
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
