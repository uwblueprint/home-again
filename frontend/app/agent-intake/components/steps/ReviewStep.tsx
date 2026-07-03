"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { AgentSummaryRow } from "@/app/agent-intake/components/AgentSummaryRow";
import { InformationBlock } from "@/common/components/data-display";
import { useIntakeFooter } from "@/app/agent-intake/context/IntakeFooterContext";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { CheckCheck, Loader2 } from "lucide-react";
import { useSubmitIntake } from "@/app/agent-intake/hooks/useSubmitIntake";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";
import { formatReviewPhoneNumber } from "@/common/constants/validators";

const AGENTS_PER_PAGE = 3;
const EMPTY_VALUE = "—";
const INFORMATION_BLOCK_GRID = "grid w-full gap-lg md:grid-cols-3";
const SUCCESS_DIALOG_DURATION_MS = 1500;
const REDIRECT_DIALOG_DURATION_MS = 1500;

type PostSubmitPhase = "success" | "redirecting";

function formatValue(value: string) {
  return value.trim() || EMPTY_VALUE;
}

function formatPhoneValue(value: string) {
  const formatted = formatReviewPhoneNumber(value);
  return formatted || EMPTY_VALUE;
}

function sortOtherAgents<T extends { email: string; isAdmin: boolean }>(
  agents: T[]
) {
  return [...agents].sort((left, right) => {
    if (left.isAdmin !== right.isAdmin) {
      return left.isAdmin ? -1 : 1;
    }

    return left.email.localeCompare(right.email, undefined, {
      sensitivity: "base",
    });
  });
}

function ReviewAgentCard({
  index,
  agent,
}: {
  index: number;
  agent: {
    email: string;
    isAdmin: boolean;
  };
}) {
  return (
    <Card className="flex-row items-center justify-between">
      <AgentSummaryRow
        index={index}
        emailDisplay={formatValue(agent.email)}
        showAdminBadge={agent.isAdmin}
      />
    </Card>
  );
}

function ReviewCard({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>;
}

function IntakePostSubmitDialog({ phase }: { phase: PostSubmitPhase }) {
  const isSuccess = phase === "success";

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="h-[337px] max-w-[517px] items-center justify-center gap-4 p-8 text-center sm:max-w-[517px]"
      >
        {isSuccess ? (
          <CheckCheck
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <Loader2
            className="size-6 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <DialogTitle className="text-center text-paragraph-small font-normal text-muted-foreground">
          {isSuccess
            ? "Profile created successfully"
            : "Please wait as we redirect you to your dashboard."}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isSuccess
            ? "Your agency profile was created successfully."
            : "Redirecting you to your agency dashboard."}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default function ReviewStep() {
  const router = useRouter();
  const agency = useIntakeFormStore((state) => state.agency);
  const mainAgent = useIntakeFormStore((state) => state.mainAgent);
  const otherAgents = useIntakeFormStore((state) => state.otherAgents);
  const { setFooterState, setSubmitHandler, resetFooterState } =
    useIntakeFooter();
  const {
    submit,
    isSubmitting,
    submitError,
    submittedAgencyId,
    isSuccess,
    resetAfterSuccess,
  } = useSubmitIntake();
  const [visibleCount, setVisibleCount] = useState(AGENTS_PER_PAGE);
  const [postSubmitPhase, setPostSubmitPhase] =
    useState<PostSubmitPhase | null>(null);

  useEffect(() => {
    setVisibleCount((current) =>
      Math.max(
        AGENTS_PER_PAGE,
        Math.min(current, otherAgents.length || AGENTS_PER_PAGE)
      )
    );
  }, [otherAgents.length]);

  useEffect(() => {
    setSubmitHandler(async () => {
      await submit();
    });
  }, [setSubmitHandler, submit]);

  useEffect(() => {
    setFooterState({
      isSubmitting,
      submitError,
      isSubmitDisabled: isSuccess,
    });
  }, [isSubmitting, isSuccess, setFooterState, submitError]);

  useEffect(() => {
    return () => {
      resetFooterState();
    };
  }, [resetFooterState]);

  useEffect(() => {
    if (!submittedAgencyId) {
      setPostSubmitPhase(null);
      return;
    }

    setPostSubmitPhase("success");

    const redirectPhaseTimeout = window.setTimeout(() => {
      setPostSubmitPhase("redirecting");
    }, SUCCESS_DIALOG_DURATION_MS);

    const redirectTimeout = window.setTimeout(() => {
      resetAfterSuccess();
      router.push(`/agencies/${submittedAgencyId}`);
    }, SUCCESS_DIALOG_DURATION_MS + REDIRECT_DIALOG_DURATION_MS);

    return () => {
      window.clearTimeout(redirectPhaseTimeout);
      window.clearTimeout(redirectTimeout);
    };
  }, [resetAfterSuccess, router, submittedAgencyId]);

  const sortedOtherAgents = sortOtherAgents(otherAgents);
  const visibleAgents = sortedOtherAgents.slice(0, visibleCount);
  const remaining = Math.max(0, sortedOtherAgents.length - visibleCount);

  return (
    <>
      <IntakeStepPage
        title="Review"
        description="Review your agency and contact details before submitting."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-semibold text-foreground">
              Partner Agency Details
            </h3>
            <ReviewCard>
              <div className={INFORMATION_BLOCK_GRID}>
                <InformationBlock
                  label="Agency name"
                  value={formatValue(agency.name)}
                />
                <InformationBlock
                  label="Address line 1"
                  value={formatValue(agency.addressLine1)}
                />
                <InformationBlock
                  label="Address line 2"
                  value={formatValue(agency.addressLine2)}
                />
              </div>
              <div className={INFORMATION_BLOCK_GRID}>
                <InformationBlock
                  label="City"
                  value={formatValue(agency.city)}
                />
                <InformationBlock
                  label="Postal code"
                  value={formatValue(agency.postalCode)}
                />
                <InformationBlock
                  label="Phone number"
                  value={formatPhoneValue(agency.phone)}
                />
              </div>
              <div className={INFORMATION_BLOCK_GRID}>
                <InformationBlock
                  label="Agency URL"
                  value={formatValue(agency.url)}
                />
              </div>
            </ReviewCard>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-semibold text-foreground">
              Your Details
            </h3>
            <ReviewCard>
              <div className={INFORMATION_BLOCK_GRID}>
                <InformationBlock
                  label="First name"
                  value={formatValue(mainAgent.firstName)}
                />
                <InformationBlock
                  label="Last name"
                  value={formatValue(mainAgent.lastName)}
                />
                <InformationBlock
                  label="Phone number"
                  value={formatPhoneValue(mainAgent.phone)}
                />
              </div>
            </ReviewCard>
          </div>

          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-semibold text-foreground">
              Other Agents
            </h3>
            {visibleAgents.length > 0 ? (
              visibleAgents.map((agent, index) => (
                <ReviewAgentCard
                  key={`${agent.email}-${index}`}
                  index={index}
                  agent={agent}
                />
              ))
            ) : (
              <ReviewCard>
                <p className="text-sm text-muted-foreground">
                  No additional agents have been added.
                </p>
              </ReviewCard>
            )}
            {remaining > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="h-auto justify-start p-0 text-sm font-medium text-foreground hover:bg-transparent"
                onClick={() =>
                  setVisibleCount((prev) => prev + AGENTS_PER_PAGE)
                }
              >
                Load {Math.min(remaining, AGENTS_PER_PAGE)} more agents
              </Button>
            ) : null}
          </div>
        </div>
      </IntakeStepPage>

      {postSubmitPhase ? (
        <IntakePostSubmitDialog phase={postSubmitPhase} />
      ) : null}
    </>
  );
}
