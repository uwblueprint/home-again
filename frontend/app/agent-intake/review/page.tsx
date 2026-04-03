"use client";

import { useEffect, useState } from "react";

import { useIntakeFormStore } from "@/stores/intakeFormStore";

const AGENTS_PER_PAGE = 3;
const EMPTY_VALUE = "—";

function formatValue(value: string) {
  return value.trim() || EMPTY_VALUE;
}

function formatName(firstName: string, lastName: string) {
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || EMPTY_VALUE;
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function AgentCard({
  agent,
}: {
  agent: { firstName: string; lastName: string; email: string; phone: string };
}) {
  return (
    <div className="border border-border rounded-lg shadow-sm p-3 flex flex-col gap-3">
      <p className="text-sm text-foreground">
        {formatName(agent.firstName, agent.lastName)}
      </p>
      <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:gap-12">
        <span>{formatValue(agent.email)}</span>
        <span>{formatValue(agent.phone)}</span>
      </div>
    </div>
  );
}

function ReviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg shadow-sm p-3 flex flex-col gap-4">
      {children}
    </div>
  );
}

const REVIEW_THREE_COLUMN_GRID = "grid gap-3 md:grid-cols-3";

export default function ReviewStep() {
  const agency = useIntakeFormStore((state) => state.agency);
  const mainAgent = useIntakeFormStore((state) => state.mainAgent);
  const otherAgents = useIntakeFormStore((state) => state.otherAgents);
  const [visibleCount, setVisibleCount] = useState(AGENTS_PER_PAGE);

  useEffect(() => {
    setVisibleCount((current) =>
      Math.max(AGENTS_PER_PAGE, Math.min(current, otherAgents.length || AGENTS_PER_PAGE))
    );
  }, [otherAgents.length]);

  const visibleAgents = otherAgents.slice(0, visibleCount);
  const remaining = Math.max(0, otherAgents.length - visibleCount);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-foreground">
          Review
        </h2>
        <p className="text-lg text-muted-foreground leading-[27px]">
          Review your agency and contact details before submitting.
        </p>
      </div>

      {/* Agency Information */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-semibold text-foreground">
          Agency information
        </h3>
        <ReviewCard>
          <div className={REVIEW_THREE_COLUMN_GRID}>
            <ReviewField label="Agency name" value={formatValue(agency.name)} />
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
            <ReviewField label="Province" value={formatValue(agency.province)} />
            <ReviewField label="Phone number" value={formatValue(agency.phone)} />
          </div>
          <div className="flex">
            <ReviewField
              label="Phone Number Notes"
              value={formatValue(agency.phoneNotes)}
            />
          </div>
        </ReviewCard>
      </div>

      {/* Main Agent Details */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-semibold text-foreground">
          Main Agent Details
        </h3>
        <ReviewCard>
          <div className={REVIEW_THREE_COLUMN_GRID}>
            <div className="md:col-span-1">
              <ReviewField
                label="First Name"
                value={formatValue(mainAgent.firstName)}
              />
            </div>
            <div className="md:col-span-1">
              <ReviewField
                label="Last Name"
                value={formatValue(mainAgent.lastName)}
              />
            </div>
          </div>
          <div className={REVIEW_THREE_COLUMN_GRID}>
            <div className="md:col-span-1">
              <ReviewField label="Email" value={formatValue(mainAgent.email)} />
            </div>
            <div className="md:col-span-1">
              <ReviewField
                label="Phone number"
                value={formatValue(mainAgent.phone)}
              />
            </div>
          </div>
          <div className="flex">
            <ReviewField label="Role" value={formatValue(mainAgent.role)} />
          </div>
        </ReviewCard>
      </div>

      {/* Other Agents */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-semibold text-foreground">Other Agents</h3>
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
        {remaining > 0 && (
          <button
            type="button"
            className="text-sm font-medium text-foreground text-left"
            onClick={() =>
              setVisibleCount((prev) => prev + AGENTS_PER_PAGE)
            }
          >
            Load {Math.min(remaining, AGENTS_PER_PAGE)} more agents
          </button>
        )}
      </div>
    </div>
  );
}
