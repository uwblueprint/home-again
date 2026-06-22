import { InputError } from "@/common/components/ui/input";

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return <InputError className="mt-1">{message}</InputError>;
}

export { FieldError };
