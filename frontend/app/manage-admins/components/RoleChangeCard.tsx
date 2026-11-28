import { SmileIcon } from "lucide-react";
import { StatusCard } from "./StatusCard";
import { ADMIN_ROLE_LABELS, AdminRole } from "./types";

type RoleChangeCardProps = {
  firstName: string;
  lastName: string;
  role: AdminRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RoleChangeCard({
  firstName,
  lastName,
  role,
  open,
  onOpenChange,
}: RoleChangeCardProps) {
  const roleLabel = ADMIN_ROLE_LABELS[role];
  const article = role === "admin" ? "an" : "a";

  return (
    <StatusCard
      icon={<SmileIcon className="size-8 text-success" />}
      title="Role change successful"
      message={`${firstName} ${lastName} is now ${article} ${roleLabel}.`}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
