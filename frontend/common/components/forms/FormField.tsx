import type { ReactNode } from "react";

import { Label } from "@/common/components/ui/label";
import { cn } from "@/common/lib/utils";

import { FieldError } from "./FieldError";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

function FormField({
  label,
  htmlFor,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export { FormField };
