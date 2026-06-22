"use client";

import { useState } from "react";

import IntakeLayout from "@/app/agent-intake/IntakeLayout";
import AgencyStep from "@/app/agent-intake/components/steps/AgencyStep";
import MainAgentStep from "@/app/agent-intake/components/steps/MainAgentStep";
import OtherAgentsStep from "@/app/agent-intake/components/steps/OtherAgentsStep";
import ReviewStep from "@/app/agent-intake/components/steps/ReviewStep";

export default function AgentIntakePage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <IntakeLayout currentStep={currentStep} setCurrentStep={setCurrentStep}>
      {currentStep === 0 ? <AgencyStep /> : null}
      {currentStep === 1 ? <MainAgentStep /> : null}
      {currentStep === 2 ? <OtherAgentsStep /> : null}
      {currentStep === 3 ? <ReviewStep /> : null}
    </IntakeLayout>
  );
}
