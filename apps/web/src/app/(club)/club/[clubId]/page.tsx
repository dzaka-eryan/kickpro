import { ClubDashboardClient } from "@/components/club/club-dashboard-client";

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  return <ClubDashboardClient clubId={clubId} />;
}
