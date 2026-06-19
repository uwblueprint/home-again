"use client";

import { useEffect, useState } from "react";
import { Trash2, SquarePen, Info } from "lucide-react";
import { FormField } from "@/common/components/forms";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Card } from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Label } from "@/common/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

import { EMAIL_REGEX } from "@/common/constants/validators";

import { AgentSummaryRow } from "./AgentSummaryRow";

export interface AgentFormData {
  email: string;
  isAdmin: boolean;
}

interface AgentCardProps {
  index: number;
  agent: AgentFormData;
  isEditing: boolean;
  isNew?: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
  onRemove: () => void;
}

type FormErrors = Partial<Record<keyof AgentFormData, string>>;

function validate(form: AgentFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

export function AgentCard({
  index,
  agent,
  isEditing,
  isNew = false,
  disabled = false,
  onEdit,
  onSave,
  onCancel,
  onRemove,
}: AgentCardProps) {
  const [formData, setFormData] = useState<AgentFormData>(agent);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<"email", boolean>>>({});

  useEffect(() => {
    setFormData(agent);
    setErrors({});
    setTouched({});
  }, [agent]);

  const displayEmail = agent.email.trim() || "New Agent";
  const isSaved = agent.email.trim() !== "";
  const adminCheckboxId = `admin-${index}`;

  function handleSave() {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({ email: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave(formData);
  }

  function handleCollapse() {
    handleSave();
  }

  function handleChange(value: string) {
    const nextForm = { ...formData, email: value };

    setFormData(nextForm);

    if (touched.email) {
      setErrors({ email: validate(nextForm).email });
    }
  }

  function handleBlur() {
    setTouched({ email: true });
    setErrors({ email: validate(formData).email });
  }

  function handleAdminChange(checked: boolean) {
    setFormData((prev) => ({ ...prev, isAdmin: checked }));
  }

  function handleCancel() {
    setFormData(agent);
    setErrors({});
    setTouched({});
    onCancel();
  }

  if (isEditing) {
    return (
      <Card className="w-full">
        {!isNew ? (
          <div className="flex w-full items-center justify-between self-stretch">
            <div
              role={isSaved ? "button" : undefined}
              tabIndex={isSaved ? 0 : undefined}
              onClick={isSaved ? handleCollapse : undefined}
              onKeyDown={
                isSaved
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCollapse();
                      }
                    }
                  : undefined
              }
              className={`flex-1 py-1 ${isSaved ? "cursor-pointer transition-opacity hover:opacity-70" : ""}`}
            >
              <AgentSummaryRow
                index={index}
                emailDisplay={displayEmail}
                showAdminBadge={agent.isAdmin && isSaved}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={onRemove}
              className="text-foreground/60 hover:text-foreground"
            >
              <Trash2 className="size-6" />
            </Button>
          </div>
        ) : null}

        <FormField
          label="Email"
          htmlFor={`email-${index}`}
          required
          className="w-full self-stretch"
          error={touched.email ? errors.email : undefined}
        >
          <Input
            id={`email-${index}`}
            type="email"
            placeholder="name@agency.org"
            className="h-11 w-full"
            value={formData.email}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={handleBlur}
            aria-invalid={
              touched.email && !!errors.email ? (true as const) : undefined
            }
          />
        </FormField>

        <div className="flex items-center gap-1.5">
          <Label
            htmlFor={adminCheckboxId}
            className="cursor-pointer gap-3 font-normal text-foreground/80"
          >
            <Checkbox
              id={adminCheckboxId}
              checked={formData.isAdmin}
              onCheckedChange={(checked) =>
                handleAdminChange(checked === true)
              }
            />
            Make this user an admin
          </Label>
          <TooltipProvider delay={200}>
            <Tooltip>
              <TooltipTrigger
                aria-label="What does admin access mean?"
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                <Info className="size-[18px]" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                className="max-w-[413px] text-left text-sm leading-snug"
              >
                All agents can access client accounts. Admins can also add agents
                and assign admin access to other agents.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex w-full self-stretch justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full flex-row items-center justify-between">
      <AgentSummaryRow
        index={index}
        emailDisplay={displayEmail}
        showAdminBadge={agent.isAdmin && isSaved}
      />
      {isSaved ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={onEdit}
          disabled={disabled}
          className="shrink-0 text-foreground/60 hover:text-foreground disabled:opacity-40"
        >
          <SquarePen className="size-6" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          onClick={onRemove}
          className="shrink-0 text-foreground/60 hover:text-foreground"
        >
          <Trash2 className="size-6" />
        </Button>
      )}
    </Card>
  );
}
