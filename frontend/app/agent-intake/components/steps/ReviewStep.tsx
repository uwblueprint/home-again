"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { InformationBlock } from "@/common/components/data-display";
import { useIntakeFooter } from "@/app/agent-intake/context/IntakeFooterContext";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/common/components/ui/dialog";
import { Check } from "lucide-react";
import { useSubmitIntake } from "@/app/agent-intake/hooks/useSubmitIntake";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";

const AGENTS_PER_PAGE = 3;
const EMPTY_VALUE = "—";
const INFORMATION_BLOCK_GRID = "grid w-full gap-lg md:grid-cols-3";
const SUCCESS_REDIRECT_DELAY_MS = 1200;

function formatValue(value: string) {
  return value.trim() || EMPTY_VALUE;
}

function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function sortName(firstName: string, lastName: string) {
  return formatName(firstName, lastName).toLocaleLowerCase();
}

function sortOtherAgents<
  T extends {
    firstName: string;
    lastName: string;
    email: string;
    isAdmin: boolean;
  },
>(agents: T[]) {
  return [...agents].sort((left, right) => {
    if (left.isAdmin !== right.isAdmin) {
      return left.isAdmin ? -1 : 1;
    }

    const leftName = sortName(left.firstName, left.lastName);
    const rightName = sortName(right.firstName, right.lastName);
    const byName = leftName.localeCompare(rightName, undefined, {
      sensitivity: "base",
    });

    if (byName !== 0) {
      return byName;
    }

    return left.email.localeCompare(right.email, undefined, {
      sensitivity: "base",
    });
  });
}

function ReviewAgentCard({
  agent,
}: {
  agent: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isAdmin: boolean;
  };
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-1.5 self-stretch">
        <p className="text-sm text-foreground">
          {formatValue(formatName(agent.firstName, agent.lastName))}
        </p>
        {agent.isAdmin ? (
          <Badge variant="outline" className="font-semibold">
            Admin User
          </Badge>
        ) : null}
      </div>
      <div className="grid w-full gap-lg md:grid-cols-3">
        <InformationBlock
          className="md:col-span-2"
          label="Email"
          value={formatValue(agent.email)}
        />
        <InformationBlock
          label="Phone number"
          value={formatValue(agent.phone)}
        />
      </div>
    </Card>
  );
}

function ReviewCard({ children }: { children: ReactNode }) {
  return <Card>{children}</Card>;
}

function SubmissionSuccessDialog() {
  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        className="flex h-[337px] w-full max-w-[517px] flex-col items-center justify-center gap-4 p-8 text-center shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)] sm:max-w-[517px]"
      >
        <Check className="size-6 text-foreground" aria-hidden="true" />
        <DialogDescription className="text-sm text-muted-foreground">
          Profile created successfully
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
      return;
    }

    const timeoutId = window.setTimeout(() => {
      resetAfterSuccess();
      router.push(`/agencies/${submittedAgencyId}`);
    }, SUCCESS_REDIRECT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
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
                  value={formatValue(agency.phone)}
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
                  value={formatValue(mainAgent.phone)}
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
                <ReviewAgentCard key={`${agent.email}-${index}`} agent={agent} />
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

      {isSuccess ? <SubmissionSuccessDialog /> : null}
    </>
  );
}
