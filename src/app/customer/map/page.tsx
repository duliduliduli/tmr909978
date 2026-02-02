import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function CustomerMapPage() {
  return (
    <AppShell title="Find Detailers" fullWidth={true}>
      {/* Full-width map container */}
      <div 
        className="w-full h-full" 
        style={{
          // Desktop: Fill remaining space after sidebar and header
          height: 'calc(100vh - 80px)',
          // Mobile: Fill space between header and bottom nav
          minHeight: 'calc(100vh - 160px)'
        }}
      >
        <TumaroMap className="w-full h-full" />
      </div>
    </AppShell>
  );
}