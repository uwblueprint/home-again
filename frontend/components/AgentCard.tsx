"use client";

import { useEffect, useState } from "react";
import { Trash2, SquarePen, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isAdmin: boolean;
}

interface AgentCardProps {
  index: number;
  agent: AgentFormData;
  isEditing: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onSave: (data: AgentFormData) => void;
  onRemove: () => void;
}

type AgentTextField = "firstName" | "lastName" | "email" | "phoneNumber";
type FormErrors = Partial<Record<AgentTextField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-]{7,20}$/;
const TOUCHED_ON_SAVE: AgentTextField[] = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
];

function validate(form: AgentFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter your last name.";
  if (!form.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Enter your phone number.";
  } else if (!PHONE_RE.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-destructive">
      {message}
    </p>
  );
}

export function AgentCard({
  index,
  agent,
  isEditing,
  disabled = false,
  onEdit,
  onSave,
  onRemove,
}: AgentCardProps) {
  const [formData, setFormData] = useState<AgentFormData>(agent);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<AgentTextField, boolean>>
  >({});

  useEffect(() => {
    setFormData(agent);
    setErrors({});
    setTouched({});
  }, [agent]);

  const displayName =
    agent.firstName || agent.lastName
      ? `${agent.firstName} ${agent.lastName}`.trim()
      : "New Agent";

  const isSaved = agent.firstName !== "" || agent.lastName !== "";

  function handleSave() {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched(
      TOUCHED_ON_SAVE.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Partial<Record<AgentTextField, boolean>>
      )
    );

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSave(formData);
  }

  function handleCollapse() {
    handleSave();
  }

  function handleChange(field: AgentTextField, value: string) {
    const nextForm = { ...formData, [field]: value };

    setFormData(nextForm);

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validate(nextForm)[field],
      }));
    }
  }

  function handleBlur(field: AgentTextField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validate(formData)[field],
    }));
  }

  function handleAdminChange(checked: boolean) {
    setFormData((prev) => ({ ...prev, isAdmin: checked }));
  }

  const fieldProps = (field: AgentTextField) => ({
    value: formData[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(field, e.target.value),
    onBlur: () => handleBlur(field),
    "aria-invalid":
      touched[field] && !!errors[field] ? (true as const) : undefined,
  });

  if (isEditing) {
    return (
      <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          {/* Header — click row to collapse, X to delete */}
          <div className="flex items-center justify-between">
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
              className={`flex-1 py-1 text-sm text-foreground ${isSaved ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}`}
            >
              <span className="font-semibold">Agent {index + 1}:</span>{" "}
              {displayName}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              <Trash2 className="size-6" />
            </button>
          </div>

          {/* Row 1: First Name / Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`firstName-${index}`}>First Name</Label>
              <Input
                id={`firstName-${index}`}
                placeholder="John"
                className="h-11"
                {...fieldProps("firstName")}
              />
              <FieldError
                message={touched.firstName ? errors.firstName : undefined}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`lastName-${index}`}>Last Name</Label>
              <Input
                id={`lastName-${index}`}
                placeholder="Doe"
                className="h-11"
                {...fieldProps("lastName")}
              />
              <FieldError
                message={touched.lastName ? errors.lastName : undefined}
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
                className="h-11"
                {...fieldProps("email")}
              />
              <FieldError message={touched.email ? errors.email : undefined} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`phone-${index}`}>Phone Number</Label>
              <Input
                id={`phone-${index}`}
                type="tel"
                placeholder="22901220132"
                className="h-11"
                {...fieldProps("phoneNumber")}
              />
              <FieldError
                message={touched.phoneNumber ? errors.phoneNumber : undefined}
              />
            </div>
          </div>

          {/* Admin checkbox */}
          <div className="flex items-center gap-1.5">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground/80">
              <Checkbox
                checked={formData.isAdmin}
                onCheckedChange={(checked) => handleAdminChange(checked === true)}
              />
              Make this user an admin
            </label>
            <Tooltip>
              <TooltipTrigger
                aria-label="What does admin access mean?"
                className="text-foreground/60 transition-colors hover:text-foreground"
              >
                <Info className="size-[18px]" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[413px] text-left">
                All agents can access client accounts. Admins can also add
                agents and assign admin access to other agents.
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Save Button */}
          <Button
            variant="secondary"
            className="w-full rounded-full px-3 py-1.5"
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
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Agent {index + 1}:</span>{" "}
          {displayName}
        </p>
        {agent.isAdmin && isSaved ? (
          <Badge variant="outline" className="font-semibold">
            Admin User
          </Badge>
        ) : null}
      </div>
      {isSaved ? (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          className="text-foreground/60 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-foreground/60"
        >
          <SquarePen className="size-6" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          className="text-foreground/60 hover:text-foreground transition-colors"
        >
          <Trash2 className="size-6" />
        </button>
      )}
    </div>
  );
}
