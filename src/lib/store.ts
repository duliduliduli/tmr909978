"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "detailer";

interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface SavedAddress {
  id: string;
  customerId: string;
  label?: string; // e.g., "Home", "Work", "Mom's House"
  street: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
  isDefault?: boolean;
  createdAt: string;
  lastUsed?: string;
}

export type BodyType = 'car' | 'van' | 'truck' | 'suv';

export interface BodyTypeMultipliers {
  car: number;
  van: number;
  truck: number;
  suv: number;
}

export const DEFAULT_BODY_TYPE_MULTIPLIERS: BodyTypeMultipliers = {
  car: 1.0,
  van: 1.1,
  truck: 1.15,
  suv: 1.1,
};

export function calculateAdjustedPrice(
  basePrice: number,
  bodyType: BodyType,
  multipliers: BodyTypeMultipliers,
  luxuryCare: boolean,
  luxurySurchargePercent: number
): number {
  let price = basePrice * multipliers[bodyType];
  if (luxuryCare) {
    price *= (1 + luxurySurchargePercent / 100);
  }
  return Math.round(price * 100) / 100;
}

export interface Service {
  id: string;
  detailerId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category?: string; // e.g., "Exterior", "Interior", "Premium"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bodyTypeMultipliers: BodyTypeMultipliers;
  luxuryCareSurchargePercent: number;
}

export interface Rating {
  id: string;
  appointmentId: string;
  customerId: string;
  detailerId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
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
  latitude: number;
  longitude: number;
  addressId?: string;
  phone: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  bookedAt: string;
  notes?: string;
  completedAt?: string;
  rating?: Rating;
  awaitingRating?: boolean; // True when business marks complete, awaiting customer rating
}

interface DetailerQRCode {
  detailerId: string;
  qrCodeData: string; // Base64 encoded QR code image
  businessUrl: string; // URL the QR code points to
  generatedAt: string;
}

export interface ChatMessage {
  text: string;
  fromMe: boolean;
  timestamp: string;
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  activeCustomerId: string;
  activeDetailerId: string;
  setActiveCustomerId: (id: string) => void;
  setActiveDetailerId: (id: string) => void;
  switchToTestAccount: () => void;
  // Chat persistence
  chatLogs: Record<string, ChatMessage[]>; // keyed by "{detailerId}_{customerId}"
  addChatMessage: (detailerId: string, customerId: string, message: ChatMessage) => void;
  getChatMessages: (detailerId: string, customerId: string) => ChatMessage[];
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
  getTodaysAppointments: (detailerId: string) => Appointment[];
  // Favorites storage
  favoriteDetailers: string[];
  addFavoriteDetailer: (detailerId: string) => void;
  removeFavoriteDetailer: (detailerId: string) => void;
  toggleFavoriteDetailer: (detailerId: string) => void;
  isFavoriteDetailer: (detailerId: string) => boolean;
  // Saved addresses storage
  savedAddresses: SavedAddress[];
  addSavedAddress: (address: Omit<SavedAddress, 'id' | 'createdAt'>) => void;
  updateSavedAddress: (id: string, updates: Partial<SavedAddress>) => void;
  deleteSavedAddress: (id: string) => void;
  getSavedAddressesByCustomer: (customerId: string) => SavedAddress[];
  setDefaultAddress: (id: string) => void;
  updateAddressLastUsed: (id: string) => void;
  // Ratings storage
  ratings: Rating[];
  markAppointmentCompleted: (appointmentId: string) => void;
  addRating: (appointmentId: string, rating: number, comment?: string) => void;
  getDetailerAverageRating: (detailerId: string) => number;
  getAppointmentsAwaitingRating: (customerId: string) => Appointment[];
  dismissRatingPrompt: (appointmentId: string) => void;
  // Service management
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  getServicesByDetailer: (detailerId: string) => Service[];
  getActiveServicesByDetailer: (detailerId: string) => Service[];
  // QR Code management
  detailerQRCodes: DetailerQRCode[];
  generateQRCode: (detailerId: string, businessName: string) => Promise<void>;
  getQRCodeByDetailer: (detailerId: string) => DetailerQRCode | undefined;
}

// Helper to get date strings relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};
const todayStr = getRelativeDate(0);

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
      // Chat persistence
      chatLogs: {},
      addChatMessage: (detailerId, customerId, message) => set((state) => {
        const key = `${detailerId}_${customerId}`;
        return {
          chatLogs: {
            ...state.chatLogs,
            [key]: [...(state.chatLogs[key] || []), message],
          }
        };
      }),
      getChatMessages: (detailerId, customerId) => {
        const state = useAppStore.getState();
        return state.chatLogs[`${detailerId}_${customerId}`] || [];
      },
      // Location persistence
      userLocation: null,
      setUserLocation: (userLocation) => set({ userLocation }),
      mapViewState: null,
      setMapViewState: (mapViewState) => set({ mapViewState }),
      // Appointments storage
      appointments: [
        // Today's appointments for detailer "det_1" (Premium Auto Spa)
        {
          id: "apt_today_1",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s1",
          serviceName: "Basic Wash",
          serviceDescription: "Exterior wash & dry",
          price: 25,
          scheduledDate: todayStr,
          scheduledTime: "10:00 AM",
          duration: 30,
          address: "123 Main St, Los Angeles, CA 90012",
          latitude: 34.0522,
          longitude: -118.2437,
          phone: "(555) 111-2233",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "White Tesla Model 3, parked in driveway"
        },
        {
          id: "apt_today_2",
          customerId: "cust_2",
          customerName: "Maria Garcia",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: todayStr,
          scheduledTime: "11:30 AM",
          duration: 180,
          address: "456 Wilshire Blvd, Beverly Hills, CA 90212",
          latitude: 34.0656,
          longitude: -118.3976,
          phone: "(555) 444-5566",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Black BMW X5, garage code is 4421"
        },
        {
          id: "apt_today_3",
          customerId: "cust_3",
          customerName: "David Park",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s3",
          serviceName: "Paint Correction",
          serviceDescription: "Paint correction & ceramic coating",
          price: 300,
          scheduledDate: todayStr,
          scheduledTime: "1:00 PM",
          duration: 240,
          address: "789 Sunset Blvd, West Hollywood, CA 90069",
          latitude: 34.0901,
          longitude: -118.3868,
          phone: "(555) 777-8899",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Red Porsche 911, please be extra careful with the paint"
        },
        {
          id: "apt_today_4",
          customerId: "cust_4",
          customerName: "Lisa Chen",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s1",
          serviceName: "Basic Wash",
          serviceDescription: "Exterior wash & dry",
          price: 25,
          scheduledDate: todayStr,
          scheduledTime: "2:30 PM",
          duration: 30,
          address: "321 Melrose Ave, Los Angeles, CA 90048",
          latitude: 34.0838,
          longitude: -118.3614,
          phone: "(555) 222-3344",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "apt_today_5",
          customerId: "cust_5",
          customerName: "Ryan Mitchell",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: todayStr,
          scheduledTime: "4:00 PM",
          duration: 150,
          address: "900 N La Cienega Blvd, West Hollywood, CA 90069",
          latitude: 34.0855,
          longitude: -118.3782,
          phone: "(555) 333-4455",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          notes: "Silver Mercedes GLE, apartment complex - buzz #204"
        },
        {
          id: "apt_today_6",
          customerId: "cust_6",
          customerName: "Samantha Brooks",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s4",
          serviceName: "Interior Clean",
          serviceDescription: "Deep interior vacuum, wipe-down & conditioning",
          price: 75,
          scheduledDate: todayStr,
          scheduledTime: "5:30 PM",
          duration: 90,
          address: "1420 N Highland Ave, Hollywood, CA 90028",
          latitude: 34.0985,
          longitude: -118.3385,
          phone: "(555) 666-7788",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          notes: "Blue Range Rover Sport, pet hair removal needed"
        },
        {
          id: "apt_today_7",
          customerId: "cust_7",
          customerName: "Trevor Nguyen",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s1",
          serviceName: "Basic Wash",
          serviceDescription: "Exterior wash & dry",
          price: 25,
          scheduledDate: todayStr,
          scheduledTime: "7:00 PM",
          duration: 30,
          address: "2200 W Olympic Blvd, Los Angeles, CA 90006",
          latitude: 34.0488,
          longitude: -118.2811,
          phone: "(555) 888-9900",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          notes: "Gray Honda Civic, street parking near the coffee shop"
        },
        {
          id: "apt_today_8",
          customerId: "cust_8",
          customerName: "Angela Rivera",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: todayStr,
          scheduledTime: "8:30 PM",
          duration: 180,
          address: "3000 Los Feliz Blvd, Los Angeles, CA 90039",
          latitude: 34.1189,
          longitude: -118.2637,
          phone: "(555) 112-2334",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          notes: "White Audi Q7, please text on arrival"
        },
        // Upcoming appointments for det_1 (Premium Auto Spa) on future days
        {
          id: "apt_upcoming_det1_1",
          customerId: "cust_2",
          customerName: "Maria Garcia",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: getRelativeDate(1),
          scheduledTime: "10:00 AM",
          duration: 180,
          address: "456 Wilshire Blvd, Beverly Hills, CA 90212",
          latitude: 34.0656,
          longitude: -118.3976,
          phone: "(555) 444-5566",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Black BMW X5, recurring weekly detail"
        },
        {
          id: "apt_upcoming_det1_2",
          customerId: "cust_3",
          customerName: "David Park",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s1",
          serviceName: "Basic Wash",
          serviceDescription: "Exterior wash & dry",
          price: 25,
          scheduledDate: getRelativeDate(2),
          scheduledTime: "9:00 AM",
          duration: 30,
          address: "789 Sunset Blvd, West Hollywood, CA 90069",
          latitude: 34.0901,
          longitude: -118.3868,
          phone: "(555) 777-8899",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          notes: "Red Porsche 911"
        },
        {
          id: "apt_upcoming_det1_3",
          customerId: "cust_4",
          customerName: "Lisa Chen",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s3",
          serviceName: "Paint Correction",
          serviceDescription: "Paint correction & ceramic coating",
          price: 300,
          scheduledDate: getRelativeDate(3),
          scheduledTime: "11:00 AM",
          duration: 240,
          address: "321 Melrose Ave, Los Angeles, CA 90048",
          latitude: 34.0838,
          longitude: -118.3614,
          phone: "(555) 222-3344",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "apt_upcoming_det1_4",
          customerId: "cust_5",
          customerName: "Ryan Mitchell",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: getRelativeDate(5),
          scheduledTime: "2:00 PM",
          duration: 150,
          address: "900 N La Cienega Blvd, West Hollywood, CA 90069",
          latitude: 34.0855,
          longitude: -118.3782,
          phone: "(555) 333-4455",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          notes: "Silver Mercedes GLE"
        },
        // Sample upcoming appointment (future day)
        {
          id: "apt_sample_1",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_6",
          detailerName: "Emma Thompson",
          businessName: "Test Drive Detailing",
          serviceId: "s12",
          serviceName: "FREE Test Service",
          serviceDescription: "Complimentary test service for functionality testing",
          price: 0,
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "2:00 PM",
          duration: 30,
          address: "123 Main St, Los Angeles, CA 90210",
          latitude: 34.0522,
          longitude: -118.2437,
          phone: "(555) 789-0123",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          notes: "This is a free test service to try out the app functionality"
        },
        // Sample past appointment
        {
          id: "apt_sample_2",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_1",
          detailerName: "Alex Johnson",
          businessName: "Premium Auto Spa",
          serviceId: "s2",
          serviceName: "Full Detail",
          serviceDescription: "Interior & exterior detail",
          price: 120,
          scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "10:00 AM",
          duration: 180,
          address: "456 Oak Avenue, Beverly Hills, CA 90210",
          latitude: 34.0736,
          longitude: -118.4004,
          phone: "(555) 234-5678",
          status: "completed" as const,
          bookedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // Additional upcoming appointments
        {
          id: "apt_sample_3",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_3",
          detailerName: "Carlos Martinez",
          businessName: "Premium Auto Care",
          serviceId: "s5",
          serviceName: "Express Wash",
          serviceDescription: "Quick exterior wash and dry",
          price: 35,
          scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "9:30 AM",
          duration: 45,
          address: "789 Sunset Blvd, West Hollywood, CA 90069",
          latitude: 34.0901,
          longitude: -118.3868,
          phone: "(555) 456-7890",
          status: "scheduled" as const,
          bookedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          notes: "Please use eco-friendly products if available"
        },
        {
          id: "apt_sample_4",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_2",
          detailerName: "Sarah Wilson",
          businessName: "Elite Detailing Co",
          serviceId: "s8",
          serviceName: "Interior Deep Clean",
          serviceDescription: "Steam cleaning and conditioning",
          price: 85,
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "3:15 PM",
          duration: 120,
          address: "321 Melrose Ave, Los Angeles, CA 90048",
          latitude: 34.0838,
          longitude: -118.3614,
          phone: "(555) 987-6543",
          status: "confirmed" as const,
          bookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // Additional past appointments
        {
          id: "apt_sample_5",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_4",
          detailerName: "Mike Chen",
          businessName: "Speedy Clean",
          serviceId: "s3",
          serviceName: "Basic Wash",
          serviceDescription: "Standard exterior wash",
          price: 25,
          scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "11:45 AM",
          duration: 30,
          address: "555 Hollywood Blvd, Hollywood, CA 90028",
          latitude: 34.1017,
          longitude: -118.3409,
          phone: "(555) 321-0987",
          status: "completed" as const,
          bookedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
          notes: "Great service, very professional"
        },
        {
          id: "apt_sample_6",
          customerId: "cust_1",
          customerName: "John Smith",
          detailerId: "det_5",
          detailerName: "Jessica Brown",
          businessName: "Luxury Auto Spa",
          serviceId: "s10",
          serviceName: "Ceramic Coating",
          serviceDescription: "Premium ceramic paint protection",
          price: 350,
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scheduledTime: "1:00 PM",
          duration: 240,
          address: "888 Rodeo Drive, Beverly Hills, CA 90210",
          latitude: 34.0700,
          longitude: -118.4004,
          phone: "(555) 654-3210",
          status: "cancelled" as const,
          bookedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
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
      getTodaysAppointments: (detailerId: string) => {
        const state = useAppStore.getState();
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return state.appointments
          .filter(apt => {
            const isToday = apt.scheduledDate === today;
            const isForDetailer = apt.detailerId === detailerId;
            const isActive = apt.status !== 'completed' && apt.status !== 'cancelled';
            const appointmentTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
            const isUpcoming = appointmentTime > now;
            return isToday && isForDetailer && isActive && isUpcoming;
          })
          .sort((a, b) => {
            const timeA = new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime();
            const timeB = new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime();
            return timeA - timeB;
          });
      },
      // Favorites functionality
      favoriteDetailers: [],
      addFavoriteDetailer: (detailerId: string) => set((state) => ({
        favoriteDetailers: [...new Set([...state.favoriteDetailers, detailerId])]
      })),
      removeFavoriteDetailer: (detailerId: string) => set((state) => ({
        favoriteDetailers: state.favoriteDetailers.filter(id => id !== detailerId)
      })),
      toggleFavoriteDetailer: (detailerId: string) => set((state) => {
        const isFavorite = state.favoriteDetailers.includes(detailerId);
        if (isFavorite) {
          return { favoriteDetailers: state.favoriteDetailers.filter(id => id !== detailerId) };
        } else {
          return { favoriteDetailers: [...new Set([...state.favoriteDetailers, detailerId])] };
        }
      }),
      isFavoriteDetailer: (detailerId: string) => {
        const state = useAppStore.getState();
        return state.favoriteDetailers.includes(detailerId);
      },
      // Saved addresses implementation
      savedAddresses: [
        // Sample saved addresses
        {
          id: "addr_1",
          customerId: "cust_1",
          label: "Home",
          street: "123 Main Street",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210",
          latitude: 34.0522,
          longitude: -118.2437,
          fullAddress: "123 Main Street, Los Angeles, CA 90210",
          isDefault: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "addr_2",
          customerId: "cust_1",
          label: "Work",
          street: "456 Business Ave",
          city: "Beverly Hills",
          state: "CA",
          postalCode: "90212",
          latitude: 34.0669,
          longitude: -118.3965,
          fullAddress: "456 Business Ave, Beverly Hills, CA 90212",
          isDefault: false,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      addSavedAddress: (address) => set((state) => {
        const newAddress: SavedAddress = {
          ...address,
          id: `addr_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        return { savedAddresses: [...state.savedAddresses, newAddress] };
      }),
      updateSavedAddress: (id, updates) => set((state) => ({
        savedAddresses: state.savedAddresses.map(addr =>
          addr.id === id ? { ...addr, ...updates } : addr
        )
      })),
      deleteSavedAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.filter(addr => addr.id !== id)
      })),
      getSavedAddressesByCustomer: (customerId) => {
        const state = useAppStore.getState();
        return state.savedAddresses
          .filter(addr => addr.customerId === customerId)
          .sort((a, b) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            if (a.lastUsed && b.lastUsed) {
              return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
            }
            return 0;
          });
      },
      setDefaultAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
      })),
      updateAddressLastUsed: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.map(addr =>
          addr.id === id ? { ...addr, lastUsed: new Date().toISOString() } : addr
        )
      })),
      // Ratings implementation
      ratings: [
        // Sample ratings for demo
        {
          id: "rating_1",
          appointmentId: "apt_sample_2",
          customerId: "cust_1",
          detailerId: "det_1",
          rating: 5,
          comment: "Excellent service! Very professional and thorough.",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      markAppointmentCompleted: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId
            ? { 
                ...apt, 
                status: 'completed' as const, 
                completedAt: new Date().toISOString(),
                awaitingRating: true 
              }
            : apt
        )
      })),
      addRating: (appointmentId, rating, comment) => set((state) => {
        const appointment = state.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return state;
        
        const newRating: Rating = {
          id: `rating_${Date.now()}`,
          appointmentId,
          customerId: appointment.customerId,
          detailerId: appointment.detailerId,
          rating,
          comment,
          createdAt: new Date().toISOString()
        };
        
        return {
          ratings: [...state.ratings, newRating],
          appointments: state.appointments.map(apt =>
            apt.id === appointmentId
              ? { ...apt, rating: newRating, awaitingRating: false }
              : apt
          )
        };
      }),
      getDetailerAverageRating: (detailerId) => {
        const state = useAppStore.getState();
        const detailerRatings = state.ratings.filter(r => r.detailerId === detailerId);
        if (detailerRatings.length === 0) return 4.5; // Default rating for demo
        const sum = detailerRatings.reduce((acc, r) => acc + r.rating, 0);
        return sum / detailerRatings.length;
      },
      getAppointmentsAwaitingRating: (customerId) => {
        const state = useAppStore.getState();
        return state.appointments.filter(
          apt => apt.customerId === customerId && apt.awaitingRating === true
        );
      },
      dismissRatingPrompt: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, awaitingRating: false }
            : apt
        )
      })),
      // Service management implementation
      services: [
        // Sample services for demo purposes
        {
          id: "svc_1",
          detailerId: "det_1",
          name: "Express Wash",
          description: "Quick exterior wash and dry - perfect for maintaining your car's shine",
          price: 25,
          duration: 30,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 20,
        },
        {
          id: "svc_2",
          detailerId: "det_1",
          name: "Interior Deep Clean",
          description: "Complete interior vacuum, wipe down, and sanitization",
          price: 45,
          duration: 60,
          category: "Interior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 20,
        },
        {
          id: "svc_3",
          detailerId: "det_1",
          name: "Premium Package",
          description: "Full exterior wash, interior deep clean, wax, and tire shine",
          price: 85,
          duration: 120,
          category: "Premium",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 25,
        },
        // det_2 - Maria's Mobile Detail
        {
          id: "svc_4",
          detailerId: "det_2",
          name: "Interior Deep Clean",
          description: "Full interior vacuum, steam clean, wipe down, and sanitization",
          price: 40,
          duration: 60,
          category: "Interior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.15, truck: 1.2, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
        },
        {
          id: "svc_5",
          detailerId: "det_2",
          name: "Paint Protection",
          description: "Professional paint protection film and sealant application",
          price: 95,
          duration: 150,
          category: "Premium",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.2, truck: 1.25, suv: 1.15 },
          luxuryCareSurchargePercent: 20,
        },
        {
          id: "svc_6",
          detailerId: "det_2",
          name: "Express Wash",
          description: "Quick exterior wash and hand dry",
          price: 20,
          duration: 25,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
        },
        // det_3 - Elite Auto Spa
        {
          id: "svc_7",
          detailerId: "det_3",
          name: "Full Service Detail",
          description: "Complete interior and exterior detailing with clay bar treatment",
          price: 75,
          duration: 120,
          category: "Premium",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.15, truck: 1.2, suv: 1.1 },
          luxuryCareSurchargePercent: 20,
        },
        {
          id: "svc_8",
          detailerId: "det_3",
          name: "Wax & Polish",
          description: "Hand wax and polish for a deep, lasting shine",
          price: 55,
          duration: 90,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
        },
        {
          id: "svc_9",
          detailerId: "det_3",
          name: "Express Wash",
          description: "Quick exterior wash and towel dry",
          price: 22,
          duration: 20,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.05 },
          luxuryCareSurchargePercent: 10,
        },
        // det_4 - Quick Shine Mobile
        {
          id: "svc_10",
          detailerId: "det_4",
          name: "Express Wash",
          description: "Fast exterior rinse, soap, and dry",
          price: 15,
          duration: 15,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.1, suv: 1.05 },
          luxuryCareSurchargePercent: 10,
        },
        {
          id: "svc_11",
          detailerId: "det_4",
          name: "Interior Vacuum",
          description: "Thorough interior vacuum and wipe down of surfaces",
          price: 20,
          duration: 25,
          category: "Interior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.15, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 10,
        },
        {
          id: "svc_12",
          detailerId: "det_4",
          name: "Basic Detail",
          description: "Exterior wash plus interior vacuum and dash wipe",
          price: 35,
          duration: 45,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
        },
        // det_5 - Luxury Detail Co.
        {
          id: "svc_13",
          detailerId: "det_5",
          name: "Luxury Full Detail",
          description: "White-glove full detail service for luxury and exotic vehicles",
          price: 150,
          duration: 180,
          category: "Premium",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.2, truck: 1.25, suv: 1.15 },
          luxuryCareSurchargePercent: 30,
        },
        {
          id: "svc_14",
          detailerId: "det_5",
          name: "Leather Treatment",
          description: "Deep leather cleaning, conditioning, and UV protection",
          price: 85,
          duration: 90,
          category: "Interior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.1, suv: 1.1 },
          luxuryCareSurchargePercent: 25,
        },
        {
          id: "svc_15",
          detailerId: "det_5",
          name: "Premium Wash",
          description: "Hand wash with premium products and tire shine",
          price: 45,
          duration: 45,
          category: "Exterior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 20,
        },
      ],
      addService: (service) => set((state) => {
        const newService: Service = {
          bodyTypeMultipliers: { ...DEFAULT_BODY_TYPE_MULTIPLIERS },
          luxuryCareSurchargePercent: 0,
          ...service,
          id: `svc_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { services: [...state.services, newService] };
      }),
      updateService: (id, updates) => set((state) => ({
        services: state.services.map(service =>
          service.id === id
            ? { ...service, ...updates, updatedAt: new Date().toISOString() }
            : service
        )
      })),
      deleteService: (id) => set((state) => ({
        services: state.services.filter(service => service.id !== id)
      })),
      toggleServiceActive: (id) => set((state) => ({
        services: state.services.map(service =>
          service.id === id
            ? { ...service, isActive: !service.isActive, updatedAt: new Date().toISOString() }
            : service
        )
      })),
      getServicesByDetailer: (detailerId: string) => {
        const state = useAppStore.getState();
        return state.services.filter(service => service.detailerId === detailerId);
      },
      getActiveServicesByDetailer: (detailerId: string) => {
        const state = useAppStore.getState();
        return state.services.filter(
          service => service.detailerId === detailerId && service.isActive
        );
      },
      // QR Code implementation
      detailerQRCodes: [],
      generateQRCode: async (detailerId: string, businessName: string) => {
        // Dynamic import to avoid SSR issues
        const QRCode = (await import('qrcode')).default;
        
        // Generate URL for the detailer's booking page
        const businessUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://tumaro.app'}/book/${detailerId}`;
        
        // Generate QR code as base64 data URL
        const qrCodeData = await QRCode.toDataURL(businessUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        const newQRCode: DetailerQRCode = {
          detailerId,
          qrCodeData,
          businessUrl,
          generatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          detailerQRCodes: [...state.detailerQRCodes.filter(qr => qr.detailerId !== detailerId), newQRCode]
        }));
      },
      getQRCodeByDetailer: (detailerId: string) => {
        const state = useAppStore.getState();
        return state.detailerQRCodes.find(qr => qr.detailerId === detailerId);
      },
    }),
    { name: "app_state_v11" }
  )
);