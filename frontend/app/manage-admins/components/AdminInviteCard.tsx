import { UserRoundXIcon } from "lucide-react";
import { StatusCard } from "./StatusCard";

type AdminInviteCardProps = {
  firstName: string;
  lastName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminInviteCard({
  firstName,
  lastName,
  open,
  onOpenChange,
}: AdminInviteCardProps) {
  return (
    <StatusCard
      icon={<UserRoundXIcon className="size-8 text-destructive" />}
      title="Admin invite cancelled"
      message={`Admin invite to ${firstName} ${lastName} has been cancelled.`}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
