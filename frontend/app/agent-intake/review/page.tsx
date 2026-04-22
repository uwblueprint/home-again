"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import IntakeStepPage from "@/app/agent-intake/components/IntakeStepPage";
import { useIntakeFooter } from "@/app/agent-intake/context/IntakeFooterContext";
import { useSubmitIntake } from "@/app/agent-intake/hooks/useSubmitIntake";
import { useIntakeFormStore } from "@/app/agent-intake/stores/intakeFormStore";

const AGENTS_PER_PAGE = 3;
const EMPTY_VALUE = "—";
const REVIEW_THREE_COLUMN_GRID = "grid gap-3 md:grid-cols-3";
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

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function AgentCard({
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
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-sm text-foreground">
          {formatValue(formatName(agent.firstName, agent.lastName))}
        </p>
        {agent.isAdmin ? (
          <span className="inline-flex items-center justify-center rounded-full border border-border px-2 py-0.5 text-center text-xs font-semibold leading-4 text-foreground whitespace-nowrap">
            Admin User
          </span>
        ) : null}
      </div>
      <div
        className={`${REVIEW_THREE_COLUMN_GRID} text-sm text-muted-foreground`}
      >
        <span className="min-w-0 break-words md:col-span-2">
          {formatValue(agent.email)}
        </span>
        <span>{formatValue(agent.phone)}</span>
      </div>
    </div>
  );
}

function ReviewCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-3 shadow-sm">
      {children}
    </div>
  );
}

function SubmissionSuccessDialog() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
      <div className="flex h-[337px] w-full max-w-[517px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-background p-8 text-center shadow-[0_10px_15px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7 12 3 3 7-7" />
          <path d="m3 12 3 3" />
        </svg>
        <p className="text-sm text-muted-foreground">
          Profile created successfully
        </p>
      </div>
    </div>
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
              <div className={REVIEW_THREE_COLUMN_GRID}>
                <ReviewField
                  label="Agency name"
                  value={formatValue(agency.name)}
                />
                <ReviewField
                  label="Address line 1"
                  value={formatValue(agency.addressLine1)}
                />
                <ReviewField
                  label="Address line 2"
                  value={formatValue(agency.addressLine2)}
                />
              </div>
              <div className={REVIEW_THREE_COLUMN_GRID}>
                <ReviewField label="City" value={formatValue(agency.city)} />
                <ReviewField
                  label="Postal code"
                  value={formatValue(agency.postalCode)}
                />
                <ReviewField
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
              <div className={REVIEW_THREE_COLUMN_GRID}>
                <ReviewField
                  label="First name"
                  value={formatValue(mainAgent.firstName)}
                />
                <ReviewField
                  label="Last name"
                  value={formatValue(mainAgent.lastName)}
                />
                <ReviewField
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
                <AgentCard key={`${agent.email}-${index}`} agent={agent} />
              ))
            ) : (
              <ReviewCard>
                <p className="text-sm text-muted-foreground">
                  No additional agents have been added.
                </p>
              </ReviewCard>
            )}
            {remaining > 0 ? (
              <button
                type="button"
                className="text-left text-sm font-medium text-foreground"
                onClick={() =>
                  setVisibleCount((prev) => prev + AGENTS_PER_PAGE)
                }
              >
                Load {Math.min(remaining, AGENTS_PER_PAGE)} more agents
              </button>
            ) : null}
          </div>
        </div>
      </IntakeStepPage>

      {isSuccess ? <SubmissionSuccessDialog /> : null}
    </>
  );
}
