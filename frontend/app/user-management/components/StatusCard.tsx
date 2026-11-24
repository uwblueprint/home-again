import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from "@/common/components/ui";

type StatusCardProps = {
  icon: ReactNode;
  title: string;
  message: ReactNode;
  buttonLabel?: string;
  onClose: () => void;
};

export function StatusCard({
  icon,
  title,
  message,
  buttonLabel = "Close",
  onClose,
}: StatusCardProps) {
  return (
    <Card className="w-[480px] rounded-xl p-8 flex flex-col items-center gap-4">
      <CardHeader className="p-0 flex flex-col items-center gap-3">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col items-center gap-6 text-center text-sm text-muted-foreground">
        {message}
        <Button
          variant="secondary"
          className="min-h-9 rounded-lg bg-accent px-4 py-2 shadow-xs"
          onClick={onClose}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
