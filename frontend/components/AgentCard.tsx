"use client";

import { useEffect, useState } from "react";
import { X, SquarePen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface AgentCardProps {
  index: number;
  agent: AgentFormData;
  isEditing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onSave: (data: AgentFormData) => void;
  onRemove: () => void;
}

export function AgentCard({
  index,
  agent,
  isEditing,
  onEdit,
  onClose,
  onSave,
  onRemove,
}: AgentCardProps) {
  const [formData, setFormData] = useState<AgentFormData>(agent);

  useEffect(() => {
    setFormData(agent);
  }, [agent]);

  const displayName =
    agent.firstName || agent.lastName
      ? `${agent.firstName} ${agent.lastName}`.trim()
      : "New Agent";

  const isSaved = agent.firstName !== "" || agent.lastName !== "";

  const canSave =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phoneNumber.trim() !== "";

  function handleSave() {
    onSave(formData);
  }

  if (isEditing) {
    return (
      <div className="w-full rounded-xl border border-border bg-card px-12 py-6 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Agent {index + 1}:</span>{" "}
              {displayName}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Row 1: First Name / Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`firstName-${index}`}>First Name</Label>
              <Input
                id={`firstName-${index}`}
                placeholder="John"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`lastName-${index}`}>Last Name</Label>
              <Input
                id={`lastName-${index}`}
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Row 2: Email / Phone */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`email-${index}`}>Email</Label>
              <Input
                id={`email-${index}`}
                type="email"
                placeholder="name@agency.org"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`phone-${index}`}>Phone Number</Label>
              <Input
                id={`phone-${index}`}
                type="tel"
                placeholder="22901220132"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="secondary"
            className="w-full rounded-full"
            disabled={!canSave}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  // Collapsed state
  return (
    <div className="flex w-full items-center justify-between rounded-[14px] border border-foreground/10 bg-card p-6 shadow-sm">
      <p className="text-sm text-foreground">
        <span className="font-semibold">Agent {index + 1}:</span>{" "}
        {displayName}
      </p>
      {isSaved ? (
        <button
          type="button"
          onClick={onEdit}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          <SquarePen className="size-6" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          <X className="size-6" />
        </button>
      )}
    </div>
  );
}
