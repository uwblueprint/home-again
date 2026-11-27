import { SmileIcon } from "lucide-react";
import { StatusCard } from "./StatusCard";

type AdminRole = "Admin" | "Superadmin";

type RoleChangeCardProps = {
  firstName: string;
  lastName: string;
  role: AdminRole;
  onClose: () => void;
};

export function RoleChangeCard({
  firstName,
  lastName,
  role,
  onClose,
}: RoleChangeCardProps) {
  return (
    <StatusCard
      icon={<SmileIcon className="size-8 text-green-600" />}
      title="Role change successful"
      message={`${firstName} ${lastName} is now a ${role}.`}
      onClose={onClose}
    />
  );
}
