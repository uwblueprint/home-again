"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { cn } from "@/common/lib/utils";
import { useClients } from "@/common/hooks/useApi";
import type { Client } from "@/common/types";

type FindStepProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedClientId: string | null;
  onSelectClient: (client: Client | null) => void;
  onAddNewClient: () => void;
};

export default function FindStep({
  searchQuery,
  onSearchQueryChange,
  selectedClientId,
  onSelectClient,
  onAddNewClient,
}: FindStepProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { data: clients = [] } = useClients();

  const results = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return [];
    return clients.filter((client) =>
      `${client.first_name} ${client.last_name}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [clients, searchQuery]);

  const hasSelection = Boolean(selectedClientId);

  function clearSelection() {
    onSelectClient(null);
    onSearchQueryChange("");
  }

  return (
    <div className="self-stretch flex flex-col items-start gap-8">
      <div className="self-stretch flex flex-col items-start gap-3">
        <h2 className="justify-start text-black text-3xl font-semibold font-['Geist'] leading-8">
          Client Referral Form
        </h2>
        <p className="self-stretch justify-start text-neutral-500 text-lg font-normal font-['Geist'] leading-7">
          Start a new referral by selecting an existing client or adding a new one.
        </p>
      </div>
      <div className="self-stretch space-y-3 rounded-xl border border-border bg-background p-6">
        <Label htmlFor="client-search">Search clients</Label>
        <div className="relative">
          {hasSelection ? null : (
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <Input
            id="client-search"
            placeholder="Find an existing client"
            className={hasSelection ? "pr-9" : "pl-9"}
            value={searchQuery}
            readOnly={hasSelection}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              onSelectClient(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {hasSelection ? (
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Clear selected client"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
          {!hasSelection && isFocused && results.length > 0 ? (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
              {results.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelectClient(client);
                      onSearchQueryChange(
                        `${client.first_name} ${client.last_name}`
                      );
                    }}
                    className={cn(
                      "flex w-full items-center px-4 py-2.5 text-left text-sm",
                      selectedClientId === client.id
                        ? "bg-neutral-100"
                        : "hover:bg-neutral-50"
                    )}
                  >
                    {client.first_name} {client.last_name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {hasSelection ? null : (
          <button
            type="button"
            onClick={onAddNewClient}
            className="text-sm font-medium text-foreground underline"
          >
            Add a new client
          </button>
        )}
      </div>
    </div>
  );
}
