import { AppShell } from "@/components/AppShell";
import { CustomerAccount } from "@/components/customer/CustomerAccount";

export default function CustomerAccountPage() {
  return (
    <AppShell title="Account">
      <CustomerAccount />
    </AppShell>
  );
}