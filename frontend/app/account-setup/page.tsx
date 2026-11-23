import { AccountSetupForm } from "@/app/account-setup/components";

/** Invited (non-primary) agent account setup UI. No API / auth calls yet. */
export default async function AccountSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; agency?: string }>;
}) {
  const { email, agency } = await searchParams;
  return <AccountSetupForm email={email} agencyName={agency} />;
}
