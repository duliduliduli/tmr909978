import { AppShell } from "@/components/AppShell";
import { TumaroMap } from "@/components/map/TumaroMap";

export default function DetailerMapPage() {
  return (
    <AppShell title="Your Territory" fullWidth={true}>
      {/* Service area indicator */}
      <div className="absolute top-4 left-4 z-10 bg-teal-50 border border-teal-200 rounded-lg p-3 shadow-lg max-w-sm">
        <h3 className="font-semibold text-teal-800 mb-1">Your Service Area</h3>
        <p className="text-sm text-teal-700">You're highlighted in teal • Customer requests appear as pins</p>
      </div>
      
      {/* Full-width map container - same as customer map */}
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