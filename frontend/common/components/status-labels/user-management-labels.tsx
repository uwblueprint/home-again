import { Badge } from "@/common/components/ui/badge";

export function SuperadminBadge() {
  return (
    
    <Badge className="h-auto rounded-lg text-paragraph-small font-normal border-transparent bg-(--brand-purples-200) text-(--brand-purples-700)">
      Superadmin
    </Badge>
  );
}

export function AdminBadge() {
  return (
    <Badge className="h-auto rounded-lg text-paragraph-small font-normal border-transparent bg-neutral-200 text-neutral-700">
      Admin
    </Badge>
  );
}
export function InviteExpiredBadge() {
  return (
    <Badge className="h-auto rounded-lg text-paragraph-small font-normal border-transparent bg-red-100 text-rose-600">
      Invite Expired
    </Badge>
  );
}

export function InvitePendingBadge() {
  return (
    <Badge className="h-auto rounded-lg text-paragraph-small font-normal border-transparent bg-amber-100 text-amber-900">
      Invite Pending
    </Badge>
  );
}