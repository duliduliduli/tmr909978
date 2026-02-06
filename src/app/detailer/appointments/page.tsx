import { AppShell } from "@/components/AppShell";
import { CustomerAppointments } from "@/components/customer/CustomerAppointments";

// Note: CustomerAppointments is role-aware and renders differently for detailers.
// It uses getMyAppointments() which filters by activeDetailerId when role === 'detailer'.
export default function DetailerAppointmentsPage() {
  return (
    <AppShell title="Appointments">
      <CustomerAppointments />
    </AppShell>
  );
}
