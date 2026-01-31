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
  switchToTestAccount: () => void;
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
      switchToTestAccount: () => set((state) => ({
        activeCustomerId: state.activeCustomerId === "cust_1" ? "cust_2" : "cust_1"
      })),
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
        },
        // Additional upcoming appointments
        {
          id: "apt_sample_3",
          customerId: "cust_1", 
          detailerId: "det_3",
          detailerName: "Carlos Martinez",
          businessName: "Premium Auto Care",
          serviceId: "s5",
          serviceName: "Express Wash",
          serviceDescription: "Quick exterior wash and dry",
          price: 35,
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
          scheduledTime: "9:30 AM", 
          duration: 45,
          address: "789 Sunset Blvd, West Hollywood, CA 90069",
          phone: "(555) 456-7890",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          notes: "Please use eco-friendly products if available"
        },
        {
          id: "apt_sample_4",
          customerId: "cust_1",
          detailerId: "det_2", 
          detailerName: "Sarah Wilson",
          businessName: "Elite Detailing Co",
          serviceId: "s8",
          serviceName: "Interior Deep Clean",
          serviceDescription: "Steam cleaning and conditioning",
          price: 85,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
          scheduledTime: "3:15 PM",
          duration: 120,
          address: "321 Melrose Ave, Los Angeles, CA 90048", 
          phone: "(555) 987-6543",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
        // Additional past appointments
        {
          id: "apt_sample_5",
          customerId: "cust_1",
          detailerId: "det_4",
          detailerName: "Mike Chen", 
          businessName: "Speedy Clean",
          serviceId: "s3",
          serviceName: "Basic Wash",
          serviceDescription: "Standard exterior wash",
          price: 25,
          scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
          scheduledTime: "11:45 AM",
          duration: 30,
          address: "555 Hollywood Blvd, Hollywood, CA 90028",
          phone: "(555) 321-0987", 
          status: "completed" as const,
          bookedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
          notes: "Great service, very professional"
        },
        {
          id: "apt_sample_6", 
          customerId: "cust_1",
          detailerId: "det_5",
          detailerName: "Jessica Brown",
          businessName: "Luxury Auto Spa",
          serviceId: "s10", 
          serviceName: "Ceramic Coating",
          serviceDescription: "Premium ceramic paint protection",
          price: 350,
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          scheduledTime: "1:00 PM", 
          duration: 240,
          address: "888 Rodeo Drive, Beverly Hills, CA 90210",
          phone: "(555) 654-3210",
          status: "cancelled" as const,
          bookedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
          notes: "Cancelled due to weather conditions"
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