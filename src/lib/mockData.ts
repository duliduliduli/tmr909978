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
  // Mock account credentials
  account: {
    username: string;
    password: string;
    email: string;
  };
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
  // Mock account credentials
  account: {
    username: string;
    password: string;
    email: string;
  };
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  bodyType: 'car' | 'suv' | 'truck' | 'van';
  isLuxury: boolean;
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
    name: "Alex Johnson",
    businessName: "Mobile Shine Pro",
    rating: 4.9,
    reviewCount: 142,
    services: [
      { id: "s1", name: "Basic Wash", description: "Exterior wash & dry", price: 25, duration: 30, category: "Basic" },
      { id: "s2", name: "Full Detail", description: "Interior & exterior detail", price: 120, duration: 180, category: "Premium" },
      { id: "s3", name: "Paint Correction", description: "Paint correction & ceramic coating", price: 300, duration: 240, category: "Premium" }
    ],
    coin: { name: "Shine Coins", iconColor: "#00D4AA", earnRate: 1, redemptionValue: 0.1 },
    promotions: [
      { id: "p1", title: "New Customer", description: "20% off first service", discount: 20, validUntil: "2024-12-31" }
    ],
    phone: "(555) 234-5678",
    hours: "Mon-Sat 8AM-6PM",
    photos: Array(8).fill(0).map((_, i) => `/demo/detailer-1-${i + 1}.jpg`),
    location: { xPct: 35, yPct: 45, lat: 34.1808, lng: -118.3089 }, // Burbank, CA
    scatterEnabled: false,
    account: {
      username: "alex.johnson@shinepro.test",
      password: "Alex123!",
      email: "alex.johnson@shinepro.test"
    }
  },
  {
    id: "det_2", 
    name: "Sarah Davis",
    businessName: "Premium Auto Care",
    rating: 4.8,
    reviewCount: 89,
    services: [
      { id: "s4", name: "Express Wash", description: "Quick exterior wash", price: 20, duration: 20, category: "Basic" },
      { id: "s5", name: "Interior Deep Clean", description: "Deep vacuum & sanitize", price: 80, duration: 120, category: "Interior" }
    ],
    coin: { name: "Premium Coins", iconColor: "#8B5CF6", earnRate: 1.5, redemptionValue: 0.12 },
    promotions: [],
    phone: "(555) 345-6789",
    hours: "Mon-Fri 7AM-7PM",
    photos: Array(6).fill(0).map((_, i) => `/demo/detailer-2-${i + 1}.jpg`),
    location: { xPct: 55, yPct: 30, lat: 34.1422, lng: -118.2551 }, // Glendale, CA
    scatterEnabled: false,
    account: {
      username: "sarah.davis@autocare.test",
      password: "Sarah123!",
      email: "sarah.davis@autocare.test"
    }
  },
  {
    id: "det_3",
    name: "Mike Rodriguez",
    businessName: "Elite Detail Works",
    rating: 4.7,
    reviewCount: 203,
    services: [
      { id: "s6", name: "Luxury Detail", description: "Premium service for luxury cars", price: 200, duration: 240, category: "Luxury" },
      { id: "s7", name: "Ceramic Coating", description: "9H ceramic coating protection", price: 500, duration: 360, category: "Protection" }
    ],
    coin: { name: "Elite Coins", iconColor: "#F59E0B", earnRate: 2, redemptionValue: 0.15 },
    promotions: [
      { id: "p2", title: "Ceramic Special", description: "Free wash with ceramic coating", discount: 0, validUntil: "2024-11-30" }
    ],
    phone: "(555) 456-7890",
    hours: "Tue-Sun 9AM-5PM", 
    photos: Array(10).fill(0).map((_, i) => `/demo/detailer-3-${i + 1}.jpg`),
    location: { xPct: 25, yPct: 65, lat: 34.1481, lng: -118.1445 }, // Pasadena, CA
    scatterEnabled: false,
    account: {
      username: "mike.rodriguez@elitedetail.test",
      password: "Mike123!",
      email: "mike.rodriguez@elitedetail.test"
    }
  },
  {
    id: "det_4",
    name: "Jennifer Lee",
    businessName: "Quick Shine Services",
    rating: 4.9,
    reviewCount: 156,
    services: [
      { id: "s8", name: "Quick Wash", description: "Fast and efficient wash service", price: 35, duration: 45, category: "Quick" },
      { id: "s9", name: "Express Detail", description: "Quick interior and exterior touch-up", price: 90, duration: 90, category: "Quick" }
    ],
    coin: { name: "Quick Coins", iconColor: "#10B981", earnRate: 1.2, redemptionValue: 0.08 },
    promotions: [],
    phone: "(555) 567-8901", 
    hours: "Mon-Sat 8AM-6PM",
    photos: Array(7).fill(0).map((_, i) => `/demo/detailer-4-${i + 1}.jpg`),
    location: { xPct: 70, yPct: 50, lat: 34.0928, lng: -118.3287 }, // Hollywood, CA
    scatterEnabled: false,
    account: {
      username: "jennifer.lee@quickshine.test",
      password: "Jennifer123!",
      email: "jennifer.lee@quickshine.test"
    }
  },
  {
    id: "det_5",
    name: "David Wilson", 
    businessName: "Pro Auto Detailing",
    rating: 4.6,
    reviewCount: 78,
    services: [
      { id: "s10", name: "Professional Detail", description: "Complete professional service", price: 60, duration: 75, category: "Professional" },
      { id: "s11", name: "Luxury Vehicle Care", description: "Specialized care for luxury vehicles", price: 150, duration: 210, category: "Luxury" }
    ],
    coin: { name: "Pro Coins", iconColor: "#EF4444", earnRate: 1, redemptionValue: 0.1 },
    promotions: [
      { id: "p3", title: "Luxury Special", description: "10% off luxury vehicle services", discount: 10, validUntil: "2024-10-31" }
    ],
    phone: "(555) 678-9012",
    hours: "Mon-Fri 6AM-8PM",
    photos: Array(5).fill(0).map((_, i) => `/demo/detailer-5-${i + 1}.jpg`),
    location: { xPct: 45, yPct: 25, lat: 34.0195, lng: -118.4912 }, // Santa Monica, CA
    scatterEnabled: false,
    account: {
      username: "david.wilson@proauto.test",
      password: "David123!",
      email: "david.wilson@proauto.test"
    }
  },
  {
    id: "det_6",
    name: "Emma Thompson",
    businessName: "Test Drive Detailing", 
    rating: 5.0,
    reviewCount: 15,
    services: [
      { id: "s12", name: "FREE Test Service", description: "Complimentary test service for functionality testing", price: 0, duration: 30, category: "Free" },
      { id: "s13", name: "Basic Exterior Wash", description: "Simple exterior wash and rinse", price: 25, duration: 45, category: "Basic" },
      { id: "s14", name: "Interior Vacuum", description: "Full interior vacuum service", price: 35, duration: 60, category: "Interior" }
    ],
    coin: { name: "Test Coins", iconColor: "#6366F1", earnRate: 3, redemptionValue: 0.20 },
    promotions: [
      { id: "p4", title: "FREE Service", description: "Try our free test service - no payment required!", discount: 100, validUntil: "2025-12-31" },
      { id: "p5", title: "Testing Special", description: "Perfect for app functionality testing", discount: 0, validUntil: "2025-12-31" }
    ],
    phone: "(555) 789-0123",
    hours: "Daily 24/7 (Test Account)",
    photos: Array(4).fill(0).map((_, i) => `/demo/detailer-6-${i + 1}.jpg`),
    location: { xPct: 60, yPct: 40, lat: 34.0689, lng: -118.4452 }, // West Hollywood, CA
    scatterEnabled: false,
    account: {
      username: "emma.thompson@testdrive.test", 
      password: "Emma123!",
      email: "emma.thompson@testdrive.test"
    }
  }
];

// Generate mock customers
export const mockCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "John Smith", 
    email: "customer@test.com",
    vehicles: [
      { id: "v1", make: "Tesla", model: "Model 3", year: 2022, color: "White", plate: "ABC123", bodyType: "car", isLuxury: true },
      { id: "v2", make: "BMW", model: "X5", year: 2021, color: "Black", plate: "XYZ789", bodyType: "suv", isLuxury: true }
    ],
    walletBalances: {
      "det_1": 25,
      "det_2": 12,
      "det_3": 8
    },
    savedAddresses: [
      { id: "a1", label: "Home", address: "123 Main St, Los Angeles, CA", coords: { lat: 34.0522, lng: -118.2437 } },
      { id: "a2", label: "Work", address: "456 Business Blvd, Beverly Hills, CA", coords: { lat: 34.0736, lng: -118.4004 } }
    ],
    account: {
      username: "customer@test.com",
      password: "Customer123!",
      email: "customer@test.com"
    }
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

// Mock customer coin balances
export const mockCoinBalances = [
  {
    id: "bal_1",
    coinId: "coin_det_1",
    balance: 65,
    totalEarned: 120,
    totalRedeemed: 55,
    dollarValue: "6.50",
    lastEarnedAt: "2024-01-15T10:00:00Z",
    lastRedeemedAt: null,
    coin: {
      id: "coin_det_1",
      name: "Shine Coins",
      displayName: "Shine Coins",
      description: "Earn 1 coin per dollar spent",
      iconUrl: null,
      primaryColor: "#00D4AA",
      redemptionValue: 0.1,
      minimumRedemption: 50,
      provider: {
        businessName: "Mobile Shine Pro",
        providerName: "Alex Johnson"
      }
    }
  },
  {
    id: "bal_2",
    coinId: "coin_det_2", 
    balance: 18,
    totalEarned: 25,
    totalRedeemed: 7,
    dollarValue: "2.16",
    lastEarnedAt: "2024-01-10T14:00:00Z",
    lastRedeemedAt: "2024-01-05T12:00:00Z",
    coin: {
      id: "coin_det_2",
      name: "Premium Coins",
      displayName: "Premium Coins", 
      description: "Earn 1.5 coins per dollar spent",
      iconUrl: null,
      primaryColor: "#8B5CF6",
      redemptionValue: 0.12,
      minimumRedemption: 25,
      provider: {
        businessName: "Premium Auto Care",
        providerName: "Sarah Davis"
      }
    }
  },
  {
    id: "bal_3",
    coinId: "coin_det_3",
    balance: 95,
    totalEarned: 200,
    totalRedeemed: 105,
    dollarValue: "14.25",
    lastEarnedAt: "2024-01-20T16:30:00Z",
    lastRedeemedAt: "2024-01-18T11:00:00Z",
    coin: {
      id: "coin_det_3",
      name: "Elite Coins",
      displayName: "Elite Coins",
      description: "Earn 2 coins per dollar spent",
      iconUrl: null,
      primaryColor: "#F59E0B", 
      redemptionValue: 0.15,
      minimumRedemption: 50,
      provider: {
        businessName: "Elite Detail Works",
        providerName: "Mike Rodriguez"
      }
    }
  },
  {
    id: "bal_4",
    coinId: "coin_det_4",
    balance: 42,
    totalEarned: 60,
    totalRedeemed: 18,
    dollarValue: "3.36",
    lastEarnedAt: "2024-01-12T09:15:00Z",
    lastRedeemedAt: null,
    coin: {
      id: "coin_det_4", 
      name: "Quick Coins",
      displayName: "Quick Coins",
      description: "Earn 1.2 coins per dollar spent",
      iconUrl: null,
      primaryColor: "#10B981",
      redemptionValue: 0.08,
      minimumRedemption: 30,
      provider: {
        businessName: "Quick Shine Services", 
        providerName: "Jennifer Lee"
      }
    }
  }
];