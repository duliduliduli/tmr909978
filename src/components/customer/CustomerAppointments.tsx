"use client";

import { useState } from "react";
import { useAppStore, type Appointment } from "@/lib/store";
import { Calendar, Clock, MapPin, Phone, Star, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";

export function CustomerAppointments() {
  const { appointments, updateAppointmentStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const now = new Date();
  
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    return appointmentDateTime > now && apt.status !== 'completed' && apt.status !== 'cancelled';
  });
  
  const pastAppointments = appointments.filter(apt => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-brand-900/50 border border-brand-800 rounded-2xl p-6 hover:border-brand-700 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white group-hover:text-accent-DEFAULT transition-colors">
            {appointment.serviceName}
          </h3>
          <p className="text-brand-400 text-sm mt-1">{appointment.serviceDescription}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
          {appointment.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-brand-950/50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-accent-DEFAULT/20 rounded-full flex items-center justify-center">
            <Star className="h-5 w-5 text-accent-DEFAULT fill-accent-DEFAULT" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{appointment.businessName}</h4>
            <p className="text-brand-400 text-sm">{appointment.detailerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-brand-300 text-sm">
          <Phone className="h-4 w-4" />
          {appointment.phone}
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-brand-400" />
          <div className="flex-1">
            <span className="text-white font-medium">{getDateLabel(appointment.scheduledDate)}</span>
            {!isPastAppointment && isToday(parseISO(appointment.scheduledDate)) && (
              <span className="ml-2 px-2 py-0.5 bg-accent-DEFAULT/20 text-accent-DEFAULT text-xs rounded-full">
                Today
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-brand-400" />
          <span className="text-white">{appointment.scheduledTime}</span>
          <span className="text-brand-400">({appointment.duration} min)</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="h-4 w-4 text-brand-400" />
          <span className="text-white">{appointment.address}</span>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-800">
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {appointment.price === 0 ? 'FREE' : `$${appointment.price}`}
          </div>
          <div className="text-brand-400 text-xs">
            Booked {format(parseISO(appointment.bookedAt), 'MMM dd')}
          </div>
        </div>
        
        {!isPastAppointment && (
          <div className="flex gap-2">
            {appointment.status === 'scheduled' && (
              <button 
                onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Cancel
              </button>
            )}
            <button className="flex items-center gap-2 text-accent-DEFAULT font-medium text-sm hover:text-accent-hover transition-colors">
              View Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {appointment.notes && (
        <div className="mt-4 p-3 bg-brand-950/50 rounded-lg">
          <p className="text-sm text-brand-300">
            <span className="text-brand-400 font-medium">Notes:</span> {appointment.notes}
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