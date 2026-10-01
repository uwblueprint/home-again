"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { AgentHover } from "@/common/components/agents";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AGENT_DASH_CLIENTS, AGENT_DASH_REFERRAL } from "@/common/constants";
import { cn } from "@/common/lib/utils";
import { useAuthStore } from "@/common/stores/authStore";

import {
  getClientProfileById,
  getClientReferralHistory,
} from "../data/mockClients";
import { ReferralStatusBadge } from "./ReferralStatusBadge";

function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-paragraph-small font-semibold text-foreground">
        {label}
      </span>
      <span className="text-paragraph-regular text-foreground">{value}</span>
    </div>
  );
}

type ClientProfileViewProps = {
  clientId: string;
};

export function ClientProfileView({ clientId }: ClientProfileViewProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = getClientProfileById(clientId);
  const [history] = useState(() => getClientReferralHistory(clientId));

  const agentHistory = useMemo(
    () =>
      [...history]
        .filter((item) =>
          user?.id
            ? item.caseAgents.some((agent) => agent.id === user.id)
            : false
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [history, user?.id]
  );

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-md">
        <p className="text-paragraph-regular text-muted-foreground">
          Client not found.
        </p>
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_CLIENTS} />}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl">
      <section className="flex flex-col gap-md">
        <h1 className="text-heading-2 font-semibold text-foreground">
          {profile.firstName} {profile.lastName}
        </h1>

        <SectionCard>
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="First Name" value={profile.firstName} />
            <DetailField label="Last Name" value={profile.lastName} />
            <DetailField label="Birthday" value={profile.birthday} />
            <DetailField label="Gender" value={profile.gender} />
            <DetailField
              label="Immigration status"
              value={profile.immigrationStatus}
            />
            <DetailField label="Phone number" value={profile.phone} />
            <DetailField label="Phone notes" value={profile.phoneNotes} />
            <DetailField
              label="Number of adults"
              value={String(profile.numAdults)}
            />
            <DetailField
              label="Number of children"
              value={String(profile.numChildren)}
            />
            <DetailField label="Family type" value={profile.familyType} />
            <DetailField
              label="Coordinated access"
              value={profile.coordinatedAccess}
            />
          </div>
        </SectionCard>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-heading-4 font-semibold text-foreground">
          Referral History
        </h2>
        <SectionCard className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto px-xl py-3.5 text-paragraph-small font-medium text-foreground">
                  Referral ID
                </TableHead>
                <TableHead className="h-auto px-xl py-3.5 text-paragraph-small font-medium text-foreground">
                  Case Agents
                </TableHead>
                <TableHead className="h-auto px-xl py-3.5 text-paragraph-small font-medium text-foreground">
                  Completion Date
                </TableHead>
                <TableHead className="h-auto px-xl py-3.5 text-paragraph-small font-medium text-foreground">
                  Status
                </TableHead>
                <TableHead className="w-10 px-xl" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 px-xl text-center text-muted-foreground"
                  >
                    No referral history
                  </TableCell>
                </TableRow>
              ) : (
                agentHistory.map((item) => (
                  <TableRow
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer border-border"
                    onClick={() => router.push(AGENT_DASH_REFERRAL(item.id))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(AGENT_DASH_REFERRAL(item.id));
                      }
                    }}
                  >
                    <TableCell className="px-xl py-3.5 text-paragraph-small text-foreground">
                      {item.referralId}
                    </TableCell>
                    <TableCell className="px-xl py-3.5">
                      <div className="flex items-center -space-x-2">
                        {item.caseAgents.map((agent) => (
                          <AgentHover
                            key={agent.id}
                            firstName={agent.firstName}
                            lastName={agent.lastName}
                            role={agent.role}
                            size="sm"
                            className="ring-2 ring-background"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-xl py-3.5 text-paragraph-small text-foreground">
                      {item.completionDate ?? "—"}
                    </TableCell>
                    <TableCell className="px-xl py-3.5">
                      <ReferralStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="px-xl py-3.5">
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SectionCard>
      </section>

      <div className="mt-auto flex justify-end pt-xl">
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_CLIENTS} />}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
