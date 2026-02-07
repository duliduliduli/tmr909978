"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Appointment, useAppStore } from '@/lib/store';
import { APPOINTMENT_CONFIG } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  available: boolean;
}

interface RescheduleModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onReschedule?: (newDate: string, newTime: string) => void;
}

const RESCHEDULE_REASONS = [
  { value: 'weather', label: 'Weather Conditions' },
  { value: 'emergency', label: 'Personal Emergency' },
  { value: 'schedule_conflict', label: 'Schedule Conflict' },
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'other', label: 'Other' },
];

export function RescheduleModal({
  appointment,
  isOpen,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const { t } = useTranslation();
  const { rescheduleAppointment } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [calendar, setCalendar] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingReschedules = APPOINTMENT_CONFIG.MAX_RESCHEDULES - appointment.rescheduleCount;
  const canReschedule = remainingReschedules > 0;

  useEffect(() => {
    if (isOpen) {
      generateCalendar();
      setSelectedDate('');
      setSelectedTimeSlot('');
      setSelectedReason('');
      setError(null);
    }
  }, [isOpen, currentMonth]);

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendar(days);
  };

  const fetchAvailableSlots = async (dateStr: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        providerId: appointment.detailerId,
        date: new Date(dateStr).toISOString(),
      });

      const response = await fetch(`/api/availability?${params}`);
      if (!response.ok) throw new Error('Failed to fetch availability');

      const data = await response.json();
      setAvailableSlots(data.availableSlots || []);

      if (data.availableSlots.length === 0) {
        setError('No available time slots for this date. Please choose another date.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load available times');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return;

    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTimeSlot('');
    fetchAvailableSlots(dateString);
  };

  const handleTimeSlotSelect = (startTime: string) => {
    setSelectedTimeSlot(startTime);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handleConfirmReschedule = () => {
    if (!selectedDate || !selectedTimeSlot) return;

    const success = rescheduleAppointment(
      appointment.id,
      selectedDate,
      formatTime(selectedTimeSlot),
      selectedReason || undefined
    );

    if (success) {
      onReschedule?.(selectedDate, formatTime(selectedTimeSlot));
      onClose();
    } else {
      setError('Unable to reschedule. Maximum reschedule limit reached.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {t('reschedule.title') || 'Reschedule Appointment'}
              </h3>
              <p className="text-sm text-gray-500">
                {appointment.customerName} - {appointment.serviceName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Reschedule Warning */}
            {!canReschedule ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {t('reschedule.limitReached') || 'Reschedule limit reached'}
                  </span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {t('reschedule.maxReschedules') || 'This appointment has been rescheduled the maximum number of times (3).'}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700">
                  {t('reschedule.remaining') || `${remainingReschedules} reschedule${remainingReschedules !== 1 ? 's' : ''} remaining for this appointment`}
                </p>
              </div>
            )}

            {/* Current Date/Time */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">
                {t('reschedule.currentSchedule') || 'Currently scheduled for:'}
              </p>
              <p className="font-medium text-gray-900">
                {appointment.scheduledDate} at {appointment.scheduledTime}
              </p>
            </div>

            {canReschedule && (
              <>
                {/* Calendar */}
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h4 className="text-sm font-medium">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="p-1.5 text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {calendar.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={isDateDisabled(date)}
                        className={`
                          p-1.5 text-xs rounded-lg transition-colors
                          ${!isCurrentMonth(date) ? 'text-gray-300' : 'text-gray-900'}
                          ${isDateDisabled(date) ? 'cursor-not-allowed text-gray-300' : 'hover:bg-gray-100 cursor-pointer'}
                          ${isDateSelected(date) ? 'bg-teal-600 text-white hover:bg-teal-700' : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {t('reschedule.selectTime') || 'Select New Time'}
                    </h4>

                    {isLoading ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.startTime}
                            onClick={() => handleTimeSlotSelect(slot.startTime)}
                            disabled={!slot.available}
                            className={`
                              p-2 text-xs font-medium rounded-lg border transition-all
                              ${slot.startTime === selectedTimeSlot
                                ? 'bg-teal-600 text-white border-teal-600'
                                : slot.available
                                ? 'bg-white text-gray-900 border-gray-300 hover:border-teal-500'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              }
                            `}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">No available slots</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reason Selector */}
                {selectedTimeSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('reschedule.reason') || 'Reason for rescheduling (optional)'}
                    </label>
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select a reason...</option>
                      {RESCHEDULE_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            {canReschedule && (
              <button
                onClick={handleConfirmReschedule}
                disabled={!selectedDate || !selectedTimeSlot}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t('reschedule.confirm') || 'Confirm Reschedule'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
