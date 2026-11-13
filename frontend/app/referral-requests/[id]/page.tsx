"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { REFERRAL_REQUESTS } from "@/common/constants/Routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { useReferralData } from "@/app/referral-requests/[id]/hooks/useReferralData";
import {
  RejectReferralDialog,
  WaitlistReferralDialog,
} from "@/app/referral-requests/components";
import type { ReferralDialogReferral } from "@/app/referral-requests/components";
import apiClient from "@/common/lib/apiClient";
import {
  ReferralRequestHeader,
  RequestedItemsSection,
  ReferralDetails,
} from "@/app/referral-requests/[id]/components";
import { toReferralRequest } from "@/app/referral-requests/[id]/data/referral";
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui";

export default function ReferralRequestPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<"reject" | "waitlist" | null>(null);
  const { data, isPending, error, refetch } = useReferralData();
  const clients = data?.clients ?? [];
  const agents = data?.agents ?? [];
  const referral = data?.referrals.find((referral) => referral.id === id);
  const move = useMutation({
    mutationFn: async (update: {
      status: "approved" | "declined";
      is_priority?: boolean;
      priority_description?: string;
    }) => {
      await apiClient.put(`/referrals/${encodeURIComponent(id)}`, update);
    },
    onSuccess: async () => {
      setDialog(null);
      await queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });
  const request = referral ? toReferralRequest(referral) : undefined;

  if (!request || !referral)
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col bg-background">
        <main className="mx-auto flex w-full max-w-275 flex-1 flex-col gap-4xl px-xl py-xl">
          <Tabs defaultValue="requested-items">
            <ReferralSectionTabs />
          </Tabs>
          {!isPending && (
            <div className="flex flex-col items-start gap-md">
              <p role="alert">
                {error
                  ? "Unable to load this referral."
                  : "Referral not found."}
              </p>
              {error && (
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => void refetch()}
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </main>
        <ReferralFooter />
      </div>
    );

  const client = clients.find((client) => client.id === request.clientId);
  const dialogReferral: ReferralDialogReferral = {
    clientName: client ? `${client.first_name} ${client.last_name}` : "Client",
    referralId: request.id,
    submittedAt: new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
      new Date(request.submittedAt)
    ),
    agents: (
      [
        { id: request.agentId, role: "primary" },
        { id: request.secondaryAgentId, role: "secondary" },
      ] as const
    ).flatMap(({ id, role }) => {
      const agent = agents.find((agent) => agent.id === id);
      return agent
        ? [
            {
              firstName: agent.first_name,
              lastName: agent.last_name,
              role,
              email: agent.email ?? "",
              phone: agent.phone_number ?? "",
            },
          ]
        : [];
    }),
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-275 flex-1 flex-col gap-4xl px-xl py-xl">
        <div className="flex flex-col gap-md">
          <ReferralRequestHeader request={request} />
          {request.isNew && (
            <div className="flex gap-sm">
              <Button
                variant="secondary"
                disabled={move.isPending}
                onClick={() => {
                  move.reset();
                  setDialog("reject");
                }}
              >
                <X aria-hidden="true" />
                Reject
              </Button>
              <Button
                disabled={move.isPending}
                onClick={() => {
                  move.reset();
                  setDialog("waitlist");
                }}
              >
                <Check aria-hidden="true" />
                Waitlist
              </Button>
            </div>
          )}
          {move.isError && (
            <p role="alert" className="text-paragraph-small text-destructive">
              Unable to update this referral. Please try again.
            </p>
          )}
        </div>
        <Tabs defaultValue="requested-items" className="gap-4xl">
          <ReferralSectionTabs />
          <TabsContent value="requested-items">
            <RequestedItemsSection
              items={request.items}
              isNew={request.isNew}
            />
          </TabsContent>
          <TabsContent value="details">
            <ReferralDetails
              referral={referral}
              client={client}
              agents={dialogReferral.agents}
              clientLoading={false}
              clientError={false}
              agentsLoading={false}
              agentsError={false}
            />
          </TabsContent>
        </Tabs>
      </main>
      <ReferralFooter />
      {dialog === "reject" && (
        <RejectReferralDialog
          open
          referral={dialogReferral}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          onConfirm={() => {
            // Rejection reasons are not supported by the current backend contract.
            move.mutate({ status: "declined" });
          }}
        />
      )}
      {dialog === "waitlist" && (
        <WaitlistReferralDialog
          open
          referral={dialogReferral}
          isPriority={request.isPriority}
          priorityReason={request.priorityDescription}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          onConfirm={(isPriority) =>
            move.mutate({
              status: "approved",
              is_priority: isPriority,
              priority_description: request.priorityDescription,
            })
          }
        />
      )}
    </div>
  );
}

function ReferralSectionTabs() {
  return (
    <TabsList
      aria-label="Referral request sections"
      className="max-w-full overflow-x-auto"
    >
      <TabsTrigger value="requested-items">Requested Items</TabsTrigger>
      <TabsTrigger value="details">Details</TabsTrigger>
      <TabsTrigger
        value="dropoffs"
        disabled
        className="disabled:opacity-100 aria-disabled:opacity-100"
      >
        Dropoffs
      </TabsTrigger>
    </TabsList>
  );
}

function ReferralFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <nav
        aria-label="Referral request navigation"
        className="mx-auto flex w-full max-w-275 justify-end px-xl py-2xl"
      >
        <Button
          variant="secondary"
          nativeButton={false}
          render={<Link href={REFERRAL_REQUESTS} />}
        >
          Back
        </Button>
      </nav>
    </footer>
  );
}
