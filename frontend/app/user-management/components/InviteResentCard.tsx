import { MailCheckIcon } from "lucide-react";
import { StatusCard } from "./StatusCard";

type InviteResentCardProps = {
  firstName: string;
  lastName: string;
  onClose: () => void;
};

export function InviteResentCard({
  firstName,
  lastName,
  onClose,
}: InviteResentCardProps) {
  return (
    <StatusCard
      icon={<MailCheckIcon className="size-8 text-green-600" />}
      title="Invite resent"
      message={`${firstName} ${lastName} will have 24 hours to accept the invite.`}
      onClose={onClose}
    />
  );
}
