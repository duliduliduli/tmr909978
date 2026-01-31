"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "detailer";

interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  detailerId: string;
  detailerName: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  price: number;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  address: string;
  phone: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  bookedAt: string;
  notes?: string;
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  activeCustomerId: string;
  activeDetailerId: string;
  setActiveCustomerId: (id: string) => void;
  setActiveDetailerId: (id: string) => void;
  // Location persistence
  userLocation: [number, number] | null;
  setUserLocation: (location: [number, number] | null) => void;
  mapViewState: MapViewState | null;
  setMapViewState: (viewState: MapViewState) => void;
  // Appointments storage
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  getUpcomingAppointments: () => Appointment[];
  getPastAppointments: () => Appointment[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "customer",
      setRole: (role) => set({ role }),
      activeCustomerId: "cust_1",
      activeDetailerId: "det_1", 
      setActiveCustomerId: (id) => set({ activeCustomerId: id }),
      setActiveDetailerId: (id) => set({ activeDetailerId: id }),
      // Location persistence
      userLocation: null,
      setUserLocation: (userLocation) => set({ userLocation }),
      mapViewState: null,
      setMapViewState: (mapViewState) => set({ mapViewState }),
      // Appointments storage
      appointments: [
        // Sample upcoming appointment
        {
          id: "apt_sample_1",
          customerId: "cust_1",
          detailerId: "det_6",
          detailerName: "Emma Thompson",
          businessName: "Test Drive Detailing",
          serviceId: "s12",
          serviceName: "FREE Test Service",
          serviceDescription: "Complimentary test service for functionality testing",
          price: 0,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          scheduledTime: "2:00 PM",
          duration: 30,
          address: "123 Main St, Los Angeles, CA 90210",
          phone: "(555) 789-0123",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          notes: "This is a free test service to try out the app functionality"
        },
        // Sample past appointment
        {
          id: "apt_sample_2", 
          customerId: "cust_1",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Mobile Shine Pro",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
          scheduledTime: "10:00 AM",
          duration: 180,
          address: "456 Oak Avenue, Beverly Hills, CA 90210",
          phone: "(555) 234-5678",
          status: "completed" as const,
          bookedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        }
      ],
      addAppointment: (appointment) => set((state) => ({ 
        appointments: [...state.appointments, appointment] 
      })),
      updateAppointmentStatus: (appointmentId, status) => set((state) => ({
        appointments: state.appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      })),
      getUpcomingAppointments: () => {
        const state = useAppStore.getState();
        const now = new Date();
        return state.appointments.filter(apt => {
          const appointmentDate = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
          return appointmentDate > now && apt.status !== 'completed' && apt.status !== 'cancelled';
        });
      },
      getPastAppointments: () => {
        const state = useAppStore.getState();
        const now = new Date();
        return state.appointments.filter(apt => {
          const appointmentDate = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
          return appointmentDate <= now || apt.status === 'completed' || apt.status === 'cancelled';
        });
      },
    }),
    { name: "app_state_v3" }
  )
);