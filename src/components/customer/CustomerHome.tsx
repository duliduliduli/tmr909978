"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Calendar, Star, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function CustomerHome() {
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
      title: "Book New Service",
      description: "Find and book a detailer near you",
      icon: Calendar,
      href: "/customer/map",
      color: "bg-accent-DEFAULT",
    },
    {
      title: "Find Detailers",
      description: "Explore detailers in your area",
      icon: MapPin,
      href: "/customer/map",
      color: "bg-blue-600",
    },
    {
      title: "Quick Clean",
      description: "Get a basic wash in 30 minutes",
      icon: Zap,
      href: "/customer/map?service=quick",
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-8">
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
              <Link
                href={action.href}
                className="block p-6 rounded-2xl bg-brand-900/50 border border-brand-800 hover:bg-brand-800/80 transition-all duration-300 group"
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
              </Link>
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
    </div>
  );
}