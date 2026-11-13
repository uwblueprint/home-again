"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil } from "lucide-react";
import {
  ClientDetailsSummary,
  DeliveryDetailsSummary,
} from "@/app/referral-requests/[id]/components/DetailSummaries";
import { ClientDetailsForm } from "@/app/referral-requests/[id]/components/ClientDetailsForm";
import { DeliveryDetailsForm } from "@/app/referral-requests/[id]/components/DeliveryDetailsForm";
import type {
  ClientDetailsErrors,
  DeliveryDetailsErrors,
  DeliveryDetailsFormData,
} from "@/app/referral-requests/[id]/types";
import {
  toClientForm,
  toClientUpdate,
  toDeliveryForm,
  toDeliveryUpdate,
  validateClientDetails,
  validateDeliveryDetails,
} from "@/app/referral-requests/[id]/data/details";
import {
  Button,
  Card,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/common/components/ui";
import type { Client, Referral } from "@/common/types";
import type { ReferralDialogAgent } from "@/app/referral-requests/components";
import apiClient from "@/common/lib/apiClient";
import { REFERRAL_DATA_KEY } from "@/app/referral-requests/[id]/hooks/useReferralData";

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="gap-xl">
      <Collapsible defaultOpen className="w-full">
        <h2>
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-md text-left text-heading-4 font-semibold">
            {title}
            <ChevronDown
              aria-hidden="true"
              className="size-5 transition-transform group-data-panel-open:rotate-180"
            />
          </CollapsibleTrigger>
        </h2>
        <CollapsiblePanel>
          <div className="pt-xl">{children}</div>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  );
}

function Actions({
  pending,
  onCancel,
}: {
  pending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-md">
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function ClientDetails({ client }: { client: Client }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toClientForm(client));
  const [errors, setErrors] = useState<ClientDetailsErrors>({});
  const save = useMutation({
    mutationFn: () =>
      apiClient.put<Client>(
        `/clients/${encodeURIComponent(client.id)}`,
        toClientUpdate(draft)
      ),
    onSuccess: async ({ data }) => {
      qc.setQueryData<Client[]>(["clients"], (old) =>
        old?.map((client) => (client.id === data.id ? data : client))
      );
      await qc.invalidateQueries({ queryKey: ["clients"] });
      await qc.invalidateQueries({ queryKey: REFERRAL_DATA_KEY });
      setEditing(false);
    },
  });
  return (
    <DetailCard title="Client Details">
      {!editing ? (
        <div className="flex flex-col items-start gap-xl">
          <ClientDetailsSummary client={client} />
          <Button
            variant="outline"
            aria-label="Edit client details"
            onClick={() => {
              setDraft(toClientForm(client));
              setErrors({});
              save.reset();
              setEditing(true);
            }}
          >
            Edit
            <Pencil aria-hidden="true" />
          </Button>
          {save.isSuccess && (
            <p role="status" className="text-muted-foreground">
              Client details saved.
            </p>
          )}
        </div>
      ) : (
        <form
          className="flex flex-col gap-xl"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateClientDetails(draft);
            setErrors(nextErrors);
            if (!Object.keys(nextErrors).length) save.mutate();
          }}
        >
          <fieldset disabled={save.isPending} className="min-w-0">
            <ClientDetailsForm
              data={draft}
              onChange={(data) => {
                setDraft(data);
                save.reset();
              }}
              errors={errors}
            />
          </fieldset>
          {save.isError && (
            <p role="alert" className="text-destructive">
              Unable to save client details. Please try again.
            </p>
          )}
          {save.isSuccess && (
            <p role="status" className="text-muted-foreground">
              Client details saved.
            </p>
          )}
          <Actions
            pending={save.isPending}
            onCancel={() => {
              setDraft(toClientForm(client));
              setErrors({});
              save.reset();
              setEditing(false);
            }}
          />
        </form>
      )}
    </DetailCard>
  );
}

function DeliveryDetails({
  referral,
  phone,
}: {
  referral: Referral;
  phone?: string | null;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DeliveryDetailsFormData>(() =>
    toDeliveryForm(referral)
  );
  const [errors, setErrors] = useState<DeliveryDetailsErrors>({});
  const save = useMutation({
    mutationFn: () =>
      apiClient.put<Referral>(
        `/referrals/${encodeURIComponent(referral.id)}`,
        toDeliveryUpdate(draft)
      ),
    onSuccess: async ({ data }) => {
      qc.setQueryData(["referrals", "detail", referral.id], data);
      await qc.invalidateQueries({ queryKey: ["referrals"] });
      setEditing(false);
    },
  });
  return (
    <DetailCard title="Delivery Details">
      {!editing ? (
        <div className="flex flex-col items-start gap-xl">
          <DeliveryDetailsSummary referral={referral} phone={phone} />
          <Button
            variant="outline"
            aria-label="Edit delivery details"
            onClick={() => {
              setDraft(toDeliveryForm(referral));
              setErrors({});
              save.reset();
              setEditing(true);
            }}
          >
            Edit
            <Pencil aria-hidden="true" />
          </Button>
          {save.isSuccess && (
            <p role="status" className="text-muted-foreground">
              Delivery details saved.
            </p>
          )}
        </div>
      ) : (
        <form
          className="flex flex-col gap-xl"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors = validateDeliveryDetails(draft);
            setErrors(nextErrors);
            if (!Object.keys(nextErrors).length) save.mutate();
          }}
        >
          <fieldset disabled={save.isPending} className="min-w-0">
            <DeliveryDetailsForm
              data={draft}
              onChange={(data) => {
                setDraft(data);
                save.reset();
              }}
              errors={errors}
              phone={phone}
            />
          </fieldset>
          {save.isError && (
            <p role="alert" className="text-destructive">
              Unable to save delivery details. Please try again.
            </p>
          )}
          {save.isSuccess && (
            <p role="status" className="text-muted-foreground">
              Delivery details saved.
            </p>
          )}
          <Actions
            pending={save.isPending}
            onCancel={() => {
              setDraft(toDeliveryForm(referral));
              setErrors({});
              save.reset();
              setEditing(false);
            }}
          />
        </form>
      )}
    </DetailCard>
  );
}

export function ReferralDetails({
  referral,
  client,
  agents,
  clientLoading,
  clientError,
  agentsLoading,
  agentsError,
}: {
  referral: Referral;
  client?: Client;
  agents: ReferralDialogAgent[];
  clientLoading: boolean;
  clientError: boolean;
  agentsLoading: boolean;
  agentsError: boolean;
}) {
  return (
    <div className="flex flex-col gap-xl">
      {clientLoading ? (
        <p role="status">Loading client details…</p>
      ) : clientError || !client ? (
        <p role="alert">Unable to load client details.</p>
      ) : (
        <ClientDetails key={client.id} client={client} />
      )}
      <Card className="gap-lg">
        <h2 className="text-heading-4 font-semibold">Case Agents</h2>
        {agentsLoading ? (
          <p role="status">Loading case agents…</p>
        ) : agentsError ? (
          <p role="alert">Unable to load case agents.</p>
        ) : agents.length ? (
          <div className="grid w-full gap-xl sm:grid-cols-2">
            {agents.map((agent) => (
              <div
                key={agent.role}
                className="flex flex-col gap-xs text-paragraph-small"
              >
                <p>
                  {agent.role === "primary" ? "Primary" : "Secondary"}:{" "}
                  {agent.firstName} {agent.lastName}
                </p>
                <p className="flex flex-wrap gap-md text-muted-foreground">
                  {agent.email && (
                    <a href={`mailto:${agent.email}`}>{agent.email}</a>
                  )}
                  {agent.phone && (
                    <a href={`tel:${agent.phone}`}>{agent.phone}</a>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No case agents assigned.</p>
        )}
      </Card>
      <DeliveryDetails
        key={referral.id}
        referral={referral}
        phone={client?.phone}
      />
    </div>
  );
}
