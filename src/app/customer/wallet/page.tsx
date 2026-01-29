import { AppShell } from "@/components/AppShell";
import { CustomerWallet } from "@/components/customer/CustomerWallet";

export default function CustomerWalletPage() {
  return (
    <AppShell title="Wallet">
      <CustomerWallet />
    </AppShell>
  );
}