import IntakeLayout from "@/app/agent-intake/IntakeLayout";

export default function IntakeRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IntakeLayout>{children}</IntakeLayout>;
}
