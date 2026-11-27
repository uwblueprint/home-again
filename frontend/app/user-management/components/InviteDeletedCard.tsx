import { Trash2Icon } from "lucide-react";
import { StatusCard } from "./StatusCard";

type InviteDeletedCardProps = {
  firstName: string;
  lastName: string;
  onClose: () => void;
};

export function InviteDeletedCard({
  firstName,
  lastName,
  onClose,
}: InviteDeletedCardProps) {
  return (
    <StatusCard
      icon={<Trash2Icon className="size-8 text-destructive" />}
      title="Invite deleted"
      message={`Invite to ${firstName} ${lastName} has been successfully deleted.`}
      onClose={onClose}
    />
  );
}
