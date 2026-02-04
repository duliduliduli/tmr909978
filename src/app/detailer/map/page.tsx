import { AppShell } from "@/components/AppShell";
import { DetailerMap } from "@/components/map/DetailerMap";

export default function DetailerMapPage() {
  return (
    <AppShell title="Your Territory" fullWidth={true}>
      <DetailerMap className="w-full h-full" />
    </AppShell>
  );
}
