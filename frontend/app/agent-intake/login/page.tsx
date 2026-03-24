"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { HOME_PAGE } from "@/constants/Routes";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!validateEmail(email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login", {
        email: email.trim(),
        password,
      });
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      router.push(HOME_PAGE);
    } catch (err: unknown) {
      const status =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "status" in err.response
          ? (err.response as { status: number }).status
          : null;

      if (status === 401 || status === 403) {
        setErrors({ general: "Invalid email or password. Please try again." });
      } else {
        setErrors({
          general: "Unable to sign in at this time. Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden md:block w-[37%] bg-[var(--raw-colors-neutral-300)]" />

      {/* Right content panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-[380px] space-y-6">
          {/* Logo */}
          <Image
            src="/logo192.png"
            alt="Home Again Furniture Bank"
            width={64}
            height={64}
            priority
          />

          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground">Agent Portal</h1>

          {/* General error banner */}
          {errors.general && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--unofficial-destructive-border)] bg-[var(--unofficial-destructive-subtle)] px-4 py-3 text-sm text-[var(--unofficial-destructive-text)]"
            >
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@agency.org"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={!!errors.email}
                className="h-11"
                autoComplete="email"
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-[var(--unofficial-destructive-text)]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
                className="h-11"
                autoComplete="current-password"
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-[var(--unofficial-destructive-text)]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          {/* Footer note */}
          <p className="text-sm text-muted-foreground">
            Don&apos;t have credentials? Contact your HAFB administrator at{" "}
            [email address TBA].
          </p>
        </div>
      </div>
    </div>
  );
}
