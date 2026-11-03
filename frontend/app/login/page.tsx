import Link from "next/link";

import { Button } from "@/common/components/ui/button";
import { HOME_PAGE } from "@/common/constants";

/** Destination for signOut() / 401 redirects. Sign-in UI is a later ticket. */
export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-lg px-xl text-center">
      <h1 className="text-heading-2 font-semibold text-foreground">Login</h1>
      <p className="max-w-md text-paragraph-regular text-muted-foreground">
        Sign-in UI will live here. The auth store already syncs with Supabase
        when a session exists.
      </p>
      <Button
        type="button"
        variant="secondary"
        nativeButton={false}
        render={<Link href={HOME_PAGE} />}
      >
        Back to home
      </Button>
    </div>
  );
}
