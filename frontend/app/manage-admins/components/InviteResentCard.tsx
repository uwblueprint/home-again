import { MailCheckIcon } from "lucide-react";
import { StatusCard } from "./StatusCard";

type InviteResentCardProps = {
  firstName: string;
  lastName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteResentCard({
  firstName,
  lastName,
  open,
  onOpenChange,
}: InviteResentCardProps) {
  return (
    <StatusCard
      icon={<MailCheckIcon className="size-8 text-success" />}
      title="Invite resent"
      message={`${firstName} ${lastName} will have 24 hours to accept the invite.`}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
