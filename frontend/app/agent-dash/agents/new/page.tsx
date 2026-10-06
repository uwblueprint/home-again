"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { BackButton } from "@/app/agent-dash/components";
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
import { isAgencyAdminAgent, useAuthStore } from "@/common/stores/authStore";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
};

type TextField = Exclude<keyof FormState, "isAdmin">;
type FormErrors = Partial<Record<TextField, string>>;

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  isAdmin: false,
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!form.firstName.trim()) errors.firstName = "Enter a first name.";
  if (!form.lastName.trim()) errors.lastName = "Enter a last name.";
  if (!email) errors.email = "Enter an email address.";
  else if (!EMAIL_REGEX.test(email))
    errors.email = "Enter a valid email address.";
  if (!phone) errors.phone = "Enter a phone number.";
  else if (!PHONE_REGEX.test(phone))
    errors.phone = "Enter a valid phone number.";

  return errors;
}

export default function AddNewAgentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<TextField, boolean>>>(
    {}
  );
  const errors = validate(form);

  if (!isAgencyAdminAgent(user)) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-md">
        <h1 className="text-heading-2 font-semibold text-foreground">
          Admin access required
        </h1>
        <p className="text-paragraph-regular text-muted-foreground">
          Only agency admin agents can add new agents.
        </p>
        <BackButton href={AGENT_DASH_AGENTS} />
      </div>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true });
    if (Object.keys(errors).length > 0) return;

    // Mock submit until the agents API is wired.
    router.push(AGENT_DASH_AGENTS);
  }

  function textInput(
    key: TextField,
    props: { label: string; placeholder: string; type?: string }
  ) {
    const id = `add-agent-${key}`;
    const error = touched[key] ? errors[key] : undefined;

    return (
      <FormField label={props.label} htmlFor={id} required error={error}>
        <Input
          id={id}
          type={props.type}
          placeholder={props.placeholder}
          value={form[key]}
          onChange={(event) =>
            setForm((current) => ({ ...current, [key]: event.target.value }))
          }
          onBlur={() => setTouched((current) => ({ ...current, [key]: true }))}
          aria-invalid={error ? true : undefined}
        />
      </FormField>
    );
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
        {textInput("firstName", {
          label: "First Name",
          placeholder: "Enter first name",
        })}
        {textInput("lastName", {
          label: "Last Name",
          placeholder: "Enter last name",
        })}

        <div className="flex flex-col gap-md">
          {textInput("email", {
            label: "Email",
            placeholder: "Enter email address",
            type: "email",
          })}

          <div className="flex items-center gap-1.5">
            <Label
              htmlFor="add-agent-is-admin"
              className="cursor-pointer gap-3 font-normal text-foreground/80"
            >
              <Checkbox
                id="add-agent-is-admin"
                checked={form.isAdmin}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isAdmin: checked === true,
                  }))
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

        {textInput("phone", {
          label: "Phone number",
          placeholder: "Enter phone number",
          type: "tel",
        })}
      </div>

      <div className="mt-auto flex justify-end gap-sm pt-xl">
        <BackButton href={AGENT_DASH_AGENTS} />
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
