import { LiveEventsShowcase } from "@/components/events/live-events-showcase";
import { PlayerLayout } from "@/components/layout/player-layout";

export default function MabarPage() {
  return (
    <PlayerLayout activeHref="/explore">
      <LiveEventsShowcase />
    </PlayerLayout>
  );
}
