"use client";

import { useState } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";

import {
  DetailCard,
  DetailPage,
  DetailSection,
  ProfileEditDialog,
} from "@/app/agent-dash/components";
import { INITIAL_PROFILE } from "@/app/agent-dash/data/mockProfile";
import { InformationBlock } from "@/common/components/data-display";
import { Button } from "@/common/components/ui/button";
import { AGENT_DASH } from "@/common/constants";

export default function ProfilePage() {
  const [agent, setAgent] = useState(INITIAL_PROFILE.agent);
  const [editOpen, setEditOpen] = useState(false);
  const { agency, programs } = INITIAL_PROFILE;

  return (
    <DetailPage title="My Profile" backHref={AGENT_DASH}>
      <DetailSection title="My Details">
        <DetailCard className="relative">
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
            <InformationBlock label="First name" value={agent.firstName} />
            <InformationBlock label="Last Name" value={agent.lastName} />
            <InformationBlock label="Email" value={agent.email} />
            <InformationBlock label="Phone number" value={agent.phone} />
          </div>
        </DetailCard>
      </DetailSection>

      <DetailSection title="Agency Details">
        <DetailCard>
          <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-3">
            <InformationBlock label="Agency name" value={agency.name} />
            <InformationBlock
              label="Address line 1"
              value={agency.addressLine1}
            />
            <InformationBlock
              label="Address line 2"
              value={agency.addressLine2 ?? "N/A"}
            />
            <InformationBlock label="City" value={agency.city} />
            <InformationBlock label="Postal code" value={agency.postalCode} />
            <InformationBlock label="Phone number" value={agency.phone} />
          </div>
        </DetailCard>
      </DetailSection>

      <DetailSection title="Programs">
        <div className="flex flex-col gap-sm">
          {programs.map((program) => (
            <DetailCard
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
            </DetailCard>
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
      </DetailSection>

      <ProfileEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={agent}
        onSave={setAgent}
      />
    </DetailPage>
  );
}
