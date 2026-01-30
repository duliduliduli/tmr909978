import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function CustomerMapPage() {
  return (
    <AppShell title="Find Detailers">
      <div className="h-full w-full">
        <TumaroMap className="h-full w-full" />
      </div>
    </AppShell>
  );
}