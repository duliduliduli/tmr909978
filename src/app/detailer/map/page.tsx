import { AppShell } from "@/components/AppShell";
import { CustomerMap } from "@/components/customer/CustomerMap"; // Reuse customer map for now

export default function DetailerMapPage() {
  return (
    <AppShell title="Your Territory">
      <div className="space-y-4">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-semibold text-teal-800 mb-1">Your Service Area</h3>
          <p className="text-sm text-teal-700">You're highlighted in teal on the map below</p>
        </div>
        <CustomerMap />
      </div>
    </AppShell>
  );
}