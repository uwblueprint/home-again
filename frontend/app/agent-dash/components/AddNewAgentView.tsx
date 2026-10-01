"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { FormField } from "@/common/components/forms";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";
import { AGENT_DASH_AGENTS } from "@/common/constants";
import { EMAIL_REGEX, PHONE_REGEX } from "@/common/constants/validators";
import {
  isAgencyAdminAgent,
  useAuthStore,
} from "@/common/stores/authStore";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  isAdmin: false,
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) {
    errors.firstName = "Enter a first name.";
  }
  if (!form.lastName.trim()) {
    errors.lastName = "Enter a last name.";
  }
  if (!form.email.trim()) {
    errors.email = "Enter an email address.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Enter a phone number.";
  } else if (!PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  return errors;
}

export function AddNewAgentView() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canAddAgent = isAgencyAdminAgent(user);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>(
    {}
  );

  const fieldIds = useMemo(
    () => ({
      firstName: "add-agent-first-name",
      lastName: "add-agent-last-name",
      email: "add-agent-email",
      phone: "add-agent-phone",
      isAdmin: "add-agent-is-admin",
    }),
    []
  );

  if (!canAddAgent) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-md">
        <h1 className="text-heading-2 font-semibold text-foreground">
          Admin access required
        </h1>
        <p className="text-paragraph-regular text-muted-foreground">
          Only agency admin agents can add new agents.
        </p>
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_AGENTS} />}
        >
          Back
        </Button>
      </div>
    );
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched[key]) {
      setErrors(validate(next));
    }
  }

  function handleBlur(key: keyof FormState) {
    setTouched((current) => ({ ...current, [key]: true }));
    setErrors(validate(form));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(form);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Mock submit until the agents API is wired.
    router.push(AGENT_DASH_AGENTS);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-xl"
    >
      <div className="flex flex-col gap-xs">
        <h1 className="text-heading-2 font-semibold text-foreground">
          Add New Agent
        </h1>
        <p className="text-paragraph-regular text-muted-foreground">
          Enter agent details here
        </p>
      </div>

      <div className="grid grid-cols-1 gap-xl sm:grid-cols-2">
        <FormField
          label="First Name"
          htmlFor={fieldIds.firstName}
          required
          error={touched.firstName ? errors.firstName : undefined}
        >
          <Input
            id={fieldIds.firstName}
            placeholder="Enter first name"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            onBlur={() => handleBlur("firstName")}
            aria-invalid={
              touched.firstName && !!errors.firstName ? true : undefined
            }
          />
        </FormField>

        <FormField
          label="Last Name"
          htmlFor={fieldIds.lastName}
          required
          error={touched.lastName ? errors.lastName : undefined}
        >
          <Input
            id={fieldIds.lastName}
            placeholder="Enter last name"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            onBlur={() => handleBlur("lastName")}
            aria-invalid={
              touched.lastName && !!errors.lastName ? true : undefined
            }
          />
        </FormField>

        <div className="flex flex-col gap-md">
          <FormField
            label="Email"
            htmlFor={fieldIds.email}
            required
            error={touched.email ? errors.email : undefined}
          >
            <Input
              id={fieldIds.email}
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              aria-invalid={touched.email && !!errors.email ? true : undefined}
            />
          </FormField>

          <div className="flex items-center gap-1.5">
            <Label
              htmlFor={fieldIds.isAdmin}
              className="cursor-pointer gap-3 font-normal text-foreground/80"
            >
              <Checkbox
                id={fieldIds.isAdmin}
                checked={form.isAdmin}
                onCheckedChange={(checked) =>
                  updateField("isAdmin", checked === true)
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
                  All agents can access client accounts. Admins can also add
                  agents and assign admin access to other agents.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <FormField
          label="Phone number"
          htmlFor={fieldIds.phone}
          required
          error={touched.phone ? errors.phone : undefined}
        >
          <Input
            id={fieldIds.phone}
            type="tel"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            onBlur={() => handleBlur("phone")}
            aria-invalid={touched.phone && !!errors.phone ? true : undefined}
          />
        </FormField>
      </div>

      <div className="mt-auto flex justify-end gap-sm pt-xl">
        <Button
          type="button"
          variant="secondary"
          nativeButton={false}
          render={<Link href={AGENT_DASH_AGENTS} />}
        >
          Back
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
