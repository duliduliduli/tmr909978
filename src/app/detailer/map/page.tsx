import { AppShell } from "@/components/AppShell";
import { DetailerMap } from "@/components/map/DetailerMap";

export default function DetailerMapPage() {
  return (
    <AppShell title="Your Territory" fullWidth={true}>
      <div
        className="w-full h-full"
        style={{
          height: 'calc(100vh - 80px)',
          minHeight: 'calc(100vh - 160px)'
        }}
      >
        <DetailerMap className="w-full h-full" />
      </div>
    </AppShell>
  );
}
