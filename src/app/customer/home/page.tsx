import { AppShell } from "@/components/AppShell";
import { CustomerHome } from "@/components/customer/CustomerHome";

export default function CustomerHomePage() {
  return (
    <AppShell title="Home">
      <CustomerHome />
    </AppShell>
  );
}