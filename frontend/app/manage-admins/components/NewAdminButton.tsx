import { UserPlus } from "lucide-react";

import { Button } from "@/common/components/ui/button";

/** Not wired up to anything yet. */
export function NewAdminButton() {
  return (
    <Button onClick={() => {}}>
      <UserPlus className="size-4" data-icon="inline-start" />
      New Admin
    </Button>
  );
}
