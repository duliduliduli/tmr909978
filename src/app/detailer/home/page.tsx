import { AppShell } from "@/components/AppShell";
import { DetailerHome } from "@/components/detailer/DetailerHome";

export default function DetailerHomePage() {
  return (
    <AppShell title="Dashboard">
      <DetailerHome />
    </AppShell>
  );
}