"use client";

import { useState } from "react";
import { useAppStore, type Appointment } from "@/lib/store";
import { Calendar, Clock, MapPin, Phone, Star, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";

export function CustomerAppointments() {
  const { appointments, updateAppointmentStatus, role, activeDetailerId, activeCustomerId } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date();

  // Filter appointments by role so detailers see their jobs and customers see theirs
  const roleFilteredAppointments = appointments.filter(apt => {
    if (role === 'detailer') return apt.detailerId === activeDetailerId;
    return apt.customerId === activeCustomerId;
  });

  const upcomingAppointments = roleFilteredAppointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    return appointmentDateTime > now && apt.status !== 'completed' && apt.status !== 'cancelled';
  });

  const pastAppointments = roleFilteredAppointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    return appointmentDateTime <= now || apt.status === 'completed' || apt.status === 'cancelled';
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-brand-400 bg-brand-400/10 border-brand-400/20';
    }
  };

  const getDateLabel = (date: string) => {
    const appointmentDate = parseISO(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const AppointmentCard = ({ appointment, isPastAppointment = false }: { appointment: Appointment; isPastAppointment?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-brand-900/50 border border-brand-800 rounded-xl p-4 hover:border-brand-700 transition-colors"
    >
      {/* Top Row: Service + Status + Price */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm truncate">{appointment.serviceName}</h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status.replace('_', ' ')}
            </div>
          </div>
        </div>
        <div className="text-lg font-bold text-white flex-shrink-0">
          {appointment.price === 0 ? 'FREE' : `$${appointment.price}`}
        </div>
      </div>

      {/* Middle Row: Provider Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-accent-DEFAULT/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Star className="h-3 w-3 text-accent-DEFAULT fill-accent-DEFAULT" />
        </div>
        <span className="text-sm text-white">
          {role === 'detailer' ? (appointment.customerName || 'Customer') : appointment.businessName}
        </span>
        <span className="text-brand-500 text-xs">•</span>
        <div className="flex items-center gap-1 text-brand-400 text-xs">
          <Phone className="h-3 w-3" />
          {appointment.phone}
        </div>
      </div>

      {/* Bottom Row: Date, Time, Location */}
      <div className="flex items-center gap-4 text-xs text-brand-300">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-brand-500" />
          <span className="text-white">{getDateLabel(appointment.scheduledDate)}</span>
          {!isPastAppointment && isToday(parseISO(appointment.scheduledDate)) && (
            <span className="px-1.5 py-0.5 bg-accent-DEFAULT/20 text-accent-DEFAULT text-xs rounded">Today</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-brand-500" />
          <span>{appointment.scheduledTime}</span>
          <span className="text-brand-500">({appointment.duration}m)</span>
        </div>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <MapPin className="h-3 w-3 text-brand-500 flex-shrink-0" />
          <span className="truncate">{appointment.address}</span>
        </div>
      </div>

      {/* Cancel Button - Only for upcoming scheduled appointments */}
      {!isPastAppointment && appointment.status === 'scheduled' && (
        <div className="mt-3 pt-2 border-t border-brand-800">
          <button
            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
          >
            Cancel Appointment
          </button>
        </div>
      )}

      {appointment.notes && (
        <div className="mt-2 pt-2 border-t border-brand-800">
          <p className="text-xs text-brand-400">
            <span className="text-brand-500">Notes:</span> {appointment.notes}
          </p>
        </div>
      )}
    </motion.div>
  );

  const EmptyState = ({ type }: { type: 'upcoming' | 'past' }) => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-brand-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-brand-300 mb-2">
        No {type} appointments
      </h3>
      <p className="text-brand-500">
        {type === 'upcoming' 
          ? "You don't have any upcoming appointments. Book a service to get started!"
          : "You haven't completed any appointments yet."
        }
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
        <p className="text-brand-400">Manage your upcoming and past service appointments</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-brand-900 rounded-xl p-1 mb-8 border border-brand-800">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === 'upcoming'
              ? 'bg-brand-950 text-white shadow-lg'
              : 'text-brand-400 hover:text-brand-200'
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
            activeTab === 'past'
              ? 'bg-brand-950 text-white shadow-lg'
              : 'text-brand-400 hover:text-brand-200'
          }`}
        >
          Past ({pastAppointments.length})
        </button>
      </div>

      {/* Appointments List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'upcoming' ? (
            upcomingAppointments.length > 0 ? (
              upcomingAppointments
                .sort((a, b) => new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime() - new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime())
                .map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                  />
                ))
            ) : (
              <EmptyState type="upcoming" />
            )
          ) : (
            pastAppointments.length > 0 ? (
              pastAppointments
                .sort((a, b) => new Date(`${b.scheduledDate} ${b.scheduledTime}`).getTime() - new Date(`${a.scheduledDate} ${a.scheduledTime}`).getTime())
                .map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    isPastAppointment={true}
                  />
                ))
            ) : (
              <EmptyState type="past" />
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}