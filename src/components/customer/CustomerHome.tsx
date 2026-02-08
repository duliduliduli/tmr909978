"use client";

import Link from "next/link";
import { ChevronRight, Clock, Home, Briefcase, Plus, X, Tag, Coins, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

interface RecentBooking {
  id: string;
  bookingNumber: string;
  status: string;
  totalAmount: number;
  scheduledStartTime: string;
  service: { name: string; category: string | null };
  provider: { businessName: string };
}

interface Promotion {
  id: string;
  type: 'coin' | 'code';
  title: string;
  description: string | null;
  discountAmount: number;
  validUntil: string | null;
  // coin-specific
  providerName?: string;
  providerId?: string;
  coinColor?: string;
  coinDisplayName?: string;
  requiredCoins?: number;
  // code-specific
  discountType?: string;
  code?: string;
  minOrderAmount?: number;
  newCustomersOnly?: boolean;
}

export function CustomerHome() {
  const { t } = useTranslation();
  const { activeCustomerId } = useAppStore();
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressType, setAddressType] = useState<'home' | 'work' | 'favorite'>('home');
  const [addressValue, setAddressValue] = useState('');

  // Real data state
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promosLoading, setPromosLoading] = useState(true);

  // Fetch recent completed bookings
  useEffect(() => {
    if (!activeCustomerId) {
      setBookingsLoading(false);
      return;
    }

    fetch(`/api/bookings?customerId=${activeCustomerId}&status=COMPLETED&limit=3`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setRecentBookings(data.bookings || []);
      })
      .catch((err) => {
        console.error('Error fetching recent bookings:', err);
        setRecentBookings([]);
      })
      .finally(() => setBookingsLoading(false));
  }, [activeCustomerId]);

  // Fetch active promotions
  useEffect(() => {
    fetch('/api/promotions')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPromotions(data.promotions || []);
      })
      .catch((err) => {
        console.error('Error fetching promotions:', err);
        setPromotions([]);
      })
      .finally(() => setPromosLoading(false));
  }, []);

  const quickActions = [
    {
      title: t('customerHome.addHome'),
      description: t('customerHome.addHomeDesc'),
      icon: Home,
      action: () => openAddressInput('home'),
      color: "bg-brand-700",
    },
    {
      title: t('customerHome.addWork'),
      description: t('customerHome.addWorkDesc'),
      icon: Briefcase,
      action: () => openAddressInput('work'),
      color: "bg-brand-600",
    },
    {
      title: t('customerHome.addFavorite'),
      description: t('customerHome.addFavoriteDesc'),
      icon: Plus,
      action: () => openAddressInput('favorite'),
      color: "bg-brand-800",
    },
  ];

  const openAddressInput = (type: 'home' | 'work' | 'favorite') => {
    setAddressType(type);
    setAddressValue('');
    setShowAddressInput(true);
  };

  const saveAddress = async () => {
    if (!addressValue.trim()) return;

    try {
      // Mock geocoding (in production, use Google Maps Geocoding API)
      const mockCoords = {
        home: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
        work: { lat: 34.0736, lng: -118.4004 }, // Beverly Hills
        favorite: { lat: 34.1481, lng: -118.1445 } // Pasadena
      };

      const coords = mockCoords[addressType];
      const customerId = activeCustomerId || "cust_1";

      const response = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          label: addressType,
          address: addressValue,
          latitude: coords.lat,
          longitude: coords.lng,
          city: 'Los Angeles',
          state: 'CA'
        })
      });

      if (response.ok) {
        console.log(`${addressType} address saved successfully`);
      } else {
        console.error('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }

    // Close overlay
    setShowAddressInput(false);
    setAddressValue('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatExpiry = (dateString: string | null) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return null;
    if (daysLeft <= 7) return `${daysLeft}d left`;
    return `Expires ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="p-6 space-y-8 pb-24 lg:pb-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">{t('customerHome.welcomeBack')}</h1>
        <p className="text-brand-400">{t('customerHome.readyToGive')}</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t('customerHome.quickActions')}</h2>
        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={action.action}
                className="w-full text-left p-6 rounded-2xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-accent-DEFAULT transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-brand-400 mt-1">{action.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-600 group-hover:text-accent-DEFAULT group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Bookings — Real Data */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{t('customerHome.recentServices')}</h2>
          <Link
            href="/customer/appointments"
            className="text-accent-DEFAULT text-sm font-medium hover:text-accent-hover transition-colors"
          >
            {t('customerHome.viewAll')}
          </Link>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-brand-800 rounded" />
                    <div className="h-3 w-28 bg-brand-800 rounded" />
                    <div className="h-3 w-20 bg-brand-800 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-brand-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-brand-900/50 border border-brand-800"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-white">{booking.service.name}</h3>
                    <p className="text-sm text-brand-400">{booking.provider.businessName}</p>
                    <p className="text-xs text-brand-500">{formatDate(booking.scheduledStartTime)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      ${(booking.totalAmount / 100).toFixed(2)}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      {booking.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="h-16 w-16 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-brand-400">{t('customerHome.noRecentBookings')}</p>
            <Link
              href="/customer/map"
              className="inline-flex items-center gap-2 text-accent-DEFAULT font-medium hover:text-accent-hover transition-colors"
            >
              {t('customerHome.bookFirstService')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Deals & Promotions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Tag className="h-5 w-5 text-accent-DEFAULT" />
            Deals & Promotions
          </h2>
        </div>

        {promosLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-brand-900/50 border border-brand-800 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-brand-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-brand-800 rounded" />
                    <div className="h-3 w-48 bg-brand-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : promotions.length > 0 ? (
          <div className="space-y-3">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {promo.type === 'coin' ? (
                  <Link
                    href={`/customer/map`}
                    className="block p-4 rounded-xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: promo.coinColor || '#3B82F6' }}
                      >
                        <Coins className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white group-hover:text-accent-DEFAULT transition-colors truncate">
                          {promo.title}
                        </h3>
                        <p className="text-sm text-brand-400 truncate">
                          {promo.providerName} {promo.description ? `— ${promo.description}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-brand-500">
                            {promo.requiredCoins} {promo.coinDisplayName} coins
                          </span>
                          {promo.validUntil && formatExpiry(promo.validUntil) && (
                            <span className="text-xs text-amber-400">
                              {formatExpiry(promo.validUntil)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-400">
                          ${promo.discountAmount.toFixed(2)} off
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="p-4 rounded-xl bg-brand-900/50 border border-brand-800">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
                        <Percent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{promo.title}</h3>
                        <p className="text-sm text-brand-400 truncate">{promo.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {promo.newCustomersOnly && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">New customers</span>
                          )}
                          {promo.minOrderAmount && (
                            <span className="text-xs text-brand-500">Min ${promo.minOrderAmount}</span>
                          )}
                          {promo.validUntil && formatExpiry(promo.validUntil) && (
                            <span className="text-xs text-amber-400">
                              {formatExpiry(promo.validUntil)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                          {promo.code}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <div className="h-12 w-12 rounded-full bg-brand-800 flex items-center justify-center mx-auto">
              <Tag className="h-6 w-6 text-brand-600" />
            </div>
            <p className="text-brand-400 text-sm">No promotions available right now</p>
          </div>
        )}
      </div>

      {/* Address Input Overlay */}
      <AnimatePresence>
        {showAddressInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddressInput(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
              className="bg-brand-950 border border-brand-800 rounded-2xl p-6 w-full max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {addressType === 'home' ? t('customerHome.addHomeAddress') :
                   addressType === 'work' ? t('customerHome.addWorkAddress') :
                   t('customerHome.addFavoriteLocation')}
                </h2>
                <button
                  onClick={() => setShowAddressInput(false)}
                  className="p-2 hover:bg-brand-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-brand-400" />
                </button>
              </div>

              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-200 mb-2">
                    {t('customerHome.address')}
                  </label>
                  <input
                    type="text"
                    value={addressValue}
                    onChange={(e) => setAddressValue(e.target.value)}
                    placeholder={t('customerHome.enterFullAddress')}
                    className="w-full px-4 py-3 bg-brand-900 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveAddress();
                      }
                      if (e.key === 'Escape') {
                        setShowAddressInput(false);
                      }
                    }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddressInput(false)}
                    className="flex-1 px-4 py-3 bg-brand-800 hover:bg-brand-700 text-white rounded-lg transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={saveAddress}
                    disabled={!addressValue.trim()}
                    className="flex-1 px-4 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
