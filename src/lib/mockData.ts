export interface Detailer {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  services: Service[];
  coin: DetailerCoin;
  promotions: Promotion[];
  phone: string;
  hours: string;
  photos: string[];
  location: {
    xPct: number; // percentage position on map (legacy)
    yPct: number; // percentage position on map (legacy)
    lat: number; // latitude
    lng: number; // longitude
  };
  scatterEnabled: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
}

export interface DetailerCoin {
  name: string;
  iconColor: string;
  earnRate: number; // coins per dollar spent
  redemptionValue: number; // dollars per coin
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  vehicles: Vehicle[];
  walletBalances: Record<string, number>; // detailerId -> coin balance
  savedAddresses: SavedAddress[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  coords: { lat: number; lng: number };
}

// Generate mock detailers
export const mockDetailers: Detailer[] = [
  {
    id: "det_1",
    name: "Mike Rodriguez",
    businessName: "Premium Auto Spa",
    rating: 4.9,
    reviewCount: 142,
    services: [
      { id: "s1", name: "Basic Wash", description: "Exterior wash & dry", price: 25, duration: 30, category: "Basic" },
      { id: "s2", name: "Full Detail", description: "Interior & exterior detail", price: 120, duration: 180, category: "Premium" },
      { id: "s3", name: "Paint Correction", description: "Paint correction & ceramic coating", price: 300, duration: 240, category: "Premium" }
    ],
    coin: { name: "Premium Coins", iconColor: "#00D4AA", earnRate: 1, redemptionValue: 0.1 },
    promotions: [
      { id: "p1", title: "New Customer", description: "20% off first service", discount: 20, validUntil: "2024-12-31" }
    ],
    phone: "(323) 555-0101",
    hours: "Mon-Sat 8AM-6PM",
    photos: Array(8).fill(0).map((_, i) => `/demo/detailer-1-${i + 1}.jpg`),
    location: { xPct: 35, yPct: 45, lat: 34.0522, lng: -118.2437 },
    scatterEnabled: true
  },
  {
    id: "det_2", 
    name: "Sarah Chen",
    businessName: "Elite Mobile Detail",
    rating: 4.8,
    reviewCount: 89,
    services: [
      { id: "s4", name: "Express Wash", description: "Quick exterior wash", price: 20, duration: 20, category: "Basic" },
      { id: "s5", name: "Interior Deep Clean", description: "Deep vacuum & sanitize", price: 80, duration: 120, category: "Interior" }
    ],
    coin: { name: "Elite Coins", iconColor: "#8B5CF6", earnRate: 1.5, redemptionValue: 0.12 },
    promotions: [],
    phone: "(213) 555-0202",
    hours: "Mon-Fri 7AM-7PM",
    photos: Array(6).fill(0).map((_, i) => `/demo/detailer-2-${i + 1}.jpg`),
    location: { xPct: 55, yPct: 30, lat: 34.0736, lng: -118.4004 },
    scatterEnabled: true
  },
  {
    id: "det_3",
    name: "Carlos Martinez",
    businessName: "Shine Kings",
    rating: 4.7,
    reviewCount: 203,
    services: [
      { id: "s6", name: "Luxury Detail", description: "Premium service for luxury cars", price: 200, duration: 240, category: "Luxury" },
      { id: "s7", name: "Ceramic Coating", description: "9H ceramic coating protection", price: 500, duration: 360, category: "Protection" }
    ],
    coin: { name: "Shine Coins", iconColor: "#F59E0B", earnRate: 2, redemptionValue: 0.15 },
    promotions: [
      { id: "p2", title: "Ceramic Special", description: "Free wash with ceramic coating", discount: 0, validUntil: "2024-11-30" }
    ],
    phone: "(310) 555-0303",
    hours: "Tue-Sun 9AM-5PM", 
    photos: Array(10).fill(0).map((_, i) => `/demo/detailer-3-${i + 1}.jpg`),
    location: { xPct: 25, yPct: 65, lat: 34.0195, lng: -118.4912 },
    scatterEnabled: false
  },
  {
    id: "det_4",
    name: "Jessica Kim",
    businessName: "Eco Clean Mobile",
    rating: 4.9,
    reviewCount: 156,
    services: [
      { id: "s8", name: "Eco Wash", description: "Waterless eco-friendly wash", price: 35, duration: 45, category: "Eco" },
      { id: "s9", name: "Steam Clean", description: "Steam cleaning interior", price: 90, duration: 90, category: "Eco" }
    ],
    coin: { name: "Eco Coins", iconColor: "#10B981", earnRate: 1.2, redemptionValue: 0.08 },
    promotions: [],
    phone: "(424) 555-0404", 
    hours: "Mon-Sat 8AM-6PM",
    photos: Array(7).fill(0).map((_, i) => `/demo/detailer-4-${i + 1}.jpg`),
    location: { xPct: 70, yPct: 50, lat: 34.1405, lng: -118.1379 },
    scatterEnabled: true
  },
  {
    id: "det_5",
    name: "David Johnson", 
    businessName: "Mobile Shine Pro",
    rating: 4.6,
    reviewCount: 78,
    services: [
      { id: "s10", name: "Quick Detail", description: "Express interior & exterior", price: 60, duration: 75, category: "Basic" },
      { id: "s11", name: "Truck Detail", description: "Large vehicle specialist", price: 150, duration: 210, category: "Specialty" }
    ],
    coin: { name: "Pro Coins", iconColor: "#EF4444", earnRate: 1, redemptionValue: 0.1 },
    promotions: [
      { id: "p3", title: "Truck Special", description: "10% off truck details", discount: 10, validUntil: "2024-10-31" }
    ],
    phone: "(818) 555-0505",
    hours: "Mon-Fri 6AM-8PM",
    photos: Array(5).fill(0).map((_, i) => `/demo/detailer-5-${i + 1}.jpg`),
    location: { xPct: 45, yPct: 25, lat: 34.1688, lng: -118.3516 },
    scatterEnabled: true
  }
];

// Generate mock customers
export const mockCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "Alex Thompson", 
    email: "alex@example.com",
    vehicles: [
      { id: "v1", make: "Tesla", model: "Model 3", year: 2022, color: "White", plate: "ABC123" },
      { id: "v2", make: "BMW", model: "X5", year: 2021, color: "Black", plate: "XYZ789" }
    ],
    walletBalances: {
      "det_1": 25,
      "det_2": 12,
      "det_3": 8
    },
    savedAddresses: [
      { id: "a1", label: "Home", address: "123 Main St, Los Angeles, CA", coords: { lat: 34.0522, lng: -118.2437 } },
      { id: "a2", label: "Work", address: "456 Business Blvd, Beverly Hills, CA", coords: { lat: 34.0736, lng: -118.4004 } }
    ]
  }
];

export const mockBookings = [
  {
    id: "book_1",
    customerId: "cust_1",
    detailerId: "det_1", 
    serviceId: "s2",
    scheduledFor: "2024-03-15T10:00:00Z",
    status: "scheduled",
    address: "123 Main St, Los Angeles, CA",
    total: 120,
    tip: 15
  },
  {
    id: "book_2", 
    customerId: "cust_1",
    detailerId: "det_2",
    serviceId: "s5", 
    scheduledFor: "2024-03-16T14:00:00Z",
    status: "completed",
    address: "456 Business Blvd, Beverly Hills, CA", 
    total: 80,
    tip: 10
  }
];