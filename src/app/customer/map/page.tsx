import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function CustomerMapPage() {
  return (
    <AppShell title="Find Detailers" fullWidth={true}>
      {/* Full-width map container */}
      <div
        className="w-full"
        style={{
          // Fill the available space from AppShell layout
          height: '100%',
        }}
      >
        <TumaroMap className="w-full h-full" />
      </div>
    </AppShell>
  );
}