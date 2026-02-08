"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "detailer";
export type Language = "en" | "es";

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
  // Arrival tracking
  isArrived: boolean;
  arrivedAt?: string;
  // Reschedule tracking
  originalScheduledDate?: string;
  originalScheduledTime?: string;
  rescheduleCount: number;
  lastRescheduledAt?: string;
  rescheduleReason?: string;
  // Missed tracking
  isMissed: boolean;
  missedAt?: string;
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

export interface Conversation {
  id: string;
  participantId: string; // detailerId if user is customer, customerId if user is detailer
  participantName: string;
  participantImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isPinned: boolean;
}

// ============================================
// NEW: Account & Availability System Interfaces
// ============================================

// Working hours per day
export interface DayHours {
  open: string;  // "08:00" format (24-hour)
  close: string;
  closed: boolean;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface LunchBreak {
  enabled: boolean;
  start: string;  // "12:00"
  end: string;    // "13:00"
}

// Detailer availability configuration
export interface DetailerAvailabilityConfig {
  detailerId: string;
  workingHours: WorkingHours;
  lunchBreak: LunchBreak;
  bufferMinutes: number;      // 15 min default
  travelSpeedMph: number;     // 25 mph default (city driving)
}

// Account profile (for customers and detailers)
export interface AccountProfile {
  id: string;
  type: 'customer' | 'detailer';
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  // Detailer-specific
  businessName?: string;
}

// Authenticated user from Clerk + DB sync
export interface AuthUser {
  userId: string;
  customerProfileId: string | null;
  providerProfileId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  phone: string | null;
}

// Availability slot result
export interface AvailabilitySlot {
  startTime: string;  // "HH:MM" format
  endTime: string;
  available: boolean;
  reason?: 'booked' | 'lunch' | 'travel' | 'closed' | 'buffer';
}

// Enhanced Conversation for bidirectional messaging
export interface BidirectionalConversation {
  id: string;                 // Format: "{detailerId}_{customerId}"
  detailerId: string;
  customerId: string;
  detailerName: string;
  customerName: string;
  detailerImage?: string;
  customerImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  detailerUnread: number;
  customerUnread: number;
  isPinnedByDetailer: boolean;
  isPinnedByCustomer: boolean;
}

// Enhanced ChatMessage for bidirectional messaging
export interface BidirectionalChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderType: 'customer' | 'detailer';
  timestamp: string;
  read: boolean;
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  activeCustomerId: string;
  activeDetailerId: string;
  setActiveCustomerId: (id: string) => void;
  setActiveDetailerId: (id: string) => void;
  // Auth
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser) => void;
  clearAuthUser: () => void;
  // Chat persistence
  chatLogs: Record<string, ChatMessage[]>; // keyed by "{detailerId}_{customerId}"
  addChatMessage: (detailerId: string, customerId: string, message: ChatMessage) => void;
  getChatMessages: (detailerId: string, customerId: string) => ChatMessage[];
  deleteConversation: (detailerId: string, customerId: string) => void;
  // Conversation management
  conversations: Conversation[];
  getConversations: (userId: string, role: Role) => Conversation[];
  togglePinConversation: (conversationId: string) => void;
  deleteConversationById: (conversationId: string) => void;
  markConversationRead: (conversationId: string) => void;
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
  // Appointment reliability features
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string, reason?: string) => boolean;
  markAppointmentArrived: (appointmentId: string) => void;
  markAppointmentMissed: (appointmentId: string) => void;
  unmarkAppointmentMissed: (appointmentId: string) => void;
  missedAppointmentAlerts: string[];
  dismissMissedAlert: (appointmentId: string) => void;
  addMissedAlert: (appointmentId: string) => void;
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
  // Messages inbox
  showMessages: boolean;
  setShowMessages: (show: boolean) => void;
  // Language/i18n
  language: Language;
  setLanguage: (lang: Language) => void;

  // ============================================
  // Account & Availability System
  // ============================================

  // Account profiles (pre-seeded)
  accounts: AccountProfile[];
  getAccountById: (id: string) => AccountProfile | undefined;
  getCurrentAccount: () => AccountProfile | undefined;

  // Detailer availability configurations
  detailerConfigs: DetailerAvailabilityConfig[];
  getDetailerConfig: (detailerId: string) => DetailerAvailabilityConfig | undefined;
  updateDetailerConfig: (detailerId: string, updates: Partial<DetailerAvailabilityConfig>) => void;

  // Per-customer favorites (replaces favoriteDetailers for multi-account)
  favoritesByCustomer: Record<string, string[]>;
  getMyFavorites: () => string[];

  // Bidirectional messaging
  bidirectionalConversations: BidirectionalConversation[];
  bidirectionalChatLogs: Record<string, BidirectionalChatMessage[]>;
  sendMessage: (conversationId: string, text: string) => void;
  startConversation: (detailerId: string) => string;
  getMyConversations: () => BidirectionalConversation[];
  markBidirectionalConversationRead: (conversationId: string) => void;
  getUnreadCount: () => number;

  // Perspective-aware selectors
  getMyAppointments: () => Appointment[];

  // Availability calculation
  calculateAvailableSlots: (
    detailerId: string,
    date: string,
    serviceDuration: number,
    appointmentLocation?: { lat: number; lng: number }
  ) => AvailabilitySlot[];
}

// ============================================
// Default Working Hours Configurations
// ============================================

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: '08:00', close: '18:00', closed: false },
  tuesday: { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday: { open: '08:00', close: '18:00', closed: false },
  friday: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '09:00', close: '17:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

const DEFAULT_LUNCH_BREAK: LunchBreak = {
  enabled: true,
  start: '12:00',
  end: '13:00',
};

// Accounts are now populated from real auth — no more mock data
const INITIAL_ACCOUNTS: AccountProfile[] = [];

const INITIAL_DETAILER_CONFIGS: DetailerAvailabilityConfig[] = [];

const INITIAL_BIDIRECTIONAL_CONVERSATIONS: BidirectionalConversation[] = [];

const INITIAL_BIDIRECTIONAL_CHAT_LOGS: Record<string, BidirectionalChatMessage[]> = {};

const INITIAL_FAVORITES_BY_CUSTOMER: Record<string, string[]> = {};

// ============================================
// Availability Calculation Helpers
// ============================================

function timeToMinutes(time: string): number {
  // Handle "HH:MM" format
  if (time.includes(':') && !time.includes(' ')) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  // Handle "10:00 AM" format
  const parts = time.split(' ');
  const [timePart, meridiem] = parts;
  const [hours, minutes] = timePart.split(':').map(Number);
  let hour24 = hours;
  if (meridiem === 'PM' && hours !== 12) hour24 += 12;
  if (meridiem === 'AM' && hours === 12) hour24 = 0;
  return hour24 * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getDayOfWeek(dateStr: string): keyof WorkingHours {
  const date = new Date(dateStr);
  const days: (keyof WorkingHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

// Haversine distance calculation (copied from utils.ts for use here)
function calculateDistanceForAvailability(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "customer",
      setRole: (role) => set({ role }),
      activeCustomerId: "",
      activeDetailerId: "",
      setActiveCustomerId: (id) => set({ activeCustomerId: id }),
      setActiveDetailerId: (id) => set({ activeDetailerId: id }),
      // Auth
      authUser: null,
      setAuthUser: (user) => set((state) => ({
        authUser: user,
        activeCustomerId: user.customerProfileId || state.activeCustomerId,
        activeDetailerId: user.providerProfileId || state.activeDetailerId,
      })),
      clearAuthUser: () => set({
        authUser: null,
        activeCustomerId: "",
        activeDetailerId: "",
      }),
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
      deleteConversation: (detailerId, customerId) => set((state) => {
        const key = `${detailerId}_${customerId}`;
        const { [key]: _, ...rest } = state.chatLogs;
        return { chatLogs: rest };
      }),
      // Conversation management
      conversations: [],
      getConversations: (userId, role) => {
        const state = useAppStore.getState();
        if (!userId) return state.conversations;
        return state.conversations.filter(conv => conv.participantId === userId || conv.id?.includes(userId));
      },
      togglePinConversation: (conversationId) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
        ),
      })),
      deleteConversationById: (conversationId) => set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
      })),
      markConversationRead: (conversationId) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        ),
      })),
      // Location persistence
      userLocation: null,
      setUserLocation: (userLocation) => set({ userLocation }),
      mapViewState: null,
      setMapViewState: (mapViewState) => set({ mapViewState }),
      // Appointments storage
      appointments: [],
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
        const myAppointments = state.role === 'customer'
          ? state.appointments.filter(apt => apt.customerId === state.activeCustomerId)
          : state.appointments.filter(apt => apt.detailerId === state.activeDetailerId);
        return myAppointments.filter(apt => {
          const appointmentDate = new Date(`${apt.scheduledDate}T${apt.scheduledTime}`);
          return appointmentDate > now && apt.status !== 'completed' && apt.status !== 'cancelled';
        });
      },
      getPastAppointments: () => {
        const state = useAppStore.getState();
        const now = new Date();
        const myAppointments = state.role === 'customer'
          ? state.appointments.filter(apt => apt.customerId === state.activeCustomerId)
          : state.appointments.filter(apt => apt.detailerId === state.activeDetailerId);
        return myAppointments.filter(apt => {
          const appointmentDate = new Date(`${apt.scheduledDate}T${apt.scheduledTime}`);
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
            return isToday && isForDetailer && isActive;
          })
          .sort((a, b) => {
            const timeA = new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime();
            const timeB = new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime();
            return timeA - timeB;
          });
      },
      // Appointment reliability features
      rescheduleAppointment: (appointmentId, newDate, newTime, reason) => {
        const state = useAppStore.getState();
        const appointment = state.appointments.find(apt => apt.id === appointmentId);
        if (!appointment) return false;

        // Check reschedule limit (max 3)
        if (appointment.rescheduleCount >= 3) return false;

        set((state) => ({
          appointments: state.appointments.map(apt =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  originalScheduledDate: apt.originalScheduledDate || apt.scheduledDate,
                  originalScheduledTime: apt.originalScheduledTime || apt.scheduledTime,
                  scheduledDate: newDate,
                  scheduledTime: newTime,
                  rescheduleCount: apt.rescheduleCount + 1,
                  lastRescheduledAt: new Date().toISOString(),
                  rescheduleReason: reason,
                  // Reset missed status if rescheduled
                  isMissed: false,
                  missedAt: undefined,
                }
              : apt
          ),
          // Remove from missed alerts if it was there
          missedAppointmentAlerts: state.missedAppointmentAlerts.filter(id => id !== appointmentId),
        }));
        return true;
      },
      markAppointmentArrived: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, isArrived: true, arrivedAt: new Date().toISOString() }
            : apt
        ),
        // Remove from missed alerts if present
        missedAppointmentAlerts: state.missedAppointmentAlerts.filter(id => id !== appointmentId),
      })),
      markAppointmentMissed: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, isMissed: true, missedAt: new Date().toISOString() }
            : apt
        ),
      })),
      unmarkAppointmentMissed: (appointmentId) => set((state) => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId
            ? { ...apt, isMissed: false, missedAt: undefined, isArrived: true, arrivedAt: new Date().toISOString() }
            : apt
        ),
        missedAppointmentAlerts: state.missedAppointmentAlerts.filter(id => id !== appointmentId),
      })),
      missedAppointmentAlerts: [],
      dismissMissedAlert: (appointmentId) => set((state) => ({
        missedAppointmentAlerts: state.missedAppointmentAlerts.filter(id => id !== appointmentId),
      })),
      addMissedAlert: (appointmentId) => set((state) => ({
        missedAppointmentAlerts: state.missedAppointmentAlerts.includes(appointmentId)
          ? state.missedAppointmentAlerts
          : [...state.missedAppointmentAlerts, appointmentId],
      })),
      // Favorites functionality (now per-customer)
      favoriteDetailers: [], // Keep for backwards compatibility
      addFavoriteDetailer: (detailerId: string) => set((state) => {
        const customerId = state.activeCustomerId;
        const currentFavorites = state.favoritesByCustomer[customerId] || [];
        return {
          favoritesByCustomer: {
            ...state.favoritesByCustomer,
            [customerId]: [...new Set([...currentFavorites, detailerId])],
          },
          // Also update legacy field for compatibility
          favoriteDetailers: [...new Set([...state.favoriteDetailers, detailerId])],
        };
      }),
      removeFavoriteDetailer: (detailerId: string) => set((state) => {
        const customerId = state.activeCustomerId;
        const currentFavorites = state.favoritesByCustomer[customerId] || [];
        return {
          favoritesByCustomer: {
            ...state.favoritesByCustomer,
            [customerId]: currentFavorites.filter(id => id !== detailerId),
          },
          favoriteDetailers: state.favoriteDetailers.filter(id => id !== detailerId),
        };
      }),
      toggleFavoriteDetailer: (detailerId: string) => set((state) => {
        const customerId = state.activeCustomerId;
        const currentFavorites = state.favoritesByCustomer[customerId] || [];
        const isFavorite = currentFavorites.includes(detailerId);

        if (isFavorite) {
          return {
            favoritesByCustomer: {
              ...state.favoritesByCustomer,
              [customerId]: currentFavorites.filter(id => id !== detailerId),
            },
            favoriteDetailers: state.favoriteDetailers.filter(id => id !== detailerId),
          };
        } else {
          return {
            favoritesByCustomer: {
              ...state.favoritesByCustomer,
              [customerId]: [...new Set([...currentFavorites, detailerId])],
            },
            favoriteDetailers: [...new Set([...state.favoriteDetailers, detailerId])],
          };
        }
      }),
      isFavoriteDetailer: (detailerId: string) => {
        const state = useAppStore.getState();
        const customerId = state.activeCustomerId;
        const currentFavorites = state.favoritesByCustomer[customerId] || [];
        return currentFavorites.includes(detailerId);
      },
      // Saved addresses implementation
      savedAddresses: [],
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
      setDefaultAddress: (id) => set((state) => {
        // Find the target address to get its customerId
        const targetAddr = state.savedAddresses.find(a => a.id === id);
        const targetCustomerId = targetAddr?.customerId;
        return {
          savedAddresses: state.savedAddresses.map(addr => ({
            ...addr,
            // Only toggle isDefault for addresses belonging to the same customer
            isDefault: addr.customerId === targetCustomerId ? addr.id === id : addr.isDefault
          }))
        };
      }),
      updateAddressLastUsed: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.map(addr =>
          addr.id === id ? { ...addr, lastUsed: new Date().toISOString() } : addr
        )
      })),
      // Ratings implementation
      ratings: [],
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
      services: [],
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
      // Messages inbox
      showMessages: false,
      setShowMessages: (show: boolean) => set({ showMessages: show }),
      // Language/i18n
      language: 'en' as Language,
      setLanguage: (language: Language) => set({ language }),

      // ============================================
      // Account & Availability System Implementation
      // ============================================

      // Account profiles
      accounts: INITIAL_ACCOUNTS,
      getAccountById: (id: string) => {
        const state = useAppStore.getState();
        return state.accounts.find(a => a.id === id);
      },
      getCurrentAccount: () => {
        const state = useAppStore.getState();
        if (!state.authUser) return undefined;
        const { authUser, role } = state;
        return {
          id: role === 'customer'
            ? authUser.customerProfileId || authUser.userId
            : authUser.providerProfileId || authUser.userId,
          type: role === 'customer' ? 'customer' : 'detailer',
          name: `${authUser.firstName} ${authUser.lastName}`.trim(),
          email: authUser.email,
          phone: authUser.phone || '',
          profileImage: authUser.avatar || undefined,
        } as AccountProfile;
      },

      // Detailer availability configurations
      detailerConfigs: INITIAL_DETAILER_CONFIGS,
      getDetailerConfig: (detailerId: string) => {
        const state = useAppStore.getState();
        return state.detailerConfigs.find(c => c.detailerId === detailerId);
      },
      updateDetailerConfig: (detailerId: string, updates: Partial<DetailerAvailabilityConfig>) => set((state) => ({
        detailerConfigs: state.detailerConfigs.map(c =>
          c.detailerId === detailerId ? { ...c, ...updates } : c
        )
      })),

      // Per-customer favorites
      favoritesByCustomer: INITIAL_FAVORITES_BY_CUSTOMER,
      getMyFavorites: () => {
        const state = useAppStore.getState();
        return state.favoritesByCustomer[state.activeCustomerId] || [];
      },

      // Bidirectional messaging
      bidirectionalConversations: INITIAL_BIDIRECTIONAL_CONVERSATIONS,
      bidirectionalChatLogs: INITIAL_BIDIRECTIONAL_CHAT_LOGS,

      sendMessage: (conversationId: string, text: string) => set((state) => {
        // ConversationId format is "det_1_cust_1" - split on first "_cust_" to get both parts
        const custSepIndex = conversationId.indexOf('_cust_');
        const detailerId = custSepIndex !== -1 ? conversationId.substring(0, custSepIndex) : conversationId.split('_')[0];
        const customerId = custSepIndex !== -1 ? conversationId.substring(custSepIndex + 1) : conversationId.split('_')[1];
        const newMessage: BidirectionalChatMessage = {
          id: `msg_${Date.now()}`,
          text,
          senderId: state.role === 'customer' ? state.activeCustomerId : state.activeDetailerId,
          senderType: state.role,
          timestamp: new Date().toISOString(),
          read: false,
        };

        return {
          bidirectionalChatLogs: {
            ...state.bidirectionalChatLogs,
            [conversationId]: [...(state.bidirectionalChatLogs[conversationId] || []), newMessage],
          },
          bidirectionalConversations: state.bidirectionalConversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: text,
                  lastMessageTime: 'Just now',
                  detailerUnread: state.role === 'customer' ? conv.detailerUnread + 1 : conv.detailerUnread,
                  customerUnread: state.role === 'detailer' ? conv.customerUnread + 1 : conv.customerUnread,
                }
              : conv
          ),
        };
      }),

      startConversation: (detailerId: string) => {
        const state = useAppStore.getState();
        const customerId = state.activeCustomerId;
        const conversationId = `${detailerId}_${customerId}`;

        // Check if conversation exists
        const existing = state.bidirectionalConversations.find(c => c.id === conversationId);
        if (existing) return conversationId;

        // Create new conversation — use authUser for customer info
        const authUser = state.authUser;
        const customerName = authUser
          ? `${authUser.firstName} ${authUser.lastName}`.trim()
          : 'Customer';

        const newConv: BidirectionalConversation = {
          id: conversationId,
          detailerId,
          customerId,
          detailerName: 'Detailer',
          customerName,
          detailerImage: undefined,
          customerImage: authUser?.avatar || undefined,
          lastMessage: '',
          lastMessageTime: '',
          detailerUnread: 0,
          customerUnread: 0,
          isPinnedByDetailer: false,
          isPinnedByCustomer: false,
        };

        useAppStore.setState((state) => ({
          bidirectionalConversations: [...state.bidirectionalConversations, newConv],
        }));

        return conversationId;
      },

      getMyConversations: () => {
        const state = useAppStore.getState();
        const { role, activeCustomerId, activeDetailerId } = state;

        return state.bidirectionalConversations
          .filter(conv => {
            if (role === 'customer') return conv.customerId === activeCustomerId;
            return conv.detailerId === activeDetailerId;
          })
          .map(conv => ({
            ...conv,
            // For display, participantId/Name refer to the OTHER party
            participantId: role === 'customer' ? conv.detailerId : conv.customerId,
            participantName: role === 'customer' ? conv.detailerName : conv.customerName,
            participantImage: role === 'customer' ? conv.detailerImage : conv.customerImage,
            unread: role === 'customer' ? conv.customerUnread : conv.detailerUnread,
            isPinned: role === 'customer' ? conv.isPinnedByCustomer : conv.isPinnedByDetailer,
          }));
      },

      markBidirectionalConversationRead: (conversationId: string) => set((state) => ({
        bidirectionalConversations: state.bidirectionalConversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                detailerUnread: state.role === 'detailer' ? 0 : conv.detailerUnread,
                customerUnread: state.role === 'customer' ? 0 : conv.customerUnread,
              }
            : conv
        ),
        bidirectionalChatLogs: {
          ...state.bidirectionalChatLogs,
          [conversationId]: (state.bidirectionalChatLogs[conversationId] || []).map(msg => ({
            ...msg,
            read: msg.senderType !== state.role ? true : msg.read,
          })),
        },
      })),

      getUnreadCount: () => {
        const state = useAppStore.getState();
        const { role, activeCustomerId, activeDetailerId } = state;

        return state.bidirectionalConversations
          .filter(conv => {
            if (role === 'customer') return conv.customerId === activeCustomerId;
            return conv.detailerId === activeDetailerId;
          })
          .reduce((total, conv) => {
            return total + (role === 'customer' ? conv.customerUnread : conv.detailerUnread);
          }, 0);
      },

      // Perspective-aware selectors
      getMyAppointments: () => {
        const state = useAppStore.getState();
        const { role, activeCustomerId, activeDetailerId } = state;

        if (role === 'customer') {
          return state.appointments.filter(apt => apt.customerId === activeCustomerId);
        }
        return state.appointments.filter(apt => apt.detailerId === activeDetailerId);
      },

      // Availability calculation
      calculateAvailableSlots: (
        detailerId: string,
        date: string,
        serviceDuration: number,
        appointmentLocation?: { lat: number; lng: number }
      ): AvailabilitySlot[] => {
        const state = useAppStore.getState();
        const config = state.detailerConfigs.find(c => c.detailerId === detailerId);

        if (!config) return [];

        const dayOfWeek = getDayOfWeek(date);
        const dayConfig = config.workingHours[dayOfWeek];

        // If closed, return empty
        if (dayConfig.closed) return [];

        // Get existing appointments for this detailer on this date
        const dayAppointments = state.appointments
          .filter(apt =>
            apt.detailerId === detailerId &&
            apt.scheduledDate === date &&
            apt.status !== 'cancelled'
          )
          .sort((a, b) => timeToMinutes(a.scheduledTime) - timeToMinutes(b.scheduledTime));

        const slots: AvailabilitySlot[] = [];
        const startMinutes = timeToMinutes(dayConfig.open);
        const endMinutes = timeToMinutes(dayConfig.close);

        // Generate 30-minute interval slots
        for (let current = startMinutes; current + serviceDuration <= endMinutes; current += 30) {
          const slotStart = minutesToTime(current);
          const slotEnd = minutesToTime(current + serviceDuration);
          let available = true;
          let reason: AvailabilitySlot['reason'] = undefined;

          // Check lunch break
          if (config.lunchBreak.enabled) {
            const lunchStart = timeToMinutes(config.lunchBreak.start);
            const lunchEnd = timeToMinutes(config.lunchBreak.end);
            if (current < lunchEnd && current + serviceDuration > lunchStart) {
              available = false;
              reason = 'lunch';
            }
          }

          // Check appointment conflicts (with buffer)
          if (available) {
            for (const apt of dayAppointments) {
              const aptStart = timeToMinutes(apt.scheduledTime);
              const aptEnd = aptStart + apt.duration + config.bufferMinutes;

              // Check if slot overlaps with appointment + buffer
              if (current < aptEnd && current + serviceDuration > aptStart - config.bufferMinutes) {
                available = false;
                reason = 'booked';
                break;
              }

              // Calculate travel time if location provided
              if (appointmentLocation && apt.latitude && apt.longitude) {
                const distance = calculateDistanceForAvailability(
                  apt.latitude, apt.longitude,
                  appointmentLocation.lat, appointmentLocation.lng
                );
                const travelMinutes = Math.ceil((distance / config.travelSpeedMph) * 60);

                // If this slot starts right after an appointment, account for travel
                if (current >= aptStart && current < aptEnd + travelMinutes) {
                  available = false;
                  reason = 'travel';
                  break;
                }
              }
            }
          }

          slots.push({ startTime: slotStart, endTime: slotEnd, available, reason });
        }

        return slots;
      },
    }),
    {
      name: "app_state_v16", // Bumped: real auth, no mock data
      merge: (persistedState: any, currentState: AppState) => {
        const merged = { ...currentState, ...persistedState };

        // Ensure reliability fields on appointments
        merged.appointments = (merged.appointments || []).map((apt: Appointment) => ({
          ...apt,
          isArrived: apt.isArrived ?? false,
          rescheduleCount: apt.rescheduleCount ?? 0,
          isMissed: apt.isMissed ?? false,
        }));

        merged.missedAppointmentAlerts = merged.missedAppointmentAlerts ?? [];

        // Clear stale mock data from previous versions
        merged.accounts = [];
        merged.detailerConfigs = merged.detailerConfigs ?? [];
        merged.favoritesByCustomer = merged.favoritesByCustomer ?? {};
        merged.bidirectionalConversations = merged.bidirectionalConversations ?? [];
        merged.bidirectionalChatLogs = merged.bidirectionalChatLogs ?? {};

        return merged;
      },
    }
  )
);