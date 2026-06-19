"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Checkbox } from "@/common/components/ui/checkbox";
import { cn } from "@/common/lib/utils";
import type { AgentRecord } from "@/common/types";
import type { AgentData } from "./types";

type AgentStepProps = {
  data: AgentData;
  onChange: (data: AgentData) => void;
  currentAgent: AgentRecord | null;
  agents: AgentRecord[];
};

export default function AgentStep({
  data,
  onChange,
  currentAgent,
  agents,
}: AgentStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function patch(updates: Partial<AgentData>) {
    onChange({ ...data, ...updates });
  }

  const selectableAgents = useMemo(
    () => agents.filter((agent) => agent.id !== currentAgent?.id),
    [agents, currentAgent?.id]
  );

  const results = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return [];
    return selectableAgents.filter((agent) =>
      `${agent.first_name} ${agent.last_name}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [selectableAgents, searchQuery]);

  const secondaryAgent = selectableAgents.find(
    (agent) => agent.id === data.secondaryAgentId
  );

  return (
    <div className="space-y-2">
      <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
        Agent Details
      </h2>
      <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
        Enter the referring agent&apos;s details.
      </p>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Primary case agent
        </h3>
        <div className="rounded-lg border border-border p-4">
          {currentAgent ? (
            <>
              <p className="text-sm font-medium uppercase text-foreground">
                {currentAgent.first_name} {currentAgent.last_name}
              </p>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>{currentAgent.email}</span>
                <span>{currentAgent.phone_number}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No agent found for this agency.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Secondary case agent
        </h3>
        <div className="space-y-1">
          <Label htmlFor="secondary-agent-search">Find an agent</Label>
          <div className="relative">
            {secondaryAgent ? null : (
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <Input
              id="secondary-agent-search"
              placeholder="Search for agent"
              className={secondaryAgent ? "pr-9" : "pl-9"}
              readOnly={Boolean(secondaryAgent)}
              value={
                secondaryAgent
                  ? `${secondaryAgent.first_name} ${secondaryAgent.last_name}`
                  : searchQuery
              }
              onChange={(e) => {
                setSearchQuery(e.target.value);
                patch({ secondaryAgentId: null });
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {secondaryAgent ? (
              <button
                type="button"
                onClick={() => {
                  patch({ secondaryAgentId: null });
                  setSearchQuery("");
                }}
                aria-label="Clear secondary agent"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
            {!secondaryAgent && isFocused && results.length > 0 ? (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
                {results.map((agent) => (
                  <li key={agent.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        patch({ secondaryAgentId: agent.id });
                        setSearchQuery(
                          `${agent.first_name} ${agent.last_name}`
                        );
                      }}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-left text-sm",
                        "hover:bg-neutral-50"
                      )}
                    >
                      {agent.first_name} {agent.last_name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={data.agentNeedsToBePresent}
          onCheckedChange={(checked) =>
            patch({ agentNeedsToBePresent: checked === true })
          }
        />
        Agent needs to be present during delivery
      </label>

      <div className="mt-4 space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Select a program
        </h3>
        <div className="space-y-1">
          <Label htmlFor="program-search">Search agency programs</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="program-search"
              placeholder="Search for a program in your agency"
              className="pl-9"
              value={data.programSearch}
              onChange={(e) => patch({ programSearch: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
