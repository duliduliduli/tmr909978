import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function CustomerMapPage() {
  return (
    <AppShell title="Find Detailers">
      <div className="h-[calc(100vh-8rem)]">
        <TumaroMap />
      </div>
    </AppShell>
  );
}