"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Coffee, Car, CalendarX } from 'lucide-react';
import { BookingData } from '../BookingWizard';
import { useAppStore } from '@/lib/store';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: 'lunch' | 'booked' | 'travel' | 'closed' | 'buffer' | null;
}

interface SchedulingStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function SchedulingStep({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
  setError
}: SchedulingStepProps) {
  const { calculateAvailableSlots, getActiveServicesByDetailer } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [calendar, setCalendar] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    generateCalendar();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate && bookingData.providerId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, bookingData.providerId]);

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendar(days);
  };

  const fetchAvailableSlots = () => {
    if (!bookingData.providerId || !selectedDate) return;

    setIsLoading(true);
    try {
      // Calculate total service duration from selected vehicles/services
      let totalDuration = 60; // Default 60 minutes if no service selected

      if (bookingData.vehicles.length > 0) {
        const services = getActiveServicesByDetailer(bookingData.providerId);
        totalDuration = bookingData.vehicles.reduce((total, vehicle) => {
          const service = services.find(s => s.id === vehicle.serviceId);
          return total + (service?.duration || 60);
        }, 0);
      } else if (bookingData.serviceId) {
        // Legacy support: single service ID
        const services = getActiveServicesByDetailer(bookingData.providerId);
        const service = services.find(s => s.id === bookingData.serviceId);
        totalDuration = service?.duration || 60;
      }

      // Get appointment location if available
      const appointmentLocation = bookingData.serviceAddress ? {
        lat: bookingData.serviceAddress.latitude,
        lng: bookingData.serviceAddress.longitude
      } : undefined;

      // Use store's smart availability calculation
      const slots = calculateAvailableSlots(
        bookingData.providerId,
        selectedDate,
        totalDuration,
        appointmentLocation
      );

      setAvailableSlots(slots);

      if (slots.length === 0) {
        setError('No available time slots for this date. Please choose another date.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load available times');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return; // Don't allow past dates
    
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    setSelectedTimeSlot('');
    setError(null);
  };

  const handleTimeSlotSelect = (startTime: string) => {
    setSelectedTimeSlot(startTime);
    // Combine date and time for full datetime string
    const fullDateTime = `${selectedDate}T${startTime}:00`;
    updateBookingData({ scheduledStartTime: fullDateTime });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Parse "HH:MM" format (e.g., "08:00", "14:30")
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
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

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Date & Time</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select your preferred date and time for the service appointment.
        </p>
      </div>

      {/* Calendar */}
      <div>
        <div className="bg-white border rounded-lg p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h4 className="text-lg font-medium">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendar.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                disabled={isDateDisabled(date)}
                className={`
                  p-2 text-sm rounded-lg transition-colors relative
                  ${!isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'}
                  ${isDateDisabled(date) 
                    ? 'cursor-not-allowed text-gray-300' 
                    : 'hover:bg-gray-100 cursor-pointer'
                  }
                  ${isDateSelected(date) 
                    ? 'bg-teal-600 text-white hover:bg-teal-700' 
                    : ''
                  }
                `}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-teal-600 mr-2" />
            <span className="font-medium text-teal-900">
              {formatDate(new Date(selectedDate))}
            </span>
          </div>
        </div>
      )}

      {/* Available Time Slots */}
      {selectedDate && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Available Time Slots
          </h4>
          
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => {
                const getReasonIcon = () => {
                  if (slot.available) return null;
                  switch (slot.reason) {
                    case 'lunch':
                      return <Coffee className="h-3 w-3" />;
                    case 'booked':
                      return <CalendarX className="h-3 w-3" />;
                    case 'travel':
                      return <Car className="h-3 w-3" />;
                    default:
                      return null;
                  }
                };

                const getReasonTooltip = () => {
                  switch (slot.reason) {
                    case 'lunch':
                      return 'Lunch break';
                    case 'booked':
                      return 'Already booked';
                    case 'travel':
                      return 'Travel time needed';
                    case 'closed':
                      return 'Closed';
                    default:
                      return 'Unavailable';
                  }
                };

                return (
                  <button
                    key={slot.startTime}
                    onClick={() => handleTimeSlotSelect(slot.startTime)}
                    disabled={!slot.available}
                    title={!slot.available ? getReasonTooltip() : undefined}
                    className={`
                      p-3 text-sm font-medium rounded-lg border transition-all relative
                      ${slot.startTime === selectedTimeSlot
                        ? 'bg-teal-600 text-white border-teal-600'
                        : slot.available
                        ? 'bg-white text-gray-900 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                        : slot.reason === 'lunch'
                        ? 'bg-amber-50 text-amber-400 border-amber-200 cursor-not-allowed'
                        : slot.reason === 'booked'
                        ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed'
                        : slot.reason === 'travel'
                        ? 'bg-blue-50 text-blue-400 border-blue-200 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {formatTime(slot.startTime)}
                      {!slot.available && getReasonIcon()}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No available time slots for this date.</p>
              <p className="text-sm text-gray-400 mt-1">Please choose another date.</p>
            </div>
          )}

          {/* Legend for unavailable slot reasons */}
          {availableSlots.length > 0 && availableSlots.some(s => !s.available) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Unavailable slots:</p>
              <div className="flex flex-wrap gap-3 text-xs">
                {availableSlots.some(s => s.reason === 'booked') && (
                  <div className="flex items-center gap-1 text-red-500">
                    <CalendarX className="h-3 w-3" />
                    <span>Already booked</span>
                  </div>
                )}
                {availableSlots.some(s => s.reason === 'lunch') && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Coffee className="h-3 w-3" />
                    <span>Lunch break</span>
                  </div>
                )}
                {availableSlots.some(s => s.reason === 'travel') && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Car className="h-3 w-3" />
                    <span>Travel time</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Time Display */}
      {selectedTimeSlot && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">
              Appointment scheduled for {formatTime(selectedTimeSlot)}
            </span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedTimeSlot && (
        <div className="pt-4">
          <button
            onClick={onNext}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Continue to Address
          </button>
        </div>
      )}
    </div>
  );
}