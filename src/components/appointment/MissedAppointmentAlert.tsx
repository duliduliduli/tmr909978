"use client";

import { AlertTriangle, Calendar, MessageCircle, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Appointment } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { parseAppointmentDateTime } from '@/lib/utils';

interface MissedAppointmentAlertProps {
  appointment: Appointment;
  onReschedule: () => void;
  onMessage: () => void;
  onCall: () => void;
  onDismiss: () => void;
}

export function MissedAppointmentAlert({
  appointment,
  onReschedule,
  onMessage,
  onCall,
  onDismiss,
}: MissedAppointmentAlertProps) {
  const { t } = useTranslation();

  // Calculate how late the appointment is
  const getTimeSinceScheduled = () => {
    const scheduledTime = parseAppointmentDateTime(
      appointment.scheduledDate,
      appointment.scheduledTime
    );
    const now = new Date();
    const diffMs = now.getTime() - scheduledTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
          {/* Header */}
          <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">
                {t('missedAppointment.title') || 'Missed Appointment'}
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-red-600 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 text-lg">
                {appointment.serviceName}
              </h4>
              <p className="text-gray-600">
                {appointment.customerName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('missedAppointment.scheduledFor') || 'Was scheduled for'}{' '}
                <span className="font-medium text-gray-700">
                  {appointment.scheduledTime}
                </span>
              </p>
              <p className="text-sm text-red-600 font-medium mt-1">
                ({getTimeSinceScheduled()})
              </p>
            </div>

            {/* Address */}
            <div className="text-sm text-gray-500 mb-4 truncate">
              {appointment.address}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onReschedule}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm"
              >
                <Calendar className="h-4 w-4" />
                {t('missedAppointment.reschedule') || 'Reschedule'}
              </button>
              <button
                onClick={onMessage}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                {t('missedAppointment.message') || 'Message'}
              </button>
              <button
                onClick={onCall}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                {t('missedAppointment.call') || 'Call'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
