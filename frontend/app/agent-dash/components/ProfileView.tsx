"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { AGENT_DASH } from "@/common/constants";
import { cn } from "@/common/lib/utils";

import {
  INITIAL_PROFILE,
  type AgentProfile,
  type AgentProfileData,
} from "../data/mockProfile";
import { ProfileEditDialog } from "./ProfileEditDialog";

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-paragraph-small text-muted-foreground">{label}</span>
      <span className="text-paragraph-regular text-foreground">{value}</span>
    </div>
  );
}

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

export function ProfileView() {
  const [profileData, setProfileData] =
    useState<AgentProfileData>(INITIAL_PROFILE);
  const [editOpen, setEditOpen] = useState(false);

  const handleSave = (agent: AgentProfile) => {
    setProfileData((current) => ({ ...current, agent }));
  };

  const { agent, agency, programs } = profileData;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl">
      <h1 className="text-heading-2 font-semibold text-foreground">
        My Profile
      </h1>

      <section className="flex flex-col gap-md">
        <h2 className="text-heading-4 font-semibold text-foreground">
          My Details
        </h2>

        <SectionCard className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit profile details"
            className="absolute top-md right-md"
            onClick={() => setEditOpen(true)}
          >
            <SquarePen className="size-5" />
          </Button>
          <div className="grid grid-cols-1 gap-xl pr-10 sm:grid-cols-2">
            <DetailField label="First name" value={agent.firstName} />
            <DetailField label="Last Name" value={agent.lastName} />
            <DetailField label="Email" value={agent.email} />
            <DetailField label="Phone number" value={agent.phone} />
          </div>
        </SectionCard>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-heading-4 font-semibold text-foreground">
          Agency Details
        </h2>
        <SectionCard>
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Agency name" value={agency.name} />
            <DetailField label="Address line 1" value={agency.addressLine1} />
            <DetailField
              label="Address line 2"
              value={agency.addressLine2 ?? "N/A"}
            />
            <DetailField label="City" value={agency.city} />
            <DetailField label="Postal code" value={agency.postalCode} />
            <DetailField label="Phone number" value={agency.phone} />
          </div>
        </SectionCard>
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-heading-4 font-semibold text-foreground">
          Programs
        </h2>

        <div className="flex flex-col gap-sm">
          {programs.map((program) => (
            <SectionCard
              key={program.id}
              className="flex flex-row items-center justify-between gap-sm py-md"
            >
              <span className="text-paragraph-regular text-foreground">
                {program.name}
              </span>
              <div className="flex items-center gap-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${program.name}`}
                >
                  <SquarePen className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${program.name}`}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </SectionCard>
          ))}

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-center border-dashed"
          >
            <Plus className="size-4" data-icon="inline-start" />
            Add Program
          </Button>
        </div>
      </section>

      <div className="mt-auto flex justify-end pt-xl">
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH} />}
        >
          Back
        </Button>
      </div>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={agent}
        onSave={handleSave}
      />
    </div>
  );
}
