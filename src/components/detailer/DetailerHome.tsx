"use client";

import { useAppStore } from "@/lib/store";
import { Plus, QrCode, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function DetailerHome() {
  const { activeDetailerId } = useAppStore();
  const todaysAppointments = useAppStore.getState().getTodaysAppointments(activeDetailerId);

  // Compute real stats from today's appointments
  const projectedEarnings = todaysAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalMinutes = todaysAppointments.reduce((sum, apt) => sum + apt.duration, 0);
  const workloadHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 to-blue-700 p-8 shadow-2xl shadow-accent/10"
      >
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Good morning, Alex!</h1>
          <p className="text-blue-100 mb-8 max-w-md text-lg">You have {todaysAppointments.length} appointment{todaysAppointments.length !== 1 ? 's' : ''} remaining today.</p>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Projected</div>
                <div className="font-bold text-xl">${projectedEarnings}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-100">Workload</div>
                <div className="font-bold text-xl">{workloadHours} hrs</div>
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