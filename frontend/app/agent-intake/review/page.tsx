"use client";

import { useState } from "react";

// TODO: Replace mock data with actual form state once state management is implemented
const MOCK_MAIN_AGENT = {
  firstName: "John",
  lastName: "Smith",
  email: "john@agency.com",
  phone: "(+1) 647 123 4567",
  role: "Community Manager",
};

const MOCK_OTHER_AGENTS = Array.from({ length: 13 }, (_, i) => ({
  name: `Agent ${i + 1}`,
  email: "john@agency.com",
  phone: "(+1) 647 123 4567",
}));

const AGENTS_PER_PAGE = 3;

const MOCK_AGENCY = {
  name: "Home Again",
  addressLine1: "226 Phillip Street",
  addressLine2: "N/A",
  city: "Toronto",
  province: "Ontario",
  phone: "(+1) 647 123 4567",
  phoneNotes:
    "Phone number belongs to relative, please take time to coordinate",
};

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
  agent: { name: string; email: string; phone: string };
}) {
  return (
    <div className="border border-border rounded-lg shadow-sm p-3 flex flex-col gap-3">
      <p className="text-sm text-foreground">{agent.name}</p>
      <div className="flex gap-12 text-sm text-muted-foreground">
        <span>{agent.email}</span>
        <span>{agent.phone}</span>
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

export default function ReviewStep() {
  const [visibleCount, setVisibleCount] = useState(AGENTS_PER_PAGE);
  const visibleAgents = MOCK_OTHER_AGENTS.slice(0, visibleCount);
  const remaining = MOCK_OTHER_AGENTS.length - visibleCount;

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
          <div className="flex gap-3">
            <ReviewField label="Agency name" value={MOCK_AGENCY.name} />
            <ReviewField
              label="Address line 1"
              value={MOCK_AGENCY.addressLine1}
            />
            <ReviewField
              label="Address line 2"
              value={MOCK_AGENCY.addressLine2}
            />
          </div>
          <div className="flex gap-3">
            <ReviewField label="City" value={MOCK_AGENCY.city} />
            <ReviewField label="Province" value={MOCK_AGENCY.province} />
            <ReviewField label="" value={MOCK_AGENCY.phone} />
          </div>
          <div className="flex">
            <ReviewField
              label="Phone Number Notes"
              value={MOCK_AGENCY.phoneNotes}
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
          <div className="flex gap-3">
            <ReviewField
              label="First Name"
              value={MOCK_MAIN_AGENT.firstName}
            />
            <ReviewField label="Last Name" value={MOCK_MAIN_AGENT.lastName} />
            <ReviewField label="" value="" />
          </div>
          <div className="flex gap-3">
            <ReviewField label="Email" value={MOCK_MAIN_AGENT.email} />
            <ReviewField label="Phone number" value={MOCK_MAIN_AGENT.phone} />
            <ReviewField label="" value="" />
          </div>
          <div className="flex">
            <ReviewField label="Role" value={MOCK_MAIN_AGENT.role} />
          </div>
        </ReviewCard>
      </div>

      {/* Other Agents */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-semibold text-foreground">Other Agents</h3>
        {visibleAgents.map((agent, index) => (
          <AgentCard key={index} agent={agent} />
        ))}
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
