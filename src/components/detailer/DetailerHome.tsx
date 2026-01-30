"use client";

import { mockBookings } from "@/lib/mockData";
import { Calendar, Plus, QrCode, Settings, DollarSign, Clock, MoreVertical, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function DetailerHome() {
  const todaysBookings = mockBookings.filter(b =>
    new Date(b.scheduledFor).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 to-blue-700 p-8 shadow-2xl shadow-accent/10"
      >
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Good morning, Mike!</h1>
          <p className="text-blue-100 mb-8 max-w-md text-lg">You have {todaysBookings.length} appointments scheduled for today.</p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Projected</div>
                <div className="font-bold text-xl">$240</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Workload</div>
                <div className="font-bold text-xl">4.5 hrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-900 rounded-2xl p-6 border border-brand-800 hover:border-brand-700 hover:bg-brand-800 transition-all text-left group"
        >
          <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="font-bold text-lg text-white mb-1">Add Service</h3>
          <p className="text-sm text-brand-400">Create new service offering</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-900 rounded-2xl p-6 border border-brand-800 hover:border-brand-700 hover:bg-brand-800 transition-all text-left group"
        >
          <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <QrCode className="h-6 w-6 text-purple-500" />
          </div>
          <h3 className="font-bold text-lg text-white mb-1">Share QR</h3>
          <p className="text-sm text-brand-400">Get more customers</p>
        </motion.button>
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
          <button className="text-accent-DEFAULT text-sm font-medium flex items-center gap-2 hover:text-accent-hover transition-colors">
            <Calendar className="h-4 w-4" />
            View Calendar
          </button>
        </div>

        {todaysBookings.length > 0 ? (
          <div className="space-y-4">
            {todaysBookings.map((booking, i) => (
              <div key={booking.id} className="bg-brand-900 rounded-2xl p-6 border border-brand-800 hover:border-brand-700 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <div className="font-bold text-lg text-white">Full Detail Service</div>
                    <div className="flex items-center gap-2 text-brand-400">
                      <span className="text-brand-200">{"Customer"}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs truncate max-w-[150px]">{booking.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400 text-lg">${booking.total}</div>
                    <div className="text-sm text-brand-500 font-medium bg-brand-950 px-2 py-1 rounded-lg inline-block mt-1">
                      {new Date(booking.scheduledFor).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-accent-DEFAULT text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/10">
                    Start Service
                  </button>
                  <button className="px-4 py-3 border border-brand-700 rounded-xl text-sm font-medium text-brand-300 hover:text-white hover:bg-brand-800 transition-colors flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="px-4 py-3 border border-brand-700 rounded-xl text-sm font-medium text-brand-300 hover:text-white hover:bg-brand-800 transition-colors flex items-center justify-center">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-brand-900 rounded-2xl p-10 border border-brand-800 text-center border-dashed">
            <div className="w-16 h-16 bg-brand-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-brand-600" />
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">No appointments today</h3>
            <p className="text-brand-400 mb-6 max-w-xs mx-auto">Your schedule is clear. Share your profile to get more bookings!</p>
            <button className="bg-accent-DEFAULT text-white px-6 py-3 rounded-xl font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">
              Share Profile
            </button>
          </div>
        )}
      </motion.div>

      {/* Status Toggle */}
      <div className="bg-brand-900 rounded-2xl p-5 border border-brand-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white">Available for bookings</h3>
            <p className="text-sm text-brand-400">Customers can find you on the map</p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button className="w-14 h-8 bg-emerald-500/20 rounded-full relative transition-colors border border-emerald-500/30">
          <div className="absolute right-1 top-1 w-6 h-6 bg-emerald-400 rounded-full shadow-lg" />
        </button>
      </div>
    </div>
  );
}