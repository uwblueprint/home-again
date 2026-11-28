import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  Button,
} from "@/common/components/ui";

type StatusCardProps = {
  icon: ReactNode;
  title: string;
  message: ReactNode;
  buttonLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StatusCard({
  icon,
  title,
  message,
  buttonLabel = "Close",
  open,
  onOpenChange,
}: StatusCardProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="items-center text-center sm:max-w-120">
        {icon}
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <div className="text-paragraph-small text-muted-foreground">
          {message}
        </div>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {buttonLabel}
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
