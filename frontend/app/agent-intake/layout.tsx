import IntakeLayout from "@/components/IntakeLayout";

export default function IntakeRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IntakeLayout>{children}</IntakeLayout>;
}
