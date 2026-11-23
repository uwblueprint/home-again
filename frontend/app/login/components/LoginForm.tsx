"use client";

import Image from "next/image";
import { CircleCheck, CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Toast } from "@/common/components/feedback";
import { FormField } from "@/common/components/forms/FormField";
import { EntrySplitLayout } from "@/common/components/layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Alert } from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { LOGIN_PAGE } from "@/common/constants/Routes";
import { EMAIL_REGEX } from "@/common/constants/validators";

// TODO: replace with the real HAFB admin contact email.
const ADMIN_CONTACT_EMAIL = "admin@homeagain.ca";

type Errors = {
  email?: string;
  password?: string;
};

export default function LoginForm({
  passwordReset = false,
}: {
  /** True when arriving from a successful password reset. */
  passwordReset?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetToastOpen, setResetToastOpen] = useState(passwordReset);

  // Drop `?reset=success` so a refresh doesn't show the toast again.
  useEffect(() => {
    if (passwordReset) router.replace(LOGIN_PAGE, { scroll: false });
  }, [passwordReset, router]);

  // TODO(auth): Forgot-password currently falls back to the placeholder
  // "name@agency.org" when the email field is empty, and Reset only closes
  // the dialog. When wiring Supabase auth: require a real email (or change
  // copy to "Enter your email above…"), validate which agency/user the
  // reset link is for, and actually send the reset email. Design may also
  // want an "enter email" step instead of this confirm-only dialog.
  const resetEmail = email.trim() || "name@agency.org";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Errors = {};
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // Frontend-only: no auth yet, so surface the incorrect-password UI.
    setErrors({
      password: "Incorrect password, please try again.",
    });
  }

  return (
    <EntrySplitLayout>
      <Toast open={resetToastOpen} onOpenChange={setResetToastOpen}>
        Password successfully reset
      </Toast>

      <Image
        src="/hafb_logo.svg"
        alt="Home Again Furniture Bank"
        width={91}
        height={55}
        className="h-auto w-auto"
        priority
      />

      <h1 className="text-heading-2 font-semibold text-foreground">
        Agent Portal
      </h1>

      <Alert
        variant="info"
        icon={CircleCheck}
        className="bg-background text-foreground text-paragraph-small"
      >
        Your account is ready. Sign in to continue.
      </Alert>

      <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@agency.org"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((previous) => ({ ...previous, email: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.email)}
              className="h-10 font-normal text-paragraph-small placeholder:text-[#B9B9B9] placeholder:text-paragraph-small"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password}
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password) {
                    setErrors((previous) => ({
                      ...previous,
                      password: undefined,
                    }));
                  }
                }}
                aria-invalid={Boolean(errors.password)}
                className="h-10 pr-10"
              />
              {errors.password ? (
                <CircleX
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[var(--unofficial-destructive-text)]"
                  aria-hidden
                />
              ) : null}
            </div>
          </FormField>
        </div>

        <div className="mt-lg flex flex-col gap-xs">
          <Button
            type="submit"
            size="xl"
            rounded
            className="h-10 w-full px-6 py-2.5 text-paragraph-small"
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            rounded
            onClick={() => setForgotOpen(true)}
            className="h-10 w-full font-normal text-paragraph-small text-foreground hover:bg-secondary"
          >
            Forgot Password
          </Button>
        </div>

        <p className="mt-xl text-left font-normal text-paragraph-regular text-[#6C6C6C]">
          Don&apos;t have credentials? Contact your HAFB administrator at{" "}
          <a
            href={`mailto:${ADMIN_CONTACT_EMAIL}`}
            className="font-normal text-[#6C6C6C] underline-offset-4 hover:underline"
          >
            {ADMIN_CONTACT_EMAIL}
          </a>
          .
        </p>
      </form>

      <AlertDialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <AlertDialogContent className="flex h-[196px] w-[480px] max-w-[480px] flex-col gap-lg rounded-2xl p-xl sm:max-w-[480px]">
          <AlertDialogHeader className="gap-md">
            <AlertDialogTitle className="text-heading-4 font-semibold text-foreground">
              Forgot Password?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-normal text-paragraph-small text-muted-foreground">
              An email will be sent to{" "}
              <span className="font-normal text-secondary-foreground">
                {resetEmail}
              </span>{" "}
              with a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-auto gap-xs">
            <AlertDialogCancel
              variant="secondary"
              className="rounded-lg font-normal"
            >
              Cancel
            </AlertDialogCancel>
            {/* Frontend-only: Reset just closes the dialog. */}
            <AlertDialogAction className="rounded-lg">Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntrySplitLayout>
  );
}
