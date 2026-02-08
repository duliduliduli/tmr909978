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
  switchToTestAccount: () => void;
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

// Helper to get date strings relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};
const todayStr = getRelativeDate(0);

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

// Pre-seeded account profiles
const INITIAL_ACCOUNTS: AccountProfile[] = [
  // Customers
  { id: 'cust_1', type: 'customer', name: 'John Smith', email: 'john.smith@test.com', phone: '(555) 111-2233', profileImage: '/images/customers/customer-1.webp' },
  { id: 'cust_2', type: 'customer', name: 'Maria Garcia', email: 'maria.garcia@test.com', phone: '(555) 444-5566', profileImage: '/images/customers/customer-2.webp' },
  { id: 'cust_3', type: 'customer', name: 'David Park', email: 'david.park@test.com', phone: '(555) 777-8899', profileImage: '/images/customers/customer-3.webp' },
  // Detailers
  { id: 'det_1', type: 'detailer', name: 'Alex Johnson', email: 'alex@premiumautospa.com', phone: '(555) 123-4567', businessName: 'Premium Auto Spa', profileImage: '/images/detailers/detailer-1.webp' },
  { id: 'det_2', type: 'detailer', name: 'Sarah Wilson', email: 'sarah@elitedetailing.com', phone: '(555) 234-5678', businessName: 'Elite Detailing Co', profileImage: '/images/detailers/detailer-2.jpg' },
  { id: 'det_3', type: 'detailer', name: 'Carlos Martinez', email: 'carlos@premiumautocare.com', phone: '(555) 345-6789', businessName: 'Premium Auto Care', profileImage: '/images/detailers/detailer-3.jpg' },
  { id: 'det_4', type: 'detailer', name: 'Mike Chen', email: 'mike@speedyclean.com', phone: '(555) 456-7890', businessName: 'Speedy Clean', profileImage: '/images/detailers/detailer-4.jpg' },
  { id: 'det_5', type: 'detailer', name: 'Jessica Brown', email: 'jessica@luxuryautospa.com', phone: '(555) 567-8901', businessName: 'Luxury Auto Spa', profileImage: '/images/detailers/detailer-5.jpg' },
  { id: 'det_6', type: 'detailer', name: 'Emma Thompson', email: 'emma@testdrivedetail.com', phone: '(555) 678-9012', businessName: 'Test Drive Detailing', profileImage: '/images/detailers/detailer-6.jpg' },
];

// Detailer availability configurations with varied hours
const INITIAL_DETAILER_CONFIGS: DetailerAvailabilityConfig[] = [
  {
    detailerId: 'det_1',
    workingHours: DEFAULT_WORKING_HOURS,
    lunchBreak: DEFAULT_LUNCH_BREAK,
    bufferMinutes: 15,
    travelSpeedMph: 25,
  },
  {
    detailerId: 'det_2',
    workingHours: {
      ...DEFAULT_WORKING_HOURS,
      monday: { open: '07:00', close: '19:00', closed: false },
      tuesday: { open: '07:00', close: '19:00', closed: false },
      wednesday: { open: '07:00', close: '19:00', closed: false },
      thursday: { open: '07:00', close: '19:00', closed: false },
      friday: { open: '07:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
    },
    lunchBreak: { enabled: true, start: '12:30', end: '13:00' },
    bufferMinutes: 15,
    travelSpeedMph: 25,
  },
  {
    detailerId: 'det_3',
    workingHours: {
      ...DEFAULT_WORKING_HOURS,
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '15:00', closed: false },
    },
    lunchBreak: DEFAULT_LUNCH_BREAK,
    bufferMinutes: 15,
    travelSpeedMph: 25,
  },
  {
    detailerId: 'det_4',
    workingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
    lunchBreak: { enabled: true, start: '12:00', end: '12:30' },
    bufferMinutes: 10,
    travelSpeedMph: 30,
  },
  {
    detailerId: 'det_5',
    workingHours: {
      monday: { open: '10:00', close: '18:00', closed: true },
      tuesday: { open: '10:00', close: '18:00', closed: false },
      wednesday: { open: '10:00', close: '18:00', closed: false },
      thursday: { open: '10:00', close: '18:00', closed: false },
      friday: { open: '10:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    lunchBreak: { enabled: true, start: '13:00', end: '14:00' },
    bufferMinutes: 20,
    travelSpeedMph: 25,
  },
  {
    detailerId: 'det_6',
    workingHours: {
      ...DEFAULT_WORKING_HOURS,
      saturday: { open: '09:00', close: '17:00', closed: true },
    },
    lunchBreak: DEFAULT_LUNCH_BREAK,
    bufferMinutes: 15,
    travelSpeedMph: 25,
  },
];

// Pre-seeded bidirectional conversations
const INITIAL_BIDIRECTIONAL_CONVERSATIONS: BidirectionalConversation[] = [
  {
    id: 'det_1_cust_1',
    detailerId: 'det_1',
    customerId: 'cust_1',
    detailerName: 'Premium Auto Spa',
    customerName: 'John Smith',
    detailerImage: '/images/detailers/detailer-1.webp',
    customerImage: '/images/customers/customer-1.webp',
    lastMessage: 'Great! I\'ve confirmed your appointment. See you tomorrow!',
    lastMessageTime: '2 hours ago',
    detailerUnread: 0,
    customerUnread: 0,
    isPinnedByDetailer: false,
    isPinnedByCustomer: true,
  },
  {
    id: 'det_1_cust_2',
    detailerId: 'det_1',
    customerId: 'cust_2',
    detailerName: 'Premium Auto Spa',
    customerName: 'Maria Garcia',
    detailerImage: '/images/detailers/detailer-1.webp',
    customerImage: '/images/customers/customer-2.webp',
    lastMessage: 'Yes, I can do the ceramic coating next week!',
    lastMessageTime: '1 day ago',
    detailerUnread: 1,
    customerUnread: 0,
    isPinnedByDetailer: false,
    isPinnedByCustomer: false,
  },
  {
    id: 'det_2_cust_1',
    detailerId: 'det_2',
    customerId: 'cust_1',
    detailerName: 'Elite Detailing Co',
    customerName: 'John Smith',
    detailerImage: '/images/detailers/detailer-2.jpg',
    customerImage: '/images/customers/customer-1.webp',
    lastMessage: 'Thanks for your business! Hope to see you again soon.',
    lastMessageTime: '3 days ago',
    detailerUnread: 0,
    customerUnread: 0,
    isPinnedByDetailer: false,
    isPinnedByCustomer: false,
  },
  {
    id: 'det_3_cust_3',
    detailerId: 'det_3',
    customerId: 'cust_3',
    detailerName: 'Premium Auto Care',
    customerName: 'David Park',
    detailerImage: '/images/detailers/detailer-3.jpg',
    customerImage: '/images/customers/customer-3.webp',
    lastMessage: 'Hi David! Welcome to Premium Auto Care. How can I help you?',
    lastMessageTime: '5 hours ago',
    detailerUnread: 0,
    customerUnread: 1,
    isPinnedByDetailer: true,
    isPinnedByCustomer: false,
  },
];

// Pre-seeded bidirectional chat logs
const INITIAL_BIDIRECTIONAL_CHAT_LOGS: Record<string, BidirectionalChatMessage[]> = {
  'det_1_cust_1': [
    { id: 'msg_1', text: 'Hi! When can you come detail my Tesla?', senderId: 'cust_1', senderType: 'customer', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_2', text: 'Hi John! I have availability tomorrow at 10 AM. Would that work?', senderId: 'det_1', senderType: 'detailer', timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_3', text: 'Perfect! Book me in.', senderId: 'cust_1', senderType: 'customer', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_4', text: 'Great! I\'ve confirmed your appointment. See you tomorrow!', senderId: 'det_1', senderType: 'detailer', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: true },
  ],
  'det_1_cust_2': [
    { id: 'msg_5', text: 'Do you do ceramic coating?', senderId: 'cust_2', senderType: 'customer', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_6', text: 'Yes! It\'s $300 and takes about 4 hours.', senderId: 'det_1', senderType: 'detailer', timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_7', text: 'Can I book for next week?', senderId: 'cust_2', senderType: 'customer', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'msg_8', text: 'Yes, I can do the ceramic coating next week!', senderId: 'det_1', senderType: 'detailer', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), read: true },
  ],
  'det_2_cust_1': [
    { id: 'msg_9', text: 'Thanks for the great detail yesterday!', senderId: 'cust_1', senderType: 'customer', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_10', text: 'Thanks for your business! Hope to see you again soon.', senderId: 'det_2', senderType: 'detailer', timestamp: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(), read: true },
  ],
  'det_3_cust_3': [
    { id: 'msg_11', text: 'Hi, I\'m new to the area. What services do you offer?', senderId: 'cust_3', senderType: 'customer', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), read: true },
    { id: 'msg_12', text: 'Hi David! Welcome to Premium Auto Care. How can I help you?', senderId: 'det_3', senderType: 'detailer', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false },
  ],
};

// Initial favorites by customer
const INITIAL_FAVORITES_BY_CUSTOMER: Record<string, string[]> = {
  'cust_1': ['det_1', 'det_2'],
  'cust_2': ['det_1'],
  'cust_3': ['det_3', 'det_4'],
};

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
      deleteConversation: (detailerId, customerId) => set((state) => {
        const key = `${detailerId}_${customerId}`;
        const { [key]: _, ...rest } = state.chatLogs;
        return { chatLogs: rest };
      }),
      // Conversation management
      conversations: [
        {
          id: 'conv_1',
          participantId: 'det_1',
          participantName: 'Mobile Shine Pro',
          participantImage: '/images/detailers/detailer-1.webp',
          lastMessage: 'Your appointment is confirmed for tomorrow!',
          lastMessageTime: '2 hours ago',
          unread: 2,
          isPinned: true,
        },
        {
          id: 'conv_2',
          participantId: 'det_2',
          participantName: 'Premium Auto Care',
          participantImage: '/images/detailers/detailer-3.jpg',
          lastMessage: 'Thanks for your business! Hope to see you again soon.',
          lastMessageTime: '1 day ago',
          unread: 0,
          isPinned: false,
        },
        {
          id: 'conv_3',
          participantId: 'det_3',
          participantName: 'Elite Detail Works',
          participantImage: '/images/detailers/detailer-4.jpg',
          lastMessage: 'We have a special promotion this week!',
          lastMessageTime: '3 days ago',
          unread: 1,
          isPinned: false,
        },
      ],
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
          notes: "White Tesla Model 3, parked in driveway",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Black BMW X5, garage code is 4421",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Red Porsche 911, please be extra careful with the paint",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Silver Mercedes GLE, apartment complex - buzz #204",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Blue Range Rover Sport, pet hair removal needed",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Gray Honda Civic, street parking near the coffee shop",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "White Audi Q7, please text on arrival",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Black BMW X5, recurring weekly detail",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Red Porsche 911",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Silver Mercedes GLE",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "This is a free test service to try out the app functionality",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Please use eco-friendly products if available",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Great service, very professional",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
          notes: "Cancelled due to weather conditions",
          isArrived: false,
          rescheduleCount: 0,
          isMissed: false,
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
        // Test services for payment testing (one per detailer)
        {
          id: "svc_test_1",
          detailerId: "det_1",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_test_2",
          detailerId: "det_2",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_test_3",
          detailerId: "det_3",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_test_4",
          detailerId: "det_4",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_test_5",
          detailerId: "det_5",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_test_6",
          detailerId: "det_6",
          name: "Test Service",
          description: "Free test service for payment testing - $0.00",
          price: 0,
          duration: 15,
          category: "Test",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
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
        // det_6 - Test Drive Detailing (Emma Thompson)
        {
          id: "svc_16",
          detailerId: "det_6",
          name: "FREE Test Service",
          description: "Complimentary test service for functionality testing",
          price: 0,
          duration: 30,
          category: "Free",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.0, truck: 1.0, suv: 1.0 },
          luxuryCareSurchargePercent: 0,
        },
        {
          id: "svc_17",
          detailerId: "det_6",
          name: "Basic Exterior Wash",
          description: "Simple exterior wash and rinse",
          price: 25,
          duration: 45,
          category: "Basic",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
        },
        {
          id: "svc_18",
          detailerId: "det_6",
          name: "Interior Vacuum",
          description: "Full interior vacuum service",
          price: 35,
          duration: 60,
          category: "Interior",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bodyTypeMultipliers: { car: 1.0, van: 1.1, truck: 1.15, suv: 1.1 },
          luxuryCareSurchargePercent: 15,
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
        const id = state.role === 'customer' ? state.activeCustomerId : state.activeDetailerId;
        return state.accounts.find(a => a.id === id);
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

        // Create new conversation
        const detailer = state.accounts.find(a => a.id === detailerId);
        const customer = state.accounts.find(a => a.id === customerId);

        const newConv: BidirectionalConversation = {
          id: conversationId,
          detailerId,
          customerId,
          detailerName: detailer?.businessName || detailer?.name || 'Detailer',
          customerName: customer?.name || 'Customer',
          detailerImage: detailer?.profileImage,
          customerImage: customer?.profileImage,
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
      name: "app_state_v15", // Bumped version for account system
      merge: (persistedState: any, currentState: AppState) => {
        const merged = { ...currentState, ...persistedState };

        // Refresh "today" appointment dates so they always match the current day
        // This prevents stale persisted dates from hiding mock appointments
        const now = new Date();
        const freshToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const todayIds = [
          'apt_today_1', 'apt_today_2', 'apt_today_3', 'apt_today_4',
          'apt_today_5', 'apt_today_6', 'apt_today_7', 'apt_today_8'
        ];
        merged.appointments = merged.appointments.map((apt: Appointment) => {
          // Add default values for new reliability fields
          const updatedApt = {
            ...apt,
            isArrived: apt.isArrived ?? false,
            rescheduleCount: apt.rescheduleCount ?? 0,
            isMissed: apt.isMissed ?? false,
          };
          if (todayIds.includes(apt.id)) {
            return { ...updatedApt, scheduledDate: freshToday };
          }
          return updatedApt;
        });

        // Ensure missedAppointmentAlerts exists
        merged.missedAppointmentAlerts = merged.missedAppointmentAlerts ?? [];

        // Ensure new account system state exists with fresh defaults
        merged.accounts = INITIAL_ACCOUNTS;
        merged.detailerConfigs = INITIAL_DETAILER_CONFIGS;
        merged.favoritesByCustomer = merged.favoritesByCustomer ?? INITIAL_FAVORITES_BY_CUSTOMER;
        merged.bidirectionalConversations = merged.bidirectionalConversations ?? INITIAL_BIDIRECTIONAL_CONVERSATIONS;
        merged.bidirectionalChatLogs = merged.bidirectionalChatLogs ?? INITIAL_BIDIRECTIONAL_CHAT_LOGS;

        return merged;
      },
    }
  )
);