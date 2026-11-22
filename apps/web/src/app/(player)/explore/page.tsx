import { LiveEventsShowcase } from "@/components/events/live-events-showcase";
import { PlayerLayout } from "@/components/layout/player-layout";

export default function ExplorePage() {
  return (
    <PlayerLayout activeHref="/explore">
      <LiveEventsShowcase />
    </PlayerLayout>
  );
}
