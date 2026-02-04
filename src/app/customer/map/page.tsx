import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function CustomerMapPage() {
  return (
    <AppShell title="Find Detailers" fullWidth={true}>
      <TumaroMap className="w-full h-full" />
    </AppShell>
  );
}