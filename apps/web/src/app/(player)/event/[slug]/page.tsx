import * as React from "react";
import { resolveCommunityBySlug } from "@/data/communities";
import { PlayerLayout } from "@/components/layout/player-layout";
import { CommunityInvitationClient } from "@/components/invitation/community-invitation-client";

export default async function EventInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = resolveCommunityBySlug(slug);

  return (
    <PlayerLayout activeHref="/explore">
      <React.Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100" />}>
        <CommunityInvitationClient initialCommunity={community} />
      </React.Suspense>
    </PlayerLayout>
  );
}
