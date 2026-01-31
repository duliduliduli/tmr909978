import { AppShell } from "@/components/AppShell";
import { CustomerAppointments } from "@/components/customer/CustomerAppointments";

export default function CustomerAppointmentsPage() {
  return (
    <AppShell title="Appointments">
      <CustomerAppointments />
    </AppShell>
  );
}