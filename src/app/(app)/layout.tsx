import { AppShell } from "@/components/layout/app-shell";

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
