"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Star, Zap, Clock, Home, Briefcase, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function CustomerHome() {
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressType, setAddressType] = useState<'home' | 'work' | 'favorite'>('home');
  const [addressValue, setAddressValue] = useState('');
  const recentBookings = [
    {
      id: "1",
      service: "Premium Wash & Wax",
      detailer: "Alex Johnson",
      date: "Dec 15, 2023",
      status: "completed",
      rating: 5,
    },
    {
      id: "2", 
      service: "Interior Deep Clean",
      detailer: "Maria Garcia",
      date: "Nov 28, 2023",
      status: "completed",
      rating: 5,
    },
  ];

  const quickActions = [
    {
      title: "Add Home",
      description: "Set your home address for quick access",
      icon: Home,
      action: () => openAddressInput('home'),
      color: "bg-green-600",
    },
    {
      title: "Add Work",
      description: "Set your work address for convenience",
      icon: Briefcase,
      action: () => openAddressInput('work'),
      color: "bg-blue-600",
    },
    {
      title: "+ Add Favorite",
      description: "Add a frequently visited location",
      icon: Plus,
      action: () => openAddressInput('favorite'),
      color: "bg-purple-600",
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
      const customerId = "cust_1"; // Mock customer ID
      
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

  return (
    <div className="p-6 space-y-8 pb-24 lg:pb-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
        <p className="text-brand-400">Ready to give your car some love?</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
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

      {/* Recent Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Services</h2>
          <Link
            href="/customer/bookings"
            className="text-accent-DEFAULT text-sm font-medium hover:text-accent-hover transition-colors"
          >
            View All
          </Link>
        </div>

        {recentBookings.length > 0 ? (
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
                    <h3 className="font-medium text-white">{booking.service}</h3>
                    <p className="text-sm text-brand-400">{booking.detailer}</p>
                    <p className="text-xs text-brand-500">{booking.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(booking.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      {booking.status}
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
            <p className="text-brand-400">No recent bookings</p>
            <Link
              href="/customer/map"
              className="inline-flex items-center gap-2 text-accent-DEFAULT font-medium hover:text-accent-hover transition-colors"
            >
              Book your first service
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-DEFAULT/20 to-blue-600/20 border border-accent-DEFAULT/30">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent-DEFAULT flex items-center justify-center">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Premium Member</h3>
            <p className="text-sm text-accent-100">Enjoy exclusive benefits and priority booking</p>
          </div>
        </div>
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
                  {addressType === 'home' ? 'Add Home Address' : 
                   addressType === 'work' ? 'Add Work Address' : 
                   'Add Favorite Location'}
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
                    Address
                  </label>
                  <input
                    type="text"
                    value={addressValue}
                    onChange={(e) => setAddressValue(e.target.value)}
                    placeholder="Enter full address..."
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
                    Cancel
                  </button>
                  <button
                    onClick={saveAddress}
                    disabled={!addressValue.trim()}
                    className="flex-1 px-4 py-3 bg-accent-DEFAULT hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
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