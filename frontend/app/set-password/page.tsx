import SetPasswordForm from "@/app/set-password/components/SetPasswordForm";

/** Primary-contact set-password UI only — no API / auth calls yet. */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <SetPasswordForm email={email} />;
}
